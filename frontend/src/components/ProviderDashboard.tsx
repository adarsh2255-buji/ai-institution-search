import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Plus, Building, MapPin, BookOpen, Clock, DollarSign, Tag, Edit, X, Trash2 } from "lucide-react"
import api from "../api/client"

export default function ProviderDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [institutions, setInstitutions] = useState<any[]>([])
  const [selectedInstitution, setSelectedInstitution] = useState<any | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [showInstitutionForm, setShowInstitutionForm] = useState(false)
  const [courseData, setCourseData] = useState({
    course: "",
    keywords: "",
    duration: "",
    fees: "",
    description: "",
    mode: "Offline", // Default value
  })
  const [institutionData, setInstitutionData] = useState({
    institution: "",
    location: "",
    latitude: "",
    longitude: "",
    id: undefined as number | undefined,
  })
  const [editInstitutionId, setEditInstitutionId] = useState<number | null>(null)
  const [editCourseId, setEditCourseId] = useState<number | null>(null)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showCoursesPopup, setShowCoursesPopup] = useState(false)
  const navigate = useNavigate()

  // Fetch user and institutions on mount
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "provider") {
        navigate("/login")
        return
      }
      setUser(parsedUser)
      fetchInstitutions(parsedUser)
    } else {
      navigate("/login")
    }
  }, [navigate])

  // Fetch all institutions for provider
  const fetchInstitutions = async (parsedUser: any) => {
    setIsLoading(true)
    try {
      const response = await api.get("/courses/provider-institutes/")
      setInstitutions(response.data)
      // Optionally select the first institution by default
      if (response.data.length > 0) {
        setSelectedInstitution(response.data[0])
        fetchCourses(response.data[0].id)
      }
    } catch (err) {
      setMessage("Failed to fetch institutions.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch courses for a given institution
  const fetchCourses = async (institutionId: number) => {
    setIsLoading(true)
    try {
      const response = await api.get(`/courses/institutes/${institutionId}/details/`)
      // The courses are inside response.data.courses
      setCourses(Array.isArray(response.data.courses) ? response.data.courses : [])
    } catch (err) {
      setCourses([])
      setMessage("Failed to fetch courses.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle institution selection
  const handleSelectInstitution = (inst: any) => {
    setSelectedInstitution(inst)
    fetchCourses(inst.id)
    setShowCoursesPopup(true)
    setMessage("")
  }

  // Handle institution edit
  const handleEditInstitution = (inst: any) => {
    setEditInstitutionId(inst.id)
    setInstitutionData({
      institution: inst.name,
      location: inst.location,
      latitude: inst.latitude,
      longitude: inst.longitude,
      id: inst.id,
    })
    setShowInstitutionForm(true)
  }

  // Handle course edit
  const handleEditCourse = (course: any) => {
    setEditCourseId(course.id)
    setCourseData({
      course: course.name,
      keywords: Array.isArray(course.keywords) ? course.keywords.join(", ") : course.keywords || "",
      duration: course.duration,
      fees: course.fee,
      description: course.description || "",
      mode: course.mode || "Offline",
    })
    setShowCourseForm(true)
  }

  // Handle institution form submit (add or edit)
  const handleInstitutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    try {
      let response
      if (editInstitutionId) {
        // Edit institution
        response = await api.put(`/courses/institutes/${editInstitutionId}/edit/`, {
          name: institutionData.institution,
          location: institutionData.location,
          latitude: institutionData.latitude,
          longitude: institutionData.longitude,
        })
        setMessage("Institution updated successfully!")
      } else {
        // Add institution
        response = await api.post("/courses/add-institute/", {
          name: institutionData.institution,
          location: institutionData.location,
          latitude: institutionData.latitude,
          longitude: institutionData.longitude,
        })
        setMessage("Institution added successfully!")
      }
      setShowInstitutionForm(false)
      setEditInstitutionId(null)
      setInstitutionData({
        institution: "",
        location: "",
        latitude: "",
        longitude: "",
        id: undefined,
      })
      fetchInstitutions(user)
    } catch (err: any) {
      setMessage("Failed to save institution.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle course form submit (add or edit)
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    try {
      if (!selectedInstitution) {
        setMessage("Please select an institution first.")
        setIsLoading(false)
        return
      }
      let response
      const payload = {
        institute: selectedInstitution.id,
        name: courseData.course,
        keywords: courseData.keywords.split(",").map(k => k.trim()).filter(Boolean),
        duration: courseData.duration,
        fee: courseData.fees,
        description: courseData.description,
        mode: courseData.mode, // <-- Include mode
      }
      if (editCourseId) {
        response = await api.put(`/courses/courses/${editCourseId}/edit/`, payload)
        setMessage("Course updated successfully!")
      } else {
        response = await api.post("/courses/add-course/", payload)
        setMessage("Course added successfully!")
      }
      setEditCourseId(null)
      setCourseData({
        course: "",
        keywords: "",
        duration: "",
        fees: "",
        description: "",
        mode: "Offline",
      })
      setShowCourseForm(false)
      fetchCourses(selectedInstitution.id)
    } catch (err: any) {
      setMessage("Failed to save course.")
    } finally {
      setIsLoading(false)
    }
  }

  // Delete institution and its courses
  const handleDeleteInstitution = async (instId: number) => {
    if (!window.confirm("Are you sure you want to delete this institution and all its courses?")) return
    setIsLoading(true)
    setMessage("")
    try {
      await api.delete(`/courses/institutes/${instId}/delete/`)
      setMessage("Institution deleted successfully!")
      setShowCoursesPopup(false)
      setSelectedInstitution(null)
      fetchInstitutions(user)
    } catch (err) {
      setMessage("Failed to delete institution.")
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a single course
  const handleDeleteCourse = async (courseId: number) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return
    setIsLoading(true)
    setMessage("")
    try {
      await api.delete(`/courses/courses/${courseId}/delete/`)
      setMessage("Course deleted successfully!")
      if (selectedInstitution) fetchCourses(selectedInstitution.id)
    } catch (err) {
      setMessage("Failed to delete course.")
    } finally {
      setIsLoading(false)
    }
  }

  // 🌍 Automatically get user's location using Geoapify
const handleAccessLocation = () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser")
    return
  }

   navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords

      try {
        const apiKey = "c9415ba75dd14ce0ac9d47160d8a12d6" // 🔑 Replace with your actual Geoapify key
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`
        )
        const data = await response.json()

        if (data?.features?.length > 0) {
          const place = data.features[0].properties
          const locationName = `${place.city || place.town || place.village || ""}, ${place.state || ""}, ${place.country || ""}`

          setInstitutionData((prev) => ({
            ...prev,
            location: locationName,
            latitude: latitude.toString().slice(0, 6),  
            longitude: longitude.toString().slice(0, 6),
          }))
        } else {
          alert("Could not fetch location details")
        }
      } catch (error) {
        console.error("Error fetching reverse geocode:", error)
        alert("Failed to get location name")
      }
    },
    (error) => {
      console.error("Geolocation error:", error)
      alert("Location access denied or failed")
    }
  )
}

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cyan-400">
              Provider Dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              Welcome, {user?.username || user?.name || "Provider"}!
            </p>
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Institutions List */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-cyan-300 flex items-center gap-2">
              <Building size={20} /> Your Institutions
            </h2>
            <button
              onClick={() => {
                setShowInstitutionForm(true)
                setEditInstitutionId(null)
                setInstitutionData({
                  institution: "",
                  location: "",
                  latitude: "",
                  longitude: "",
                  id: undefined,
                })
              }}
              className="flex items-center gap-2 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
            >
              <Plus size={16} /> Add Institution
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutions.map(inst => (
              <div
                key={inst.id}
                className={`rounded-lg border p-4 cursor-pointer transition-all ${
                  selectedInstitution?.id === inst.id && showCoursesPopup
                    ? "border-cyan-400 bg-cyan-900/20"
                    : "border-gray-700 bg-gray-800/60"
                }`}
                onClick={() => handleSelectInstitution(inst)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-lg text-cyan-300">{inst.name}</div>
                    <div className="text-gray-400 text-sm">{inst.location}</div>
                    <div className="text-gray-500 text-xs">
                      Lat: {inst.latitude}, Lng: {inst.longitude}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleEditInstitution(inst)
                      }}
                      className="text-cyan-400 hover:text-cyan-200"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        handleDeleteInstitution(inst.id)
                      }}
                      className="text-red-400 hover:text-red-200"
                      title="Delete Institution"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popup Courses for selected institution */}
        <AnimatePresence>
          {showCoursesPopup && selectedInstitution && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className="bg-gray-800/90 rounded-xl border border-gray-700 p-8 w-full max-w-2xl relative"
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  onClick={() => setShowCoursesPopup(false)}
                  type="button"
                >
                  <X size={22} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="text-cyan-400" size={24} />
                  <h2 className="text-2xl font-bold text-cyan-400">
                    Courses for {selectedInstitution.name}
                  </h2>
                  <button
                    onClick={() => {
                      setEditCourseId(null)
                      setCourseData({
                        course: "",
                        keywords: "",
                        duration: "",
                        fees: "",
                        description: "",
                        mode: "Offline",
                      })
                      setShowCourseForm(true)
                    }}
                    className="ml-auto flex items-center gap-2 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm"
                  >
                    <Plus size={16} /> Add Course
                  </button>
                </div>
                {/* Course List */}
                <div className="mb-8">
                  {courses.length === 0 ? (
                    <div className="text-gray-400">No courses found for this institution.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {courses.map(course => (
                        <div
                          key={course.id}
                          className="rounded-lg border border-gray-700 bg-gray-900/60 p-4 flex flex-col gap-2"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-lg text-cyan-300">{course.name}</div>
                              <div className="text-gray-400 text-sm">{course.duration}</div>
                              <div className="text-gray-400 text-sm">₹{course.fee}</div>
                              <div className="text-gray-500 text-xs">
                                Keywords: {Array.isArray(course.keywords) ? course.keywords.join(", ") : course.keywords}
                              </div>
                              <div
                                className="text-gray-400 text-sm mt-2 break-words max-w-xs md:max-w-sm lg:max-w-md"
                                style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                                title={course.description}
                              >
                                {course.description}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditCourse(course)}
                                className="text-cyan-400 hover:text-cyan-200"
                                title="Edit Course"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
                                className="text-red-400 hover:text-red-200"
                                title="Delete Course"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popup Institution Form */}
        <AnimatePresence>
          {showInstitutionForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className="bg-gray-800/90 rounded-xl border border-gray-700 p-8 w-full max-w-lg relative"
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  onClick={() => setShowInstitutionForm(false)}
                  type="button"
                >
                  <X size={22} />
                </button>
                <div className="flex items-center gap-3 mb-6">
                  <Building className="text-cyan-400" size={24} />
                  <h2 className="text-2xl font-bold text-cyan-400">
                    {editInstitutionId ? "Edit Institution" : "Add Institution"}
                  </h2>
                </div>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-lg border ${
                      message.includes("successfully") 
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-red-500/10 border-red-500/30 text-red-400"
                    }`}
                  >
                    {message}
                  </motion.div>
                )}
                <form onSubmit={handleInstitutionSubmit} className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-cyan-300 mb-2 font-medium">
                      <Building size={16} />
                      Institution Name
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={institutionData.institution}
                      onChange={e => setInstitutionData({ ...institutionData, institution: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                      placeholder="Enter institution name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-cyan-300 mb-2 font-medium">
                      <MapPin size={16} />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={institutionData.location}
                      onChange={e => setInstitutionData({ ...institutionData, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                      placeholder="City, State, Country"
                      required
                      readOnly
                      disabled={isLoading}
                    />
                  </div>
                  <button type="button"
                  onClick={handleAccessLocation}
                  className="mt-2 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm">
  📍                Use Current Location
                  </button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-cyan-300 mb-2 font-medium">
                        <MapPin size={16} />
                        Latitude
                      </label>
                      <input
                        type="number"
                        name="latitude"
                        value={institutionData.latitude}
                        onChange={e => setInstitutionData({ ...institutionData, latitude: e.target.value })}
                        step="any"
                        className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. 28.6139"
                        readOnly
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-cyan-300 mb-2 font-medium">
                        <MapPin size={16} />
                        Longitude
                      </label>
                      <input
                        type="number"
                        name="longitude"
                        value={institutionData.longitude}
                        onChange={e => setInstitutionData({ ...institutionData, longitude: e.target.value })}
                        step="any"
                        className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. 77.2090"
                        readOnly
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        {editInstitutionId ? "Updating..." : "Adding..."}
                      </div>
                    ) : (
                      editInstitutionId ? "Update Institution" : "Add Institution"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popup Course Form */}
        <AnimatePresence>
          {showCourseForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            >
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 40, opacity: 0 }}
                className="bg-gray-800/90 rounded-xl border border-gray-700 p-8 w-full max-w-lg relative"
              >
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  onClick={() => setShowCourseForm(false)}
                  type="button"
                >
                  <X size={22} />
                </button>
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={20} className="text-cyan-400" />
                  <span className="text-lg font-semibold text-cyan-300">
                    {editCourseId ? "Edit Course" : "Add New Course"}
                  </span>
                </div>
                <form onSubmit={handleCourseSubmit} className="space-y-6 mt-4">
                  <div>
                    <label className="flex items-center gap-2 text-cyan-300 mb-2 font-medium">
                      <BookOpen size={16} />
                      Course Name
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={courseData.course}
                      onChange={e => setCourseData({ ...courseData, course: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                      placeholder="Enter course name"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-cyan-300 mb-2 font-medium">
                      <Tag size={16} />
                      Keywords
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      value={courseData.keywords}
                      onChange={e => setCourseData({ ...courseData, keywords: e.target.value })}
                      placeholder="web development, react, javascript, fullstack"
                      className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                      disabled={isLoading}
                    />
                    <p className="text-gray-500 text-sm mt-1">Comma separated keywords for better searchability</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-cyan-300 mb-2 font-medium">
                        <Clock size={16} />
                        Course Duration
                      </label>
                      <input
                        type="text"
                        name="duration"
                        value={courseData.duration}
                        onChange={e => setCourseData({ ...courseData, duration: e.target.value })}
                        placeholder="e.g. 6 months, 2 years"
                        className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-cyan-300 mb-2 font-medium">
                        <DollarSign size={16} />
                        Course Fees (₹)
                      </label>
                      <input
                        type="number"
                        name="fees"
                        value={courseData.fees}
                        onChange={e => setCourseData({ ...courseData, fees: e.target.value })}
                        placeholder="45000"
                        className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-cyan-300 mb-2 font-medium">
                      Course Description
                    </label>
                    <textarea
                      name="description"
                      value={courseData.description}
                      onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                      rows={4}
                      placeholder="Provide a detailed description of the course..."
                      className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition-all resize-vertical"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-cyan-300 mb-2 font-medium">
                      <Tag size={16} />
                      Mode
                    </label>
                    <select
                      name="mode"
                      value={courseData.mode}
                      onChange={e => setCourseData({ ...courseData, mode: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-black/70 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none transition-all"
                      required
                      disabled={isLoading}
                    >
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <motion.button
                    whileHover={!isLoading ? { scale: 1.02 } : {}}
                    whileTap={!isLoading ? { scale: 0.98 } : {}}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        {editCourseId ? "Updating..." : "Adding..."}
                      </div>
                    ) : (
                      editCourseId ? "Update Course" : "Add Course"
                    )}
                  </motion.button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}