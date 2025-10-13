import axios from "axios";
import { useState } from "react";

export default function CreateUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/users/register/",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );
      const data = res.data as { error?: string } | undefined;
      if (res.status >= 200 && res.status < 300) setMessage("User created successfully!");
      else setMessage(data?.error || "Failed to create user");
    } catch (err: any) {
      const apiError = err?.response?.data?.error || err?.message || "Error connecting to server";
      setMessage(apiError);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      {/* Background Glows */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-20 left-20 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl bottom-20 right-20 animate-pulse"></div>
      </div>

      {/* Form */}
      <div className="relative z-10 w-full max-w-md px-6">
        <h1 className="text-4xl font-extrabold text-cyan-400 text-center mb-8">
          Create Account
        </h1>
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-3 rounded-full bg-gray-800/60 border border-gray-600 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-full bg-gray-800/60 border border-gray-600 text-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/50 transition"
          >
            Create Account
          </button>
        </form>
        {message && <p className="mt-4 text-center text-lg text-purple-400">{message}</p>}
      </div>
    </section>
  );
}
