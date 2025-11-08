-- =====================================================
-- ORATO NOTIFICATIONS SYSTEM
-- Database Schema for User Notifications
-- =====================================================

-- Main notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'challenge_reminder', 'weekly_summary', 'coach_recommendation', 'word_of_day', 'achievement', 'general'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500), -- URL to navigate when notification is clicked
    metadata JSONB DEFAULT '{}', -- Additional data specific to notification type
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration date for time-sensitive notifications
    priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
    CONSTRAINT valid_priority CHECK (priority BETWEEN 1 AND 3)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- Scheduled notifications (for reminders and recurring notifications)
CREATE TABLE IF NOT EXISTS scheduled_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    schedule_type VARCHAR(20) NOT NULL, -- 'once', 'daily', 'weekly', 'monthly'
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    last_sent_at TIMESTAMP WITH TIME ZONE,
    next_send_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    title_template VARCHAR(255) NOT NULL,
    message_template TEXT NOT NULL,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for scheduled notifications
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_user_id ON scheduled_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_next_send ON scheduled_notifications(next_send_at) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_active ON scheduled_notifications(is_active);

-- Notification preferences (extends user_preferences table)
-- Note: Main preference toggles already exist in user_preferences table
-- This table stores specific notification type preferences
CREATE TABLE IF NOT EXISTS notification_type_preferences (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    channel_email BOOLEAN DEFAULT TRUE,
    channel_push BOOLEAN DEFAULT TRUE,
    channel_in_app BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, type)
);

-- Index for notification type preferences
CREATE INDEX IF NOT EXISTS idx_notification_type_prefs_user_id ON notification_type_preferences(user_id);

-- Notification delivery log (track sent emails/push notifications)
CREATE TABLE IF NOT EXISTS notification_delivery_log (
    id BIGSERIAL PRIMARY KEY,
    notification_id BIGINT REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL, -- 'email', 'push', 'in_app'
    status VARCHAR(20) NOT NULL, -- 'pending', 'sent', 'failed', 'delivered', 'read'
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Index for delivery log
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_user_id ON notification_delivery_log(user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id BIGINT, uid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications
    SET is_read = TRUE,
        read_at = TIMEZONE('utc', NOW())
    WHERE id = notification_id AND user_id = uid AND is_read = FALSE;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(uid UUID)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications
    SET is_read = TRUE,
        read_at = TIMEZONE('utc', NOW())
    WHERE user_id = uid AND is_read = FALSE;

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_count(uid UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO unread_count
    FROM notifications
    WHERE user_id = uid
      AND is_read = FALSE
      AND (expires_at IS NULL OR expires_at > TIMEZONE('utc', NOW()));

    RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old/expired notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete notifications older than 30 days that are read
    -- OR expired notifications
    DELETE FROM notifications
    WHERE (is_read = TRUE AND created_at < TIMEZONE('utc', NOW()) - INTERVAL '30 days')
       OR (expires_at IS NOT NULL AND expires_at < TIMEZONE('utc', NOW()));

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scheduled_notifications_updated_at
    BEFORE UPDATE ON scheduled_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_type_preferences_updated_at
    BEFORE UPDATE ON notification_type_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_type_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- Policies for notifications table
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- Service role can insert notifications
CREATE POLICY "Service can insert notifications"
    ON notifications FOR INSERT
    WITH CHECK (true);

-- Policies for scheduled_notifications table
CREATE POLICY "Users can view their own scheduled notifications"
    ON scheduled_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own scheduled notifications"
    ON scheduled_notifications FOR ALL
    USING (auth.uid() = user_id);

-- Policies for notification_type_preferences table
CREATE POLICY "Users can view their own notification preferences"
    ON notification_type_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own notification preferences"
    ON notification_type_preferences FOR ALL
    USING (auth.uid() = user_id);

-- Policies for notification_delivery_log table
CREATE POLICY "Users can view their own delivery logs"
    ON notification_delivery_log FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert/update delivery logs
CREATE POLICY "Service can manage delivery logs"
    ON notification_delivery_log FOR ALL
    WITH CHECK (true);

-- =====================================================
-- SAMPLE NOTIFICATION TYPE PREFERENCES
-- =====================================================
-- These will be created when a user first accesses notifications

-- Example default notification type preferences:
-- INSERT INTO notification_type_preferences (user_id, type, enabled) VALUES
-- (user_id, 'challenge_reminder', TRUE),
-- (user_id, 'weekly_summary', TRUE),
-- (user_id, 'coach_recommendation', TRUE),
-- (user_id, 'word_of_day', TRUE),
-- (user_id, 'achievement', TRUE);
