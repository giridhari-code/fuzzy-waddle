"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
      });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        alert("Login Successful ✅");
        router.push("/dashboard");
      } else {
        setError("Invalid credentials");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Login to KaloOne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-600 text-center">{error}</p>}
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-center text-sm text-gray-500 mt-2">
            Don’t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Sign up
            </a>
          </p>

          <p className="text-center text-sm text-gray-500 mt-1">
            Forgot password?{" "}
            <a href="/forgot-password" className="text-blue-600 hover:underline">
              Reset here
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
    <Footer />
    </>
  );
}
