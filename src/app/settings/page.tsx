"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  UserCircleIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CameraIcon,
  DocumentArrowDownIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import CEFRLevelDisplay from "@/components/CEFRLevelDisplay";

interface UserProfile {
  full_name: string;
  display_name: string;
  bio: string;
  profile_photo_url: string | null;
  date_of_birth: string;
  country: string;
  native_language: string;
}

interface UserPreferences {
  target_accent: string;
  learning_focus: string;
  difficulty_preference: string;
  daily_goal_minutes: number;
  theme: string;
  language: string;
  timezone: string;
  email_notifications: boolean;
  push_notifications: boolean;
  daily_reminder: boolean;
  reminder_time: string;
  weekly_report: boolean;
  profile_visibility: string;
  show_progress: boolean;
  allow_leaderboard: boolean;
}

interface CEFRLevel {
  level: string;
  overall_score: number;
  cefr_descriptions: {
    title: string;
    description: string;
    can_do: string[];
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    full_name: "",
    display_name: "",
    bio: "",
    profile_photo_url: null,
    date_of_birth: "",
    country: "",
    native_language: "",
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    target_accent: "american",
    learning_focus: "balanced",
    difficulty_preference: "adaptive",
    daily_goal_minutes: 15,
    theme: "light",
    language: "en",
    timezone: "UTC",
    email_notifications: true,
    push_notifications: true,
    daily_reminder: true,
    reminder_time: "09:00",
    weekly_report: true,
    profile_visibility: "public",
    show_progress: true,
    allow_leaderboard: true,
  });

  const [cefrLevel, setCefrLevel] = useState<CEFRLevel | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.ok) {
        if (data.profile) setProfile(data.profile);
        if (data.preferences) setPreferences(data.preferences);
        if (data.cefrLevel) setCefrLevel(data.cefrLevel);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.ok) {
        showMessage("Profile updated successfully!", "success");
      } else {
        showMessage(data.error || "Failed to update profile", "error");
      }
    } catch (error) {
      showMessage("Error updating profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (data.ok) {
        showMessage("Preferences updated successfully!", "success");

        // Update theme if changed
        if (preferences.theme !== theme) {
          setTheme(preferences.theme);
        }
      } else {
        showMessage(data.error || "Failed to update preferences", "error");
      }
    } catch (error) {
      showMessage("Error updating preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await fetch("/api/generate-report");

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orato-progress-report-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showMessage("Report downloaded successfully!", "success");
      } else {
        showMessage("Failed to generate report", "error");
      }
    } catch (error) {
      showMessage("Error downloading report", "error");
    } finally {
      setDownloading(false);
    }
  };

  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: UserCircleIcon },
    { id: "preferences", label: "Preferences", icon: CogIcon },
    { id: "notifications", label: "Notifications", icon: BellIcon },
    { id: "privacy", label: "Privacy", icon: ShieldCheckIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-2xl p-8 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        {/* Message Toast */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
              messageType === "success"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <CheckCircleIcon
              className={`w-5 h-5 ${messageType === "success" ? "text-green-600" : "text-red-600"}`}
            />
            <span className={messageType === "success" ? "text-green-800" : "text-red-800"}>
              {message}
            </span>
          </motion.div>
        )}

        {/* Download Report Button */}
        <div className="mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownloadReport}
            disabled={downloading}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 flex items-center gap-2"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            {downloading ? "Generating Report..." : "Download Progress Report (PDF)"}
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>

                  {/* Profile Photo */}
                  <div className="mb-8">
                    <ProfilePhotoUpload
                      currentPhotoUrl={profile.profile_photo_url}
                      onPhotoUpdate={(url) => {
                        setProfile({ ...profile, profile_photo_url: url });
                        fetchProfile();
                      }}
                    />
                  </div>

                  {/* CEFR Level Display */}
                  {cefrLevel && (
                    <div className="mb-8">
                      <CEFRLevelDisplay cefrLevel={cefrLevel} />
                    </div>
                  )}

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.full_name || ""}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={profile.display_name || ""}
                        onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="How should we call you?"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profile.bio || ""}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={profile.date_of_birth || ""}
                          onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={profile.country || ""}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Your country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Native Language
                      </label>
                      <input
                        type="text"
                        value={profile.native_language || ""}
                        onChange={(e) => setProfile({ ...profile, native_language: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., Spanish, French, Arabic"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Profile"}
                  </motion.button>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === "preferences" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Preferences</h2>

                  <div className="space-y-6">
                    {/* Theme Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: "light", icon: SunIcon, label: "Light" },
                          { value: "dark", icon: MoonIcon, label: "Dark" },
                          { value: "system", icon: ComputerDesktopIcon, label: "System" },
                        ].map((themeOption) => (
                          <button
                            key={themeOption.value}
                            onClick={() => {
                              setPreferences({ ...preferences, theme: themeOption.value });
                              setTheme(themeOption.value);
                            }}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              preferences.theme === themeOption.value
                                ? "border-purple-500 bg-purple-50"
                                : "border-gray-200 hover:border-purple-300"
                            }`}
                          >
                            <themeOption.icon className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                            <div className="text-sm font-medium text-gray-900">{themeOption.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target Accent */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Accent
                      </label>
                      <select
                        value={preferences.target_accent}
                        onChange={(e) => setPreferences({ ...preferences, target_accent: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="american">American English</option>
                        <option value="british">British English</option>
                        <option value="australian">Australian English</option>
                        <option value="neutral">Neutral</option>
                      </select>
                    </div>

                    {/* Learning Focus */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Learning Focus
                      </label>
                      <select
                        value={preferences.learning_focus}
                        onChange={(e) => setPreferences({ ...preferences, learning_focus: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="fluency">Fluency</option>
                        <option value="grammar">Grammar</option>
                        <option value="vocabulary">Vocabulary</option>
                        <option value="pronunciation">Pronunciation</option>
                        <option value="balanced">Balanced (Recommended)</option>
                      </select>
                    </div>

                    {/* Difficulty Preference */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Preference
                      </label>
                      <select
                        value={preferences.difficulty_preference}
                        onChange={(e) => setPreferences({ ...preferences, difficulty_preference: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                        <option value="adaptive">Adaptive (Recommended)</option>
                      </select>
                    </div>

                    {/* Daily Goal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Daily Goal (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={preferences.daily_goal_minutes}
                        onChange={(e) => setPreferences({ ...preferences, daily_goal_minutes: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Current: {preferences.daily_goal_minutes} minutes/day
                      </p>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Preferences"}
                  </motion.button>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h2>

                  <div className="space-y-4">
                    {[
                      { key: "email_notifications", label: "Email Notifications", desc: "Receive updates via email" },
                      { key: "push_notifications", label: "Push Notifications", desc: "Browser notifications" },
                      { key: "daily_reminder", label: "Daily Reminder", desc: "Remind me to practice daily" },
                      { key: "weekly_report", label: "Weekly Progress Report", desc: "Get weekly summary emails" },
                    ].map((notif) => (
                      <div key={notif.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{notif.label}</h3>
                          <p className="text-sm text-gray-600">{notif.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[notif.key as keyof UserPreferences] as boolean}
                            onChange={(e) => setPreferences({ ...preferences, [notif.key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}

                    {/* Reminder Time */}
                    {preferences.daily_reminder && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reminder Time
                        </label>
                        <input
                          type="time"
                          value={preferences.reminder_time}
                          onChange={(e) => setPreferences({ ...preferences, reminder_time: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </motion.button>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === "privacy" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy Settings</h2>

                  <div className="space-y-4">
                    {/* Profile Visibility */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Visibility
                      </label>
                      <select
                        value={preferences.profile_visibility}
                        onChange={(e) => setPreferences({ ...preferences, profile_visibility: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="public">Public - Anyone can see</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private - Only me</option>
                      </select>
                    </div>

                    {/* Privacy Toggles */}
                    {[
                      { key: "show_progress", label: "Show Progress", desc: "Display my learning progress publicly" },
                      { key: "allow_leaderboard", label: "Leaderboard Participation", desc: "Include me in leaderboards" },
                    ].map((privacy) => (
                      <div key={privacy.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-medium text-gray-900">{privacy.label}</h3>
                          <p className="text-sm text-gray-600">{privacy.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences[privacy.key as keyof UserPreferences] as boolean}
                            onChange={(e) => setPreferences({ ...preferences, [privacy.key]: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSavePreferences}
                    disabled={saving}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
