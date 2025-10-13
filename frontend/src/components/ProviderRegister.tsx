import { useState } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function ProviderRegister() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const response = await axios.post(
        "/api/provider/register/",
        { username, password },
        { withCredentials: true }
      )

      if (response.status === 201 || response.data?.success) {
        setSuccess("Registration successful. You can now log in.")
        setTimeout(() => navigate("/login"), 1200)
      } else {
        setError(response.data?.message || "Registration failed")
      }
    } catch (err: any) {
      const serverMessage = err?.response?.data?.message || err?.response?.data || "Something went wrong. Please try again."
      setError(typeof serverMessage === "string" ? serverMessage : "Something went wrong. Please try again.")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-gray-900/60 backdrop-blur-md border border-cyan-500/30"
      >
        <h2 className="text-3xl font-bold text-center text-cyan-400 mb-6">
          Provider Register
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-cyan-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/70 border border-cyan-500/40 text-cyan-200 focus:ring-2 focus:ring-cyan-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-cyan-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-black/70 border border-cyan-500/40 text-cyan-200 focus:ring-2 focus:ring-cyan-400 outline-none"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px #06b6d4" }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-2 rounded-lg bg-cyan-500 text-black font-bold tracking-wide"
          >
            Register
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}


