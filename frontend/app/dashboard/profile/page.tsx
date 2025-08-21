"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Layout from "@/app/dashboard/components/layout/Layout";
import { useRouter } from "next/navigation"; // useRouter को import करें

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    avatar: "/gk-icon.png",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  const [token, setToken] = useState("");
  const router = useRouter(); // useRouter का उपयोग करें

  // Load token from localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const t = localStorage.getItem("token");
      if (t) setToken(t);
    }
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get("http://localhost:5000/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser({
          name: data.name || "",
          email: data.email || "",
          company: data.company || "",
          phone: data.phone || "",
          avatar: data.avatar || "/gk-icon.png",
        });
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // Update profile info (without password)
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const { data } = await axios.put(
        "http://localhost:5000/api/profile",
        {
          name: user.name,
          email: user.email,
          company: user.company,
          phone: user.phone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Profile updated successfully!");
      setUser(data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Change password with old password verification
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);
      await axios.put(
        "http://localhost:5000/api/profile/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Password changed successfully!");

      // पासवर्ड बदलने के बाद टोकन हटाएँ और लॉगिन पेज पर भेजें
      localStorage.removeItem("token");
      router.push("/login");

    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Forgot password
  const handleForgotPassword = async () => {
    if (!forgotEmail) return alert("Enter your email");

    try {
      const { data } = await axios.post("http://localhost:5000/api/forgot-password", { email: forgotEmail });
      setForgotMessage(data.message);
    } catch (err: any) {
      setForgotMessage(err.response?.data?.message || "Failed to send reset email");
    }
  };

  if (loading) return <Layout><p className="text-center mt-12">Loading profile...</p></Layout>;

  return (
    <Layout>
      <main className="max-w-5xl mx-auto mt-12 p-6 bg-white shadow-lg rounded-xl space-y-12">
        <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
        {error && <p className="text-red-600">{error}</p>}

        {/* Profile Section */}
        <div className="flex flex-col md:flex-row md:items-start md:space-x-10">
          <div className="flex flex-col items-center md:items-start mb-8 md:mb-0">
            <Avatar className="w-32 h-32 mb-4">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <Button className="px-4 py-2 text-sm" onClick={() => alert("Upload avatar coming soon!")}>
              Change Avatar
            </Button>
          </div>

          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["name", "email", "company", "phone"].map((field) => (
                <div key={field}>
                  <label className="block mb-2 font-medium text-gray-700">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <Input name={field} value={user[field as keyof typeof user]} onChange={(e) => setUser({...user, [field]: e.target.value})} />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="pt-6 border-t border-gray-200 space-y-4">
          <h2 className="text-2xl font-semibold">Change Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="password" placeholder="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <Button onClick={handleChangePassword} className="bg-green-600 hover:bg-green-700 text-white" disabled={passwordSaving}>
            {passwordSaving ? "Saving..." : "Change Password"}
          </Button>
        </div>

        {/* Forgot Password Section */}
        <div className="pt-6 border-t border-gray-200 space-y-4">
          <h2 className="text-2xl font-semibold">Forgot Password</h2>
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
            <Input type="email" placeholder="Enter your email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
            <Button onClick={handleForgotPassword} className="bg-orange-600 hover:bg-orange-700 text-white">
              Send Reset Link
            </Button>
          </div>
          {forgotMessage && <p className="text-green-600">{forgotMessage}</p>}
        </div>
      </main>
    </Layout>
  );
}
