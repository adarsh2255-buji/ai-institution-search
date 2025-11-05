import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Plus, Building, MapPin, BookOpen, Clock, Tag, Edit, X, Trash2, DollarSign } from "lucide-react"
import api from "../api/client.ts" // Assuming .ts extension is needed for your setup

// --- Kerala Districts ---
const keralaDistricts: string[] = [
  "Thiruvananthapuram",
  "Kollam",
  "Pathanamthitta",
  "Alappuzha",
  "Kottayam",
  "Idukki",
  "Ernakulam",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
];

export default function ProviderDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCourseLoading, setIsCourseLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [institutions, setInstitutions] = useState<any[]>([])
  const [selectedInstitution, setSelectedInstitution] = useState<any | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [showInstitutionForm, setShowInstitutionForm] = useState(false)
  const [courseData, setCourseData] = useState({
    course: "",
    courseTitle: "",
    keywords: "",
    duration: "",
    fees: "",
    description: "",
    mode: "Offline", // Default value
  })
  const [institutionData, setInstitutionData] = useState({
    institution: "",
    district: "",
    location: "",
    latitude: "",
    longitude: "",
    id: undefined as number | undefined,
  })
  const [editInstitutionId, setEditInstitutionId] = useState<number | null>(null)
  const [editCourseId, setEditCourseId] = useState<number | null>(null)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showCoursesPopup, setShowCoursesPopup] = useState(false)
  
  // --- State for District Autocomplete ---
  const [districtSuggestions, setDistrictSuggestions] = useState<string[]>([]);
  const [highlightedDistrictIndex, setHighlightedDistrictIndex] = useState(-1);
  const districtAutocompleteRef = useRef<HTMLDivElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null); // Ref for the "Use Current Location" button

  const navigate = useNavigate()

  // Fetch user and institutions on mount
  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (!parsedUser || parsedUser.role !== "provider") {
        navigate("/login")
        return
      }
      setUser(parsedUser)
      fetchInstitutions(parsedUser)
    } else {
      navigate("/login")
    }
  }, [navigate])

  // --- Click outside listener for district autocomplete ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (districtAutocompleteRef.current && !districtAutocompleteRef.current.contains(event.target as Node)) {
        setDistrictSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch all institutions for provider
  const fetchInstitutions = async (parsedUser: any) => {
    setIsLoading(true)
    try {
      const response = await api.get("/courses/provider-institutes/")
      setInstitutions(response.data || []) 
      if (response.data && response.data.length > 0) {
        const currentSelectedId = selectedInstitution?.id;
        const updatedSelection = response.data.find((inst: any) => inst.id === currentSelectedId);

        if (updatedSelection) {
            setSelectedInstitution(updatedSelection);
        } else if (!selectedInstitution) {
           // No auto-selection
        } else {
             setSelectedInstitution(null);
             setCourses([]);
             setShowCoursesPopup(false);
        }
      } else {
          setSelectedInstitution(null);
          setCourses([]);
          setShowCoursesPopup(false);
      }
    } catch (err) {
      setMessage("Failed to fetch institutions.")
      console.error("Fetch Institutions Error:", err);
      setInstitutions([]);
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch courses for a given institution
  const fetchCourses = async (institutionId: number) => {
    setIsCourseLoading(true);
    setMessage("")
    try {
      const response = await api.get(`/courses/institutes/${institutionId}/details/`)
      setCourses(Array.isArray(response.data?.courses) ? response.data.courses : [])
    } catch (err) {
      setCourses([]) 
      setMessage(`Failed to fetch courses for institution ID ${institutionId}.`)
      console.error(`Fetch Courses Error (ID: ${institutionId}):`, err);
    } finally {
      setIsCourseLoading(false);
    }
  }

  // Handle institution selection
  const handleSelectInstitution = (inst: any) => {
    if (selectedInstitution?.id !== inst.id) { 
        setSelectedInstitution(inst);
        setCourses([]); 
        setMessage(""); 
        setIsCourseLoading(true);
        fetchCourses(inst.id);
    }
    setShowCoursesPopup(true); 
  }

  // Handle institution edit setup
  const handleEditInstitution = (inst: any) => {
    setEditInstitutionId(inst.id)
    setInstitutionData({
      institution: inst.name || "", 
      location: inst.location || "",
      district: inst.district || "",
      latitude: String(inst.latitude || ""), 
      longitude: String(inst.longitude || ""), 
      id: inst.id,
    })
    setShowInstitutionForm(true)
    setMessage("")
  }

  // Handle course edit setup
  const handleEditCourse = (course: any) => {
    setEditCourseId(course.id)
    setCourseData({
      course: course.name || "", 
      courseTitle: course.courseTitle || "", // Make sure to handle course.courseTitle
      keywords: Array.isArray(course.keywords) ? course.keywords.join(", ") : course.keywords || "",
      duration: String(course.duration || ""), 
      fees: String(course.fee || ""), 
      description: course.description || "",
      mode: course.mode || "Offline",
    })
    setShowCourseForm(true)
    setMessage("")
  }

  // Handle institution form submit (add or edit)
  const handleInstitutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("") 

    if (!institutionData.institution.trim()) {
        setMessage("⚠️ Institution name is required.");
        return;
    }
    if (!institutionData.district.trim()) {
        setMessage("⚠️ District is required.");
        return;
    }
    if(!institutionData.latitude || !institutionData.longitude){
      setMessage("⚠️ Please set your location (Latitude/Longitude required) before submitting.")
      return
    }

    setIsLoading(true) 

    try {
      const payload = {
          name: institutionData.institution,
          location: institutionData.location,
          district: institutionData.district,
          latitude: parseFloat(institutionData.latitude) || 0,
          longitude: parseFloat(institutionData.longitude) || 0,
      };

      if (editInstitutionId) {
        await api.put(`/courses/institutes/${editInstitutionId}/edit/`, payload)
        setMessage("✅ Institution updated successfully!")
      } else {
        await api.post("/courses/add-institute/", payload)
        setMessage("✅ Institution added successfully!")
      }
      setShowInstitutionForm(false)
      setEditInstitutionId(null)
      setInstitutionData({ 
        institution: "", location: "", district: "", latitude: "", longitude: "", id: undefined,
      })
      fetchInstitutions(user) 
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail || err.response?.data || err.message || 'Unknown error';
      setMessage(`❌ Failed to save institution: ${errorDetail}`)
      console.error("Institution Submit Error:", err);
    } finally {
      setIsLoading(false) 
    }
  }

   // Helper function to count words
    const countWords = (str: string): number => {
      return str.trim().split(/\s+/).filter(Boolean).length;
    };

  // Handle course form submit (add or edit)
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("") 
    
    if (!selectedInstitution) {
        setMessage("⚠️ Please select an institution first.")
        return
    }
    if (!courseData.course.trim() || !courseData.keywords.trim() || !courseData.duration || !courseData.fees || !courseData.description.trim() || !courseData.courseTitle.trim()) {
        setMessage("⚠️ Please fill in all required course fields (Name, Keywords, Duration, Fees, Description, Course Title).");
        return;
    }

    const durationValue = Number(courseData.duration);
    const feeValue = Number(courseData.fees);
    const descriptionWordCount = countWords(courseData.description);

    if (isNaN(durationValue) || durationValue < 1 || durationValue > 99) {
        setMessage("⚠️  Course duration must be between 1 and 99 months.");
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
    if (descriptionWordCount < 10 || descriptionWordCount > 120) {
        setMessage(`⚠️ Description must be between 10 and 120 words (currently ${descriptionWordCount}).`);
        return;
    }
    
    setIsLoading(true); 

    try {
      const payload = {
        institute: selectedInstitution.id, 
        name: courseData.course,
        courseTitle: courseData.courseTitle,
        keywords: courseData.keywords
          .split(",")
          .map(k => k.trim()) 
          .filter(Boolean), 
        duration: durationValue, 
        fee: feeValue,           
        description: courseData.description,
        mode: courseData.mode,
      }

      if (editCourseId) {
        await api.put(`/courses/courses/${editCourseId}/edit/`, payload)
        setMessage("✅ Course updated successfully!")
      } else {
        await api.post("/courses/add-course/", payload)
        setMessage("✅ Course added successfully!")
      }
      
      setEditCourseId(null)
      setCourseData({ 
        course: "", keywords: "", duration: "", fees: "", description: "", courseTitle: "", mode: "Offline",
      })
      setShowCourseForm(false)
      fetchCourses(selectedInstitution.id) 

    } catch (err: any) {
        const errorDetail = err.response?.data?.detail || err.response?.data || err.message || 'Unknown error';
        setMessage(`❌ Failed to save course: ${errorDetail}`)
        console.error("Course Submit Error:", err); 
    } finally {
      setIsLoading(false) 
    }
  }

  // Delete institution and its courses
  const handleDeleteInstitution = async (instId: number) => {
    if (!confirm("Are you sure you want to delete this institution and ALL its courses? This action cannot be undone.")) return

    setIsLoading(true)
    setMessage("")
    try {
      await api.delete(`/courses/institutes/${instId}/delete/`)
      setMessage("✅ Institution deleted successfully!")
      setShowCoursesPopup(false) 
      setSelectedInstitution(null) 
      setCourses([]) 
      fetchInstitutions(user) 
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
    if (!confirm("Are you sure you want to delete this course?")) return

    setIsLoading(true)
    setMessage("")
    try {
      await api.delete(`/courses/courses/${courseId}/delete/`)
      setMessage("✅ Course deleted successfully!")
      if (selectedInstitution) {
          fetchCourses(selectedInstitution.id) 
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
    setMessage(""); 
    if (!navigator.geolocation) {
      setMessage("⚠️ Geolocation is not supported by your browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        try {
          const apiKey = "c9415ba75dd14ce0ac9d47160d8a12d6" 
          const response = await fetch(
            `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`
          )
          if (!response.ok) throw new Error(`Geoapify error (${response.status}): ${response.statusText}`);
          const data = await response.json()

          if (data?.features?.length > 0) {
            const place = data.features[0].properties
            const locationName = [place.city, place.town, place.village, place.county, place.state, place.country].filter(Boolean).join(', ');

            setInstitutionData((prev) => ({
              ...prev,
              location: place.formatted || locationName || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              district: place.county || place.state_district || "", // Try to get district
              latitude: latitude.toFixed(6), 
              longitude: longitude.toFixed(6),
            }))
            setMessage("✅ Location fetched successfully!"); 
          } else {
              setMessage("⚠️ Could not fetch location details from coordinates.")
          }
        } catch (error) {
          console.error("Error fetching reverse geocode:", error)
          setMessage("❌ Failed to get location name from coordinates.")
        } finally {
          setIsLoading(false)
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } 
    )
  }

  // --- District Autocomplete Handlers ---
  const handleDistrictChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInstitutionData({ ...institutionData, district: value });

    if (value.length > 0) {
      const filtered = keralaDistricts.filter(d => 
        d.toLowerCase().includes(value.toLowerCase())
      );
      setDistrictSuggestions(filtered);
    } else {
      setDistrictSuggestions([]);
    }
  };

  const handleSelectDistrict = (district: string) => {
    setInstitutionData({ ...institutionData, district });
    setDistrictSuggestions([]);
    setHighlightedDistrictIndex(-1);
  };

  const handleDistrictKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (districtSuggestions.length === 0) {
        if (e.key === 'Enter') {
            e.preventDefault();
            locationButtonRef.current?.focus(); // Move focus to location button
        }
        return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedDistrictIndex(prev => (prev + 1) % districtSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedDistrictIndex(prev => (prev - 1 + districtSuggestions.length) % districtSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedDistrictIndex > -1) {
        handleSelectDistrict(districtSuggestions[highlightedDistrictIndex]);
      } else {
        setDistrictSuggestions([]); // Close suggestions
      }
      locationButtonRef.current?.focus(); // Move focus to location button
    }
  };

  // Simplified Logout (replace with your actual auth logic)
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-200">
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
            onClick={handleLogout} 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600/20 border border-red-600/30 text-red-300 hover:bg-red-600/30 transition-colors text-xs"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                 {message.replace(/^[✅⚠️❌]\s*/, '')} 
               </motion.div>
             )}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
              <Building size={18} /> Your Institutions
            </h2>
            <button
              onClick={() => {
                setShowInstitutionForm(true);
                setEditInstitutionId(null);
                setInstitutionData({ institution: "", location: "", district: "", latitude: "", longitude: "", id: undefined });
                setMessage(""); 
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium transition-colors shadow-sm hover:shadow-md"
              disabled={isLoading && institutions.length === 0} 
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
                    layout 
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
                        <div className="flex-1 min-w-0 pr-10"> 
                            <h3 className="font-semibold text-md text-cyan-300 group-hover:text-cyan-200 truncate">{inst.name}</h3>
                            <p className="text-gray-400 text-xs truncate">{inst.location}</p>
                            <p className="text-gray-400 text-xs truncate">District : {inst.district}</p>
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

        <AnimatePresence>
          {showCoursesPopup && selectedInstitution && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => { setShowCoursesPopup(false); setMessage(""); }} 
            >
              <motion.div
                initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-3xl relative shadow-2xl shadow-black/30 max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                 <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 rounded-t-xl z-10">
                    <div className="flex items-center gap-3 min-w-0">
                      <BookOpen className="text-cyan-400 flex-shrink-0" size={20} />
                      <h2 className="text-lg font-semibold text-cyan-300 truncate">
                        Courses: <span className="text-white font-medium">{selectedInstitution.name}</span>
                      </h2>
                    </div>
                     <div className="flex items-center gap-2">
                         <button
                           onClick={() => { setEditCourseId(null); setCourseData({ course: "", keywords: "", duration: "", fees: "", description: "", courseTitle: "", mode: "Offline" }); setShowCourseForm(true); setMessage(""); }}
                           className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium transition-colors"
                           disabled={isCourseLoading}
                         > <Plus size={14} /> Add </button>
                        <button
                          className="text-gray-500 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
                          onClick={() => { setShowCoursesPopup(false); setMessage(""); }}
                          type="button" aria-label="Close courses popup"
                        > <X size={18} /> </button>
                    </div>
                 </div>

                 {message && (
                     <motion.div
                       initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                       className={`mx-4 mt-4 p-3 rounded-lg border text-xs overflow-hidden ${
                         message.includes("✅") ? "bg-green-500/10 border-green-500/30 text-green-300"
                         : message.startsWith("⚠️") ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-300"
                         : "bg-red-500/10 border-red-500/30 text-red-300"
                       }`}
                     > {message.replace(/^[✅⚠️❌]\s*/, '')} </motion.div>
                   )}

                <div className="overflow-y-auto flex-grow p-4 space-y-3">
                  {isCourseLoading ? (
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
                            <div className="flex-1 min-w-0 pr-12"> 
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

        <AnimatePresence>
          {showInstitutionForm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
               onClick={() => { setShowInstitutionForm(false); setMessage(""); }} 
            >
              <motion.div
                 initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md relative shadow-2xl shadow-black/30 flex flex-col"
                onClick={e => e.stopPropagation()}
              >
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

                 <div className="p-4 overflow-y-auto">
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
                      
                      {/* --- NEW District Autocomplete Input --- */}
                      <div className="relative" ref={districtAutocompleteRef}>
                        <label className="block text-cyan-300 mb-1 font-medium text-xs"> District </label>
                        <input
                          type="text" name="district" value={institutionData.district}
                          onChange={handleDistrictChange}
                          onKeyDown={handleDistrictKeyDown}
                          className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-sm"
                          placeholder="Enter district" required disabled={isLoading}
                        />
                        {districtSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {districtSuggestions.map((district, index) => (
                              <div
                                key={district}
                                onClick={() => handleSelectDistrict(district)}
                                className={`p-2 cursor-pointer text-sm ${
                                  index === highlightedDistrictIndex
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-gray-600'
                                }`}
                              >
                                {district}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                            <label className="block text-cyan-300 mb-1 font-medium text-xs"> Street Address </label>
                            <div className="flex gap-2 items-center">
                                 <input
                                   type="text" name="location" value={institutionData.location}
                                   readOnly 
                                   className="flex-grow px-3 py-2 rounded-md bg-gray-700/50 border border-gray-600 text-gray-300 placeholder-gray-500 outline-none text-sm cursor-default"
                                   placeholder="(Auto-filled)" required disabled={isLoading}
                                 />
                                 <button 
                                   type="button" 
                                   onClick={handleAccessLocation}
                                   ref={locationButtonRef} // Add ref here
                                   className="flex-shrink-0 p-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-xs whitespace-nowrap disabled:opacity-50 transition-colors"
                                   disabled={isLoading} title="Get current location"
                                 > {isLoading ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div> : <MapPin size={14}/>} </button>
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

        <AnimatePresence>
          {showCourseForm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => { setShowCourseForm(false); setMessage(""); }} 
            >
              <motion.div
                 initial={{ y: 20, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.98 }}
                 transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg relative shadow-2xl shadow-black/30 max-h-[90vh] flex flex-col"
                 onClick={e => e.stopPropagation()}
              >
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

                  <div className="p-4 overflow-y-auto">
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
                        <label className="block text-cyan-300 mb-1 font-medium text-xs"> Course Title </label>
                        <input
                          type="text" name="courseTitle" value={courseData.courseTitle}
                          onChange={e => setCourseData({ ...courseData, courseTitle: e.target.value })}
                          className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-sm"
                          placeholder="Enter course title" required disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-cyan-300 mb-1 font-medium text-xs"> Keywords </label>
                        <input
                          type="text" name="keywords" value={courseData.keywords} required
                          onChange={e => setCourseData({ ...courseData, keywords: e.target.value })}
                          placeholder="course name, web dev, react, js"
                          className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-sm"
                          disabled={isLoading}
                        />
                        <p className="text-gray-500 text-[10px] mt-1">Comma separated keywords</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-cyan-300 mb-1 font-medium text-xs"> Duration (Months) </label>
                          <input
                            type="number"
                            name="duration"
                            value={courseData.duration}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || (/^\d{1,2}$/.test(val) && parseInt(val, 10) >= 1 && parseInt(val, 10) <= 99)) {
                                    setCourseData({ ...courseData, duration: val })
                                }
                            }}
                            placeholder="e.g. 12"
                            min="1"
                            max="99" 
                            className="w-full px-3 py-2 rounded-md bg-black/50 border border-gray-600 text-gray-200 placeholder-gray-500 focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400 outline-none transition-all text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            required
                            disabled={isLoading}
                          />
                        </div>
                        <div>
                          <label className="block text-cyan-300 mb-1 font-medium text-xs"> Course Fees (₹) </label>
                          <input
                            type="number" name="fees" value={courseData.fees}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || /^\d{1,5}$/.test(val)) {
                                     setCourseData({ ...courseData, fees: val })
                                }
                            }}
                            placeholder="45000" min="0" max="99999" 
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
                          rows={3} placeholder="Provide a detailed description... min word= 10, max word=120"
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

