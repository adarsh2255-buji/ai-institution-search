import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Search, BookOpen, MapPin, Clock, DollarSign } from "lucide-react"

export default function UserHome() {
  const [user, setUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    // Get user info from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      // Redirect to login if no user data
      navigate("/login")
    }
  }, [navigate])

  

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">
              Welcome back, {user.username || user.name || "User"}!
            </h1>
            <p className="text-gray-400 text-sm">Discover your perfect course</p>
          </div>
          {/* <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Find Your Perfect Course
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Search through thousands of courses and institutions to find the perfect match for your career goals.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for courses, institutions, or skills..."
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-800/60 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-medium hover:shadow-lg transition-all"
              >
                Search
              </button>
            </div>
          </form>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <div
            onClick={() => navigate("/courses")}
            className="p-6 rounded-xl bg-gray-800/60 border border-gray-700 hover:border-purple-500/50 cursor-pointer transition-all hover:transform hover:scale-105"
          >
            <BookOpen className="text-purple-400 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">Browse Courses</h3>
            <p className="text-gray-400 text-sm">Explore all available courses</p>
          </div>

          <div
            onClick={() => navigate("/institutions")}
            className="p-6 rounded-xl bg-gray-800/60 border border-gray-700 hover:border-cyan-500/50 cursor-pointer transition-all hover:transform hover:scale-105"
          >
            <MapPin className="text-cyan-400 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">Find Institutions</h3>
            <p className="text-gray-400 text-sm">Discover top institutions</p>
          </div>

          <div
            onClick={() => navigate("/career-guide")}
            className="p-6 rounded-xl bg-gray-800/60 border border-gray-700 hover:border-green-500/50 cursor-pointer transition-all hover:transform hover:scale-105"
          >
            <Clock className="text-green-400 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">AI Career Guide</h3>
            <p className="text-gray-400 text-sm">Get personalized recommendations</p>
          </div>

          <div
            onClick={() => navigate("/compare")}
            className="p-6 rounded-xl bg-gray-800/60 border border-gray-700 hover:border-yellow-500/50 cursor-pointer transition-all hover:transform hover:scale-105"
          >
            <DollarSign className="text-yellow-400 mb-4" size={32} />
            <h3 className="text-lg font-semibold mb-2">Compare Costs</h3>
            <p className="text-gray-400 text-sm">Compare course fees and duration</p>
          </div>
        </motion.div>

        {/* Recent Activity or Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-gray-800/60 rounded-xl border border-gray-700 p-6"
        >
          <h3 className="text-xl font-semibold mb-4 text-cyan-400">
            Recommended for You
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder recommendation cards */}
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="p-4 rounded-lg bg-gray-900/60 border border-gray-600 hover:border-purple-500/50 transition-colors"
              >
                <h4 className="font-semibold mb-2">Web Development Course</h4>
                <p className="text-gray-400 text-sm mb-2">
                  Learn modern web development with React, Node.js, and more.
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>6 months</span>
                  <span>₹45,000</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
