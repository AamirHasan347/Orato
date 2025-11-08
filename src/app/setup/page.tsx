"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
const { supabase, user } = useSupabase();
import { useSupabase } from "../supabase-provider";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [interests, setInterests] = useState("");
  const [accentPreference, setAccentPreference] = useState("");

  // Fetch current profile if exists
  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") console.error(error);
      if (data) {
        setFullName(data.full_name || "");
        setInterests(data.interests?.join(", ") || "");
        setAccentPreference(data.accent_preference || "");
      }

      setLoading(false);
    };

    getProfile();
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("profiles").upsert({
      user_id: user.id,
      full_name: fullName,
      interests: interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      accent_preference: accentPreference,
      updated_at: new Date(),
    });

    if (error) {
      console.error("Error saving profile:", error);
      alert("Could not save profile. Check console for details.");
    } else {
      alert("Profile saved successfully!");
      router.push("/dashboard");
    }

    setLoading(false);
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FFF7DD]">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#80A1BA]">
          Complete Your Profile
        </h1>

        <label className="block mb-4">
          <span className="text-gray-700">Full Name</span>
          <input
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700">Interests (comma-separated)</span>
          <input
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g. movies, travel, coding"
          />
        </label>

        <label className="block mb-6">
          <span className="text-gray-700">Accent Preference</span>
          <select
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
            value={accentPreference}
            onChange={(e) => setAccentPreference(e.target.value)}
          >
            <option value="">Select Accent</option>
            <option value="american">American</option>
            <option value="british">British</option>
            <option value="indian">Indian</option>
            <option value="neutral">Neutral</option>
          </select>
        </label>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-[#91C4C3] text-white font-semibold py-2 px-4 rounded hover:bg-[#80A1BA] transition"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
