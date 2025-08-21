"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../dashboard/components/layout/Layout";
import ProtectedRoute from "../../components/ProtectedRoute";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "sonner";

const SettingsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (!token) {
      router.push("/login");
    } else {
      setLoading(false);
    }
  }, [router, token]);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg font-semibold">Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
              <CardDescription>
                Update your account settings. Set your preferred language and communication preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* यहां सेटिंग्स के लिए फॉर्म और अन्य कंपोनेंट आएंगे */}
              <div className="text-gray-500">
                Coming Soon: Profile, Password, Notifications...
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
      <Toaster />
    </ProtectedRoute>
  );
};

export default SettingsPage;
