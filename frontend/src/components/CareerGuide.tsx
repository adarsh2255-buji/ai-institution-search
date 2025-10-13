import { useState } from "react"
import { motion } from "framer-motion"
import api from "../api/client"

type Recommendation = {
  id: number
  institute: string
  course: string
  fee: number
  duration: string
  location: string
  description?: string
  reason?: string
}

export default function CareerGuide() {
  const [qualification, setQualification] = useState("")
  const [interest, setInterests] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [results, setResults] = useState<Recommendation[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setLoading(true)
    setError(null)
    setMessage(null)
    setResults([])

    try {
      const payload = {
        qualification,
        interest,
      }
      const res = await api.post<{ status: string; message?: string; matches: any[] }>(
        "courses/recommend/",
        payload
      )
      console.log("Recommend response:", res.data)

      const status = res.data?.status || "recommendations"
      if (status !== "recommendations") {
        setMessage(res.data?.message || "Here are some suggested courses based on your input.")
      }

      const matches = Array.isArray(res.data?.matches) ? res.data.matches : []
      const mapped: Recommendation[] = matches.map((m, idx) => ({
        id: idx + 1,
        institute: (m.institute || "").toString(),
        course: (m.course || "").toString(),
        fee: Number(m.fee) || 0,
        duration: (m.duration || "").toString(),
        location: (m.location || "").toString(),
        description: m.description,
        reason: m.reason,
      }))
      setResults(mapped)
    } catch (err: any) {
      setError(err?.message || "Failed to get recommendations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white pt-24 px-6 pb-16">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Not sure which course to choose?
          </h1>
          <p className="text-gray-300 mt-3">
            Tell us about your current qualification and your interests. We’ll help you discover
            courses that match your strengths and goals.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-2xl bg-gray-900/60 border border-purple-500/20 backdrop-blur-md p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Your Highest Qualification
              </label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g., 12th Grade, Diploma in IT, B.Sc Computer Science"
                className="w-full px-4 py-3 rounded-lg bg-black/60 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                Your Interests (comma separated)
              </label>
              <input
                type="text"
                value={interest}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g., web development, data science, AI, cybersecurity"
                className="w-full px-4 py-3 rounded-lg bg-black/60 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 outline-none"
                required
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              Get Guidance
            </motion.button>
          </form>

          {(submitted || loading || error || message || results.length > 0) && (
            <div className="mt-6">
              {loading && (
                <p className="text-gray-300">Analyzing your inputs and preparing recommendations...</p>
              )}
              {!loading && message && (
                <div className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  {message}
                </div>
              )}
              {!loading && error && (
                <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
                  {error}
                </div>
              )}
              {!loading && results.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                  {results.map((rec) => (
                    <div key={rec.id} className="p-5 rounded-xl bg-gray-800/60 border border-gray-700 hover:border-cyan-500/40 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-cyan-300">{rec.course}</h3>
                          <p className="text-gray-400 text-sm mb-2">{rec.institute}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                            <span className="flex items-center gap-1">
                              <span className="text-gray-500">📍</span>
                              {rec.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-gray-500">⏱️</span>
                              {rec.duration}{rec.duration && !rec.duration.toLowerCase().includes("month") ? " months" : ""}
                            </span>
                          </div>
                          {rec.description && (
                            <p className="text-gray-400 text-sm mt-2">{rec.description}</p>
                          )}
                          {rec.reason && rec.reason.trim().length > 0 && (
                            <div className="mt-3 p-3 rounded border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm">
                              Why this match: {rec.reason}
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-400">Estimated Fee</p>
                          <p className="text-xl font-semibold text-white">₹{rec.fee.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        <div className="max-w-3xl mx-auto mt-10 text-gray-400 text-sm leading-6">
          <p>
            Tip: Be as specific as possible about your interests (e.g., “frontend with React”,
            “business analytics”, “cloud security”). The more details you provide, the better the
            recommendations will be.
          </p>
        </div>
      </div>
    </div>
  )
}


