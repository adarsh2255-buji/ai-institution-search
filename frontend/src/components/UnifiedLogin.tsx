import { useState } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import api from "../api/client"

export default function UnifiedLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Try to login with a unified endpoint that returns role information
      const response = await api.post("/courses/login/", {
        username,
        password,
      })
      console.log("Login response:", response.data)
      if (response.data.token && response.data.role) {
        localStorage.setItem("token", response.data.token)
        localStorage.setItem("user", JSON.stringify({ username: response.data.username, role: response.data.role }))

        // Dispatch custom event to notify Header component
        window.dispatchEvent(new Event("authChange"))

        switch (response.data.role) {
          case "admin":
            navigate("/admin/dashboard")
            break
          case "provider":
            navigate("/provider/dashboard")
            break
          case "user":
            navigate("/user/home")
            break
          default:
            setError("Unknown user role. Please contact support.")
            return
        }
      }
    } catch (err: any) {
      console.error("Login error:", err)
      const serverMessage = err?.response?.data?.message || 
                           err?.response?.data?.error || 
                           err?.response?.data || 
                           "Something went wrong. Please try again."
      setError(typeof serverMessage === "string" ? serverMessage : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-16 left-16 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl bottom-16 right-16 animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-md p-8 rounded-2xl shadow-2xl bg-gray-900/60 backdrop-blur-md border border-gradient-to-r from-purple-500/30 to-cyan-500/30"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-sm">
            Sign in to access your dashboard
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-center text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all"
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold tracking-wide shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign In"
            )}
          </motion.button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Sign up here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}