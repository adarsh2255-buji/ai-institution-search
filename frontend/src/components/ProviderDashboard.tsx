import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Plus, Building, MapPin, BookOpen, Clock, Tag, Edit, X, Trash2, DollarSign } from "lucide-react" // Added DollarSign
import api from "../api/client" // Removed .ts extension, assuming module resolution handles it

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
      // Basic role check - adapt as needed for your auth system
      if (!parsedUser || parsedUser.role !== "provider") {
        navigate("/login")
        return
      }
      setUser(parsedUser)
      fetchInstitutions(parsedUser) // Pass user data if needed for filtering
    } else {
      navigate("/login")
    }
  }, [navigate])

  // Fetch all institutions for provider
  const fetchInstitutions = async (parsedUser: any) => {
    setIsLoading(true)
    try {
      // Assuming 'api' is configured to include the auth token
      const response = await api.get("/courses/provider-institutes/") // Use the correct endpoint
      setInstitutions(response.data || []) // Ensure it's an array

      // Auto-select logic refined
      if (response.data && response.data.length > 0) {
        // If an institution is already selected (e.g., after edit), keep it selected
        const currentSelectedId = selectedInstitution?.id;
        const updatedSelection = response.data.find((inst: any) => inst.id === currentSelectedId);

        if (updatedSelection) {
            setSelectedInstitution(updatedSelection);
            fetchCourses(updatedSelection.id); // Refresh courses for the updated selection
        } else if (!selectedInstitution) { // Only auto-select if nothing was previously selected
            setSelectedInstitution(response.data[0]);
            fetchCourses(response.data[0].id);
        } else {
            // The previously selected institution might have been deleted
             setSelectedInstitution(null);
             setCourses([]);
             setShowCoursesPopup(false);
        }
      } else {
          // No institutions left
          setSelectedInstitution(null);
          setCourses([]);
          setShowCoursesPopup(false);
      }


    } catch (err) {
      setMessage("Failed to fetch institutions.")
      console.error("Fetch Institutions Error:", err); // Log error for debugging
      setInstitutions([]); // Reset on error
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch courses for a given institution
  const fetchCourses = async (institutionId: number) => {
    // Only set loading if not already loading from a parent operation
    // setIsLoading(true); // Maybe set a specific course loading state?
    try {
      const response = await api.get(`/courses/institutes/${institutionId}/details/`)
      // Ensure courses data exists and is an array
      setCourses(Array.isArray(response.data?.courses) ? response.data.courses : [])
    } catch (err) {
      setCourses([]) // Reset courses on error
      setMessage(`Failed to fetch courses for institution ID ${institutionId}.`)
      console.error(`Fetch Courses Error (ID: ${institutionId}):`, err); // Log error
    } finally {
      // setIsLoading(false);
    }
  }

  // Handle institution selection
  const handleSelectInstitution = (inst: any) => {
    if (selectedInstitution?.id !== inst.id) { // Fetch courses only if selection changes
        setSelectedInstitution(inst);
        fetchCourses(inst.id); // Fetch courses for the newly selected institution
        setMessage(""); // Clear previous messages
    }
    setShowCoursesPopup(true); // Always show the popup on click
  }

  // Handle institution edit setup
  const handleEditInstitution = (inst: any) => {
    setEditInstitutionId(inst.id)
    setInstitutionData({
      institution: inst.name || "", // Ensure values are strings
      location: inst.location || "",
      latitude: String(inst.latitude || ""), // Convert to string
      longitude: String(inst.longitude || ""), // Convert to string
      id: inst.id,
    })
    setShowInstitutionForm(true)
    setMessage("") // Clear message when opening form
  }

  // Handle course edit setup
  const handleEditCourse = (course: any) => {
    setEditCourseId(course.id)
    setCourseData({
      course: course.name || "", // Ensure values are strings
      keywords: Array.isArray(course.keywords) ? course.keywords.join(", ") : course.keywords || "",
      duration: String(course.duration || ""), // Convert to string
      fees: String(course.fee || ""), // Convert to string (use 'fee' from backend)
      description: course.description || "",
      mode: course.mode || "Offline",
    })
    setShowCourseForm(true)
    setMessage("") // Clear message when opening form
  }

  // Handle institution form submit (add or edit)
  const handleInstitutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("") // Clear message before submission attempt

    // Basic validation
    if (!institutionData.institution.trim()) {
        setMessage("⚠️ Institution name is required.");
        return;
    }
    if(!institutionData.latitude || !institutionData.longitude){
      setMessage("⚠️ Please set your location (Latitude/Longitude required) before submitting.")
      return
    }

    setIsLoading(true) // Set loading *before* API call

    try {
      const payload = {
          name: institutionData.institution,
          location: institutionData.location,
          // Ensure latitude and longitude are numbers if required by backend, otherwise keep as strings
          latitude: parseFloat(institutionData.latitude) || 0,
          longitude: parseFloat(institutionData.longitude) || 0,
      };

      if (editInstitutionId) {
        // Edit institution
        await api.put(`/courses/institutes/${editInstitutionId}/edit/`, payload)
        setMessage("✅ Institution updated successfully!")
      } else {
        // Add institution
        await api.post("/courses/add-institute/", payload)
        setMessage("✅ Institution added successfully!")
      }
      // Reset form and states after successful submission
      setShowInstitutionForm(false)
      setEditInstitutionId(null)
      setInstitutionData({ // Clear form data
        institution: "", location: "", latitude: "", longitude: "", id: undefined,
      })
      fetchInstitutions(user) // Refetch institutions list to show changes
    } catch (err: any) {
       // Provide more specific error feedback
      const errorDetail = err.response?.data?.detail || err.response?.data || err.message || 'Unknown error';
      setMessage(`❌ Failed to save institution: ${errorDetail}`)
      console.error("Institution Submit Error:", err); // Log detailed error
    } finally {
      setIsLoading(false) // Ensure loading is turned off regardless of success/failure
    }
  }

  // Handle course form submit (add or edit)
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("") // Clear previous messages
    
    // --- Validation Checks ---
    if (!selectedInstitution) {
        setMessage("⚠️ Please select an institution first.")
        return
    }
    if (!courseData.course.trim() || !courseData.keywords.trim() || !courseData.duration || !courseData.fees || !courseData.description.trim()) {
        setMessage("⚠️ Please fill in all required course fields (Name, Keywords, Duration, Fees, Description).");
        return;
    }

    const durationValue = Number(courseData.duration);
    const feeValue = Number(courseData.fees);

    if (isNaN(durationValue) || durationValue < 1) {
        setMessage("⚠️ Course duration must be a positive number (at least 1 month).");
        return;
    }
    if (isNaN(feeValue) || feeValue < 0) {
        setMessage("⚠️ Course fee must be a non-negative number.");
        return;
    }
    if(feeValue < 1000){
        setMessage("⚠️ Course fee seems too low. Please enter a valid amount (at least ₹1000).");
        return;
    }


    // --- End Validation ---

    setIsLoading(true); // Set loading state *before* API call

    try {
      const payload = {
        institute: selectedInstitution.id, // Ensure this ID is correct
        name: courseData.course,
        keywords: courseData.keywords
          .split(",")
          .map(k => k.trim()) // Trim whitespace
          .filter(Boolean), // Remove empty strings
        duration: durationValue, // Use validated number
        fee: feeValue,           // Use validated number
        description: courseData.description,
        mode: courseData.mode,
      }

      if (editCourseId) {
        // Edit existing course
        await api.put(`/courses/courses/${editCourseId}/edit/`, payload)
        setMessage("✅ Course updated successfully!")
      } else {
        // Add new course
        await api.post("/courses/add-course/", payload)
        setMessage("✅ Course added successfully!")
      }

      // Reset form state and close modal on success
      setEditCourseId(null)
      setCourseData({ // Reset form data
        course: "", keywords: "", duration: "", fees: "", description: "", mode: "Offline",
      })
      setShowCourseForm(false)
      fetchCourses(selectedInstitution.id) // Refetch courses for the current institution

    } catch (err: any) {
        const errorDetail = err.response?.data?.detail || err.response?.data || err.message || 'Unknown error';
        setMessage(`❌ Failed to save course: ${errorDetail}`)
        console.error("Course Submit Error:", err); // Log detailed error
    } finally {
      setIsLoading(false) // Ensure loading is turned off
    }
  }

  // Delete institution and its courses
  const handleDeleteInstitution = async (instId: number) => {
    // Replace window.confirm with a proper modal confirmation in a real app
    if (!confirm("Are you sure you want to delete this institution and ALL its courses? This action cannot be undone.")) return

    setIsLoading(true)
    setMessage("")
    try {
      await api.delete(`/courses/institutes/${instId}/delete/`)
      setMessage("✅ Institution deleted successfully!")
      setShowCoursesPopup(false) // Close popup if open for this institution
      setSelectedInstitution(null) // Deselect
      setCourses([]) // Clear courses display
      fetchInstitutions(user) // Refetch list to remove the deleted one
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail || err.message || 'Unknown error';
      setMessage(`❌ Failed to delete institution: ${errorDetail}`)
      console.error("Delete Institution Error:", err);
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a single course
  const handleDeleteCourse = async (courseId: number) => {
    // Replace window.confirm with a proper modal confirmation
    if (!confirm("Are you sure you want to delete this course?")) return

    setIsLoading(true)
    setMessage("")
    try {
      await api.delete(`/courses/courses/${courseId}/delete/`)
      setMessage("✅ Course deleted successfully!")
      if (selectedInstitution) {
          fetchCourses(selectedInstitution.id) // Refresh course list for the current institution
      }
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail || err.message || 'Unknown error';
      setMessage(`❌ Failed to delete course: ${errorDetail}`)
      console.error("Delete Course Error:", err);
    } finally {
      setIsLoading(false)
    }
  }

  // Get user's location using Geoapify
  const handleAccessLocation = () => {
    setMessage(""); // Clear previous messages
    if (!navigator.geolocation) {
      setMessage("⚠️ Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const apiKey = "c9415ba75dd14ce0ac9d47160d8a12d6" // 🔑 Use environment variable in production!
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`
          )
          if (!response.ok) throw new Error(`Geoapify error (${response.status}): ${response.statusText}`);
          const data = await response.json()

          if (data?.features?.length > 0) {
            const place = data.features[0].properties
            // Construct a useful location name, preferring city/town/village
            const locationName = [place.city, place.town, place.village, place.county, place.state, place.country].filter(Boolean).join(', ');

            setInstitutionData((prev) => ({
              ...prev,
              location: place.formatted || locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`, // Use formatted or build, fallback to coords
              latitude: latitude.toFixed(6), // Use sufficient precision
              longitude: longitude.toFixed(6),
            }))
            setMessage("✅ Location fetched successfully!"); // Provide feedback
          } else {
              setMessage("⚠️ Could not fetch location details from coordinates.")
          }
        } catch (error) {
          console.error("Error fetching reverse geocode:", error)
          setMessage("❌ Failed to get location name from coordinates.")
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
         let geoMessage = "Location access failed."
          switch(error.code) {
              case error.PERMISSION_DENIED:
                  geoMessage = "⚠️ Location access denied by user.";
                  break;
              case error.POSITION_UNAVAILABLE:
                  geoMessage = "⚠️ Location information is unavailable.";
                  break;
              case error.TIMEOUT:
                  geoMessage = "⚠️ The request to get user location timed out.";
                  break;
              default:
                  geoMessage = "⚠️ An unknown error occurred while getting location.";
                  break;
          }
          setMessage(geoMessage);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Add options for better accuracy/handling
    )
  }

  // Simplified Logout (replace with your actual auth logic)
  const handleLogout = () => {
      localStorage.removeItem("user");
      // Potentially call an API endpoint to invalidate token server-side
      navigate("/login");
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-200">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur border-b border-gray-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-cyan-400">
              Provider Dashboard
            </h1>
            <p className="text-gray-400 text-xs">
              Welcome, {user?.username || user?.name || "Provider"}!
            </p>
          </div>
          <button
            onClick={handleLogout} // Ensure you have a logout handler
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600/20 border border-red-600/30 text-red-300 hover:bg-red-600/30 transition-colors text-xs"
          >
            {/* <LogOut size={14} /> */}
            Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Global Message Display Area (outside popups) */}
           {message && !showInstitutionForm && !showCourseForm && !showCoursesPopup && (
               <motion.div
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className={`mb-4 p-3 rounded-lg border text-sm ${
                   message.includes("✅")
                     ? "bg-green-500/10 border-green-500/30 text-green-300"
                     : message.startsWith("⚠️")
                     ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                     : "bg-red-500/10 border-red-500/30 text-red-300"
                 }`}
               >
                 {message.replace(/^[✅⚠️❌]\s*/, '')} {/* Remove icon prefix for display */}
               </motion.div>
             )}


        {/* Institutions Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
              <Building size={18} /> Your Institutions
            </h2>
            <button
              onClick={() => {
                setShowInstitutionForm(true);
                setEditInstitutionId(null);
                setInstitutionData({ institution: "", location: "", latitude: "", longitude: "", id: undefined });
                setMessage(""); // Clear message when opening form
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium transition-colors shadow-sm hover:shadow-md"
              disabled={isLoading}
            >
              <Plus size={14} /> Add Institution
            </button>
          </div>

          {isLoading && institutions.length === 0 ? (
             <div className="flex items-center justify-center text-cyan-400 my-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mr-2"></div>
                Loading Institutions...
             </div>
          ) : institutions.length === 0 ? (
             <p className="text-gray-500 text-center py-4 px-4 bg-gray-800/50 rounded-lg text-sm">No institutions found. Click "Add Institution" to get started.</p>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {institutions.map(inst => (
                  <motion.div
                    key={inst.id}
                    layout // Animate layout changes
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`rounded-lg border p-4 cursor-pointer transition-all relative group shadow-sm ${
                      selectedInstitution?.id === inst.id && showCoursesPopup
                        ? "border-cyan-500 bg-gray-800 ring-1 ring-cyan-500 shadow-cyan-500/10"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-700/60"
                    }`}
                    onClick={() => handleSelectInstitution(inst)}
                  >
                     <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-10"> {/* Allow shrinking and prevent overlap */}
                            <h3 className="font-semibold text-md text-cyan-300 group-hover:text-cyan-200 truncate">{inst.name}</h3>
                            <p className="text-gray-400 text-xs truncate">{inst.location}</p>
                            <p className="text-gray-500 text-xs mt-1 truncate">
                                Lat: {inst.latitude}, Lng: {inst.longitude}
                            </p>
                        </div>
                         <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                           <button
                             onClick={e => { e.stopPropagation(); handleEditInstitution(inst); }}
                             className="text-cyan-400 hover:text-cyan-200 bg-gray-700/50 p-1 rounded hover:bg-gray-600/70"
                             title="Edit Institution"
                           > <Edit size={14} /> </button>
                           <button
                             onClick={e => { e.stopPropagation(); handleDeleteInstitution(inst.id); }}
                             className="text-red-400 hover:text-red-200 bg-gray-700/50 p-1 rounded hover:bg-gray-600/70"
                             title="Delete Institution"
                           > <Trash2 size={14} /> </button>
                         </div>
                     </div>
                  </motion.div>
                ))}
             </div>
           )}
        </section>

        {/* --- Modals / Popups --- */}

        {/* Courses Popup */}
        <AnimatePresence>
          {showCoursesPopup && selectedInstitution && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => { setShowCoursesPopup(false); setMessage(""); }} // Clear message on close
            >
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-3xl relative shadow-2xl shadow-black/30 max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                 {/* Header */}
                 <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-xl z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <BookOpen className="text-cyan-400 flex-shrink-0" size={20} />
                      <h2 className="text-lg font-semibold text-cyan-300 truncate">
                        Courses: <span className="text-white font-medium">{selectedInstitution.name}</span>
                      </h2>
                    </div>
                     <div className="flex items-center gap-2">
                         <button
                           onClick={() => { setEditCourseId(null); setCourseData({ course: "", keywords: "", duration: "", fees: "", description: "", mode: "Offline" }); setShowCourseForm(true); setMessage(""); }}
                           className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium transition-colors"
                         > <Plus size={14} /> Add </button>
                        <button
                          className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                          onClick={() => { setShowCoursesPopup(false); setMessage(""); }}
                          type="button" aria-label="Close courses popup"
                        > <X size={18} /> </button>
                    </div>
                 </div>

                 {/* Message Display inside Popup */}
                 {message && ( /* Only show message if popup is active */
                     <motion.div
                       initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                       className={`mx-4 mt-4 p-3 rounded-lg border text-xs overflow-hidden ${ /* Smaller text */
                         message.includes("✅") ? "bg-green-500/10 border-green-500/30 text-green-300"
                         : message.startsWith("⚠️") ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                         : "bg-red-500/10 border-red-500/30 text-red-300"
                       }`}
                     > {message.replace(/^[✅⚠️❌]\s*/, '')} </motion.div>
                   )}

                {/* Course List Area */}
                <div className="overflow-y-auto flex-grow p-4 space-y-3">
                  {isLoading && courses.length === 0 ? (
                     <div className="flex items-center justify-center text-cyan-400 py-6">
                        <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mr-2"></div>
                        Loading Courses...
                     </div>
                  ) : courses.length === 0 ? (
                    <div className="text-gray-500 text-center py-6 text-sm">No courses found for this institution.</div>
                  ) : (
                    courses.map(course => (
                      <motion.div
                        key={course.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="rounded-lg border border-gray-700 bg-gray-900/40 p-3 group relative transition-colors hover:border-gray-600"
                      >
                         <div className="flex justify-between items-start mb-1.5">
                            <div className="flex-1 min-w-0 pr-12"> {/* Space for buttons */}
                                <h4 className="font-semibold text-sm text-cyan-300 truncate">{course.name}</h4>
                                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-gray-400 text-xs mt-1">
                                    <span className="flex items-center gap-1"><Clock size={11}/> {course.duration || 'N/A'} Months</span>
                                    <span className="flex items-center gap-1"><DollarSign size={11}/> ₹{course.fee?.toLocaleString('en-IN') ?? 'N/A'}</span>
                                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ${
                                        course.mode === 'Online' ? 'bg-green-800/50 text-green-300'
                                        : course.mode === 'Offline' ? 'bg-purple-800/50 text-purple-300'
                                        : 'bg-yellow-800/50 text-yellow-300'}`
                                    }> {course.mode || 'N/A'} </span>
                                </div>
                            </div>
                             <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEditCourse(course); setMessage(""); }}
                                  className="text-cyan-400 hover:text-cyan-200 bg-gray-700/50 p-1 rounded hover:bg-gray-600/70"
                                  title="Edit Course"
                                > <Edit size={13} /> </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteCourse(course.id); }}
                                  className="text-red-400 hover:text-red-200 bg-gray-700/50 p-1 rounded hover:bg-gray-600/70"
                                  title="Delete Course"
                                > <Trash2 size={13} /> </button>
                            </div>
                         </div>
                         <p className="text-gray-400 text-xs mb-1.5 line-clamp-2" title={course.description}>
                           {course.description || 'No description provided.'}
                         </p>
                          <p className="text-gray-500 text-[10px] truncate" title={Array.isArray(course.keywords) ? course.keywords.join(", ") : course.keywords}>
                             Keywords: {Array.isArray(course.keywords) ? course.keywords.join(", ") : course.keywords || 'N/A'}
                         </p>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Institution Form Popup */}
        <AnimatePresence>
          {showInstitutionForm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
               onClick={() => { setShowInstitutionForm(false); setMessage(""); }} // Clear message on close
            >
              <motion.div
                 initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md relative shadow-2xl shadow-black/30 flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                 {/* Header */}
                 <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-xl z-10">
                    <div className="flex items-center gap-3">
                      <Building className="text-cyan-400 flex-shrink-0" size={20} />
                      <h2 className="text-lg font-semibold text-cyan-300">
                        {editInstitutionId ? "Edit Institution" : "Add Institution"}
                      </h2>
                    </div>
                     <button
                       className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                       onClick={() => { setShowInstitutionForm(false); setMessage(""); }}
                       type="button" aria-label="Close institution form"
                     > <X size={18} /> </button>
                 </div>

                 {/* Form Area */}
                 <div className="p-4 overflow-y-auto">
                     {/* Message Display inside Popup */}
                     {message && (
                         <motion.div
                           initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                           className={`mb-4 p-3 rounded-lg border text-xs overflow-hidden ${
                             message.includes("✅") ? "bg-green-500/10 border-green-500/30 text-green-300"
                             : message.startsWith("⚠️") ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                             : "bg-red-500/10 border-red-500/30 text-red-300"
                           }`}
                         > {message.replace(/^[✅⚠️❌]\s*/, '')} </motion.div>
                       )}

                    <form onSubmit={handleInstitutionSubmit} className="space-y-4">
                      <div>
                        <label className="block text-cyan-300 mb-1 font-medium text-xs"> Institution Name </label>
                        <input
                          type="text" name="institution" value={institutionData.institution}
                          onChange={e => setInstitutionData({ ...institutionData, institution: e.target.value })}
                          className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-sm"
                          placeholder="Enter institution name" required disabled={isLoading}
                        />
                      </div>
                      <div>
                            <label className="block text-cyan-300 mb-1 font-medium text-xs"> Location </label>
                            <div className="flex gap-2 items-center">
                                 <input
                                   type="text" name="location" value={institutionData.location}
                                   readOnly // Make it read-only, filled by button
                                   className="flex-grow px-3 py-2 rounded-md bg-gray-700/50 border border-gray-600 text-gray-300 placeholder-gray-500 outline-none text-sm cursor-default"
                                   placeholder="(Auto-filled)" required disabled={isLoading}
                                 />
                                 <button type="button" onClick={handleAccessLocation}
                                   className="flex-shrink-0 p-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-xs whitespace-nowrap disabled:opacity-50 transition-colors"
                                   disabled={isLoading} title="Get current location"
                                 > <MapPin size={14}/> </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                 <label className="block text-cyan-300 mb-1 font-medium text-xs"> Latitude </label>
                                 <input
                                   type="number" name="latitude" value={institutionData.latitude}
                                   step="any" readOnly
                                   className="w-full px-3 py-2 rounded-md bg-gray-700/50 border border-gray-600 text-gray-300 placeholder-gray-500 outline-none text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none cursor-default"
                                   placeholder="(Auto-filled)" required disabled={isLoading}
                                 />
                            </div>
                            <div>
                                 <label className="block text-cyan-300 mb-1 font-medium text-xs"> Longitude </label>
                                 <input
                                   type="number" name="longitude" value={institutionData.longitude}
                                   step="any" readOnly
                                   className="w-full px-3 py-2 rounded-md bg-gray-700/50 border border-gray-600 text-gray-300 placeholder-gray-500 outline-none text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none cursor-default"
                                   placeholder="(Auto-filled)" required disabled={isLoading}
                                 />
                            </div>
                       </div>
                      <motion.button
                        whileHover={!isLoading ? { scale: 1.02 } : {}} whileTap={!isLoading ? { scale: 0.98 } : {}}
                        type="submit" disabled={isLoading}
                        className="w-full mt-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {editInstitutionId ? "Updating..." : "Adding..."}
                          </div>
                        ) : (
                          editInstitutionId ? "Update Institution" : "Add Institution"
                        )}
                      </motion.button>
                    </form>
                 </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course Form Popup */}
        <AnimatePresence>
          {showCourseForm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => { setShowCourseForm(false); setMessage(""); }} // Clear message on close
            >
              <motion.div
                 initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg relative shadow-2xl shadow-black/30 max-h-[90vh] flex flex-col"
                 onClick={e => e.stopPropagation()}
              >
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-xl z-10">
                     <div className="flex items-center gap-3 min-w-0">
                        <BookOpen className="text-cyan-400 flex-shrink-0" size={20} />
                        <h2 className="text-lg font-semibold text-cyan-300 truncate">
                          {editCourseId ? "Edit Course" : "Add New Course"}
                          <span className="text-xs text-gray-400 font-normal ml-1">for {selectedInstitution?.name}</span>
                        </h2>
                      </div>
                      <button
                        className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                        onClick={() => { setShowCourseForm(false); setMessage(""); }}
                        type="button" aria-label="Close course form"
                      > <X size={18} /> </button>
                  </div>

                  {/* Form Area */}
                  <div className="p-4 overflow-y-auto">
                     {/* Message Display inside Popup */}
                     {message && (
                         <motion.div
                           initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                           className={`mb-4 p-3 rounded-lg border text-xs overflow-hidden ${
                             message.includes("✅") ? "bg-green-500/10 border-green-500/30 text-green-300"
                             : message.startsWith("⚠️") ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                             : "bg-red-500/10 border-red-500/30 text-red-300"
                           }`}
                         > {message.replace(/^[✅⚠️❌]\s*/, '')} </motion.div>
                       )}

                    <form onSubmit={handleCourseSubmit} className="space-y-4">
                      <div>
                        <label className="block text-cyan-300 mb-1 font-medium text-xs"> Course Name </label>
                        <input
                          type="text" name="course" value={courseData.course}
                          onChange={e => setCourseData({ ...courseData, course: e.target.value })}
                          className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-sm"
                          placeholder="Enter course name" required disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-cyan-300 mb-1 font-medium text-xs"> Keywords </label>
                        <input
                          type="text" name="keywords" value={courseData.keywords} required
                          onChange={e => setCourseData({ ...courseData, keywords: e.target.value })}
                          placeholder="web dev, react, js"
                          className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-sm"
                          disabled={isLoading}
                        />
                        <p className="text-gray-500 text-[10px] mt-1">Comma separated keywords</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-cyan-300 mb-1 font-medium text-xs"> Duration (Months) </label>
                          <input
                            type="number" name="duration" value={courseData.duration}
                            onChange={e => setCourseData({ ...courseData, duration: e.target.value })}
                            placeholder="e.g. 12" min="1"
                            className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            required disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-cyan-300 mb-1 font-medium text-xs"> Course Fees (₹) </label>
                          <input
                            type="number" name="fees" value={courseData.fees}
                            onChange={e => setCourseData({ ...courseData, fees: e.target.value })}
                            placeholder="45000" min="0"
                            className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            required disabled={isLoading}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-cyan-300 mb-1 font-medium text-xs"> Course Description </label>
                        <textarea
                          name="description" value={courseData.description}
                          onChange={e => setCourseData({ ...courseData, description: e.target.value })}
                          rows={3} placeholder="Provide a detailed description..."
                          className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all resize-vertical text-sm"
                          disabled={isLoading} required
                        />
                      </div>
                      <div>
                        <label className="block text-cyan-300 mb-1 font-medium text-xs"> Mode </label>
                        <select
                          name="mode" value={courseData.mode}
                          onChange={e => setCourseData({ ...courseData, mode: e.target.value })}
                          className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-sm appearance-none"
                          required disabled={isLoading}
                        >
                          <option value="Offline">Offline</option>
                          <option value="Online">Online</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                      <motion.button
                        whileHover={!isLoading ? { scale: 1.02 } : {}} whileTap={!isLoading ? { scale: 0.98 } : {}}
                        type="submit" disabled={isLoading}
                        className="w-full mt-4 py-2 rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold tracking-wide shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            {editCourseId ? "Updating..." : "Adding..."}
                          </div>
                        ) : (
                          editCourseId ? "Update Course" : "Add Course"
                        )}
                      </motion.button>
                    </form>
                  </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

