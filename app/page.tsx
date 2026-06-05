"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "login failed");
        return;
      }

      router.push("/workout");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("login failed");
    }
  }

  async function handleSignUp() {
    setMessage("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "signup failed");
        return;
      }

      setMessage("signup successful; you can now log in");
    } catch (error) {
      console.error("Signup error:", error);
      setMessage("signup failed");
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Workout Tracker</h1>
        <p className="text-slate-400 mb-8">
          Log in to track your workouts.
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Username
            </label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              className="w-full rounded-lg bg-slate-800 border border-slate-700 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          {message && (
            <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200">
              {message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleLogin}
              className="flex-1 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-3 font-semibold"
            >
              Log In
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              className="flex-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-3 font-semibold"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}