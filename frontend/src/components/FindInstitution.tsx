import React, { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import api from "../api/client"

type Course = {
  id: number
  name: string
  durationMonths: number
  price: number
}

type Institution = {
  id: number
  name: string
  city: string
  latitude: number
  longitude: number
  courses: Course[]
}

type CourseMatch = {
  id: number
  institute: string
  course: string
  fee: number
  duration: string
  location: string
  description?: string
  keywords?: string[]
  distanceKm?: number
  mode?: string // <-- Add mode here
}

type ApiMatch = {
  institute?: string
  institute_id?: number
  institute_name?: string
  course?: string
  course_name?: string
  description?: string
  fee: number
  duration: number
  location?: string
  rating?: number | null
  latitude?: string
  longitude?: string
  keywords?: string[]
  mode?: string
}

// Dummy dataset - replace later with backend API
const DUMMY_INSTITUTIONS: Institution[] = [
  {
    id: 1,
    name: "Tech Academy Mumbai",
    city: "Mumbai",
    latitude: 19.0760,
    longitude: 72.8777,
    courses: [
      { id: 11, name: "Fullstack Web Development", durationMonths: 6, price: 45000 },
      { id: 12, name: "Data Science", durationMonths: 9, price: 65000 },
      { id: 13, name: "React Frontend", durationMonths: 4, price: 35000 },
    ],
  },
  {
    id: 2,
    name: "Digital Learning Hub",
    city: "Bangalore",
    latitude: 12.9716,
    longitude: 77.5946,
    courses: [
      { id: 21, name: "AI & ML", durationMonths: 12, price: 90000 },
      { id: 22, name: "React Frontend", durationMonths: 5, price: 38000 },
    ],
  },
  {
    id: 3,
    name: "Innovation Institute",
    city: "Delhi",
    latitude: 28.6139,
    longitude: 77.2090,
    courses: [
      { id: 31, name: "Python Backend", durationMonths: 6, price: 42000 },
      { id: 32, name: "Data Science", durationMonths: 8, price: 62000 },
    ],
  },
  {
    id: 4,
    name: "Future Skills Center",
    city: "Pune",
    latitude: 18.5204,
    longitude: 73.8567,
    courses: [
      { id: 41, name: "Cybersecurity", durationMonths: 6, price: 50000 },
      { id: 42, name: "Fullstack Web Development", durationMonths: 7, price: 52000 },
    ],
  },
  {
    id: 5,
    name: "Code Masters Academy",
    city: "Hyderabad",
    latitude: 17.3850,
    longitude: 78.4867,
    courses: [
      { id: 51, name: "Android Development", durationMonths: 5, price: 40000 },
      { id: 52, name: "React Frontend", durationMonths: 3, price: 28000 },
    ],
  },
]

type PreferenceFilters = {
  durationMax?: number
  priceMin?: number
  priceMax?: number
  sortPrice?: "asc" | "desc" | ""
  mode?: "Online" | "Offline" | "" // <-- Add mode filter
}

const FilterControls = React.memo(({
  filters,
  setFilters,
}: {
  filters: PreferenceFilters
  setFilters: (f: PreferenceFilters) => void
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div>
        <label className="block text-sm text-gray-300 mb-1">Max Duration (months)</label>
        <select
          value={filters.durationMax ?? ""}
          onChange={e => setFilters({ ...filters, durationMax: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
        >
          <option value="">Any</option>
          <option value="3">Up to 3</option>
          <option value="6">Up to 6</option>
          <option value="9">Up to 9</option>
          <option value="12">Up to 12</option>
          <option value="24">Up to 24</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Min Price (₹)</label>
        <input
          type="number"
          value={filters.priceMin ?? ""}
          onChange={e => setFilters({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
          placeholder="e.g. 20000"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Max Price (₹)</label>
        <input
          type="number"
          value={filters.priceMax ?? ""}
          onChange={e => setFilters({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
          placeholder="e.g. 60000"
        />
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Sort by Price</label>
        <select
          value={filters.sortPrice ?? ""}
          onChange={e => setFilters({ ...filters, sortPrice: (e.target.value as any) })}
          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
        >
          <option value="">None</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-300 mb-1">Mode</label>
        <select
          value={filters.mode ?? ""}
          onChange={e => setFilters({ ...filters, mode: e.target.value as any })}
          className="w-full px-3 py-2 rounded-lg bg-black/60 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
        >
          <option value="">Any</option>
          <option value="Online">Online</option>
          <option value="Offline">Offline</option>
        </select>
      </div>
    </div>
  )
})

function haversineDistanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371
  const toRad = (x: number) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
  return R * c
}

export default function FindInstitution() {
  const [activeTab, setActiveTab] = useState<"preference" | "nearest">("preference")

  // Preference-based search state
  const [courseQuery, setCourseQuery] = useState("")
  const [locationQuery, setLocationQuery] = useState("")
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [locLoading, setLocLoading] = useState(false)
  const [prefFilters, setPrefFilters] = useState<PreferenceFilters>({ sortPrice: "" })
  const [prefResults, setPrefResults] = useState<CourseMatch[]>([])
  const [prefSearched, setPrefSearched] = useState(false)
  const [prefLoading, setPrefLoading] = useState(false)
  const [prefError, setPrefError] = useState<string | null>(null)
  const [prefMessage, setPrefMessage] = useState<string | null>(null)
  const [prefIsSuggestion, setPrefIsSuggestion] = useState(false)

  // Nearest search state
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [geoCourseQuery, setGeoCourseQuery] = useState("")
  const [geoFilters, setGeoFilters] = useState<PreferenceFilters>({ sortPrice: "" })
  const [geoResults, setGeoResults] = useState<CourseMatch[]>([])
  const [geoAllResults, setGeoAllResults] = useState<CourseMatch[]>([])
  const [geoRadiusKm, setGeoRadiusKm] = useState<number>(50)
  const [geoSearched, setGeoSearched] = useState(false)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  // Store raw results from backend
  const [prefRawResults, setPrefRawResults] = useState<CourseMatch[]>([])

  // New state for location mode
  const [locationMode, setLocationMode] = useState<"manual" | "nearest">("manual")

  // Add this state near the top
  const [radiusKm, setRadiusKm] = useState<number>(50)

  // Memoized setFilters functions to prevent unnecessary re-renders
  const setPrefFiltersMemo = useCallback((filters: PreferenceFilters) => {
    setPrefFilters(filters)
  }, [])

  const setGeoFiltersMemo = useCallback((filters: PreferenceFilters) => {
    setGeoFilters(filters)
  }, [])


  const applyFiltersAndSort = (
    courseMatches: CourseMatch[],
    filters: PreferenceFilters,
    courseFilter?: string
  ) => {
    let out = courseMatches

    // REMOVE or comment out this block:
    // if (courseFilter) {
    //   out = out.filter(match => 
    //     match.course.toLowerCase().includes(courseFilter.toLowerCase())
    //   )
    // }

    // Filter by duration (convert "6 months" to number)
    if (filters.durationMax) {
      out = out.filter(match => {
        const durationStr = match.duration.toLowerCase()
        const months = parseInt(durationStr) || 0
        return months <= (filters.durationMax as number)
      })
    }

    // Filter by price range
    if (filters.priceMin !== undefined) {
      out = out.filter(match => match.fee >= (filters.priceMin as number))
    }

    if (filters.priceMax !== undefined) {
      out = out.filter(match => match.fee <= (filters.priceMax as number))
    }

    // Filter by mode
    if (filters.mode ) {
      out = out.filter(match => filters.mode ? (match.mode || "").toLowerCase() === filters.mode.toLowerCase() : true)
    }

    // Sort by price
    if (filters.sortPrice) {
      out = [...out].sort((a, b) => {
        if (filters.sortPrice === "asc") return a.fee - b.fee
        if (filters.sortPrice === "desc") return b.fee - a.fee
        return 0
      })
    }

    return out
  }

  // Geoapify Autocomplete for location (optional if key present)
  const GEOAPIFY_KEY = (import.meta as any)?.env?.VITE_GEOAPIFY_KEY || "c9415ba75dd14ce0ac9d47160d8a12d6"
  useEffect(() => {
    const controller = new AbortController()
    const doFetch = async () => {
      const q = locationQuery.trim()
      if (!GEOAPIFY_KEY || q.length < 2) {
        setLocationSuggestions([])
        return
      }
      setLocLoading(true)
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(q)}&type=city&limit=6&lang=en&filter=countrycode:in&apiKey=${GEOAPIFY_KEY}`
        const res = await fetch(url, { signal: controller.signal })
        const data = await res.json()
        const items: string[] = Array.isArray(data?.features)
          ? data.features.map((f: any) => f?.properties?.formatted).filter((s: any) => typeof s === "string")
          : []
        setLocationSuggestions(items)
      } catch (_) {
        // ignore
      } finally {
        setLocLoading(false)
      }
    }
    const t = setTimeout(doFetch, 300)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [locationQuery])

  const selectLocationSuggestion = (suggestion: string) => {
    setLocationQuery(suggestion)
    setLocationSuggestions([])
  }

  // Unified search handler
  const handleUnifiedSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setPrefSearched(true)
    setPrefLoading(true)
    setPrefError(null)
    setPrefMessage(null)

    if (locationMode === "nearest" && userCoords) {
      try {
        const payload = {
          course_name: courseQuery,
          latitude: userCoords.lat,
          longitude: userCoords.lng,
          radius_km: radiusKm, // <-- use radiusKm here
        }
        const res = await api.post<{ status?: string; matches?: ApiMatch[] } | ApiMatch[]>("courses/search-institutes/", payload)
        const raw = res.data as any
        const matches: ApiMatch[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.matches) ? raw.matches : [])
        const allCourseMatches: CourseMatch[] = matches.map((m, index) => ({
          id: index + 1,
          institute: (m.institute_name || m.institute || "Unknown").toString(),
          course: (m.course_name || m.course || "").toString(),
          fee: Number((m as any).fees ?? m.fee) || 0,
          duration: (m.duration ?? "0 months").toString(),
          location: (m.location || "").toString(),
          description: m.description,
          keywords: m.keywords,
          distanceKm: Number((m as any).distance_km),
          mode: m.mode,
        }))
        setPrefRawResults(allCourseMatches)
      } catch (err: any) {
        setPrefError(err?.message || "Failed to fetch nearest institutions.")
        setPrefRawResults([])
      } finally {
        setPrefLoading(false)
      }
      return
    }

    // Otherwise, use manual location search
    try {
      const payload = { course: courseQuery, location: locationQuery }
      const res = await api.post<{ status: string; message?: string; matches: ApiMatch[] }>("courses/search/", payload)
      const matches = Array.isArray(res.data?.matches) ? res.data.matches : []
      const status = res.data?.status || "results"
      const message = res.data?.message

      if (status === "suggestions") {
        setPrefMessage(message || "No exact match found — showing similar courses.")
        setPrefError(null)
        setPrefIsSuggestion(true)
      } else {
        setPrefMessage(null)
        setPrefError(null)
        setPrefIsSuggestion(false)
      }

      if (!matches.length) {
        setPrefRawResults([])
        return
      }

      const courseMatches: CourseMatch[] = matches.map((m, index) => ({
        id: index + 1,
        institute: (m.institute_name || m.institute || "Unknown").toString(),
        course: (m.course_name || m.course || "").toString(),
        fee: Number(m.fee) || 0,
        duration: m.duration?.toString() || "0 months",
        location: (m.location || "").toString(),
        description: m.description,
        keywords: m.keywords,
        mode: m.mode,
      }))
      setPrefRawResults(courseMatches)
    } catch (err: any) {
      setPrefError(err?.message || "Failed to fetch search results.")
      setPrefRawResults([])
    } finally {
      setPrefLoading(false)
    }
  }

  // Live filter application
  useEffect(() => {
    if (prefSearched) {
      setPrefResults(applyFiltersAndSort(prefRawResults, prefFilters))
    }
  }, [prefFilters, prefRawResults, prefSearched])

  // Nearest search handler
  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.")
      return
    }
    setLocLoading(true) // <-- Start spinner
    navigator.geolocation.getCurrentPosition(
      pos => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocLoading(false) // <-- Stop spinner on success
        console.log(pos.coords.latitude, pos.coords.longitude)
      },
      () => {
        alert("Unable to retrieve your location. Please allow location access.")
        setLocLoading(false) // <-- Stop spinner on error
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleNearestSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeoSearched(true)
    setGeoLoading(true)
    setGeoError(null)
    if (!userCoords) {
      alert("Please allow location access first.")
      setGeoLoading(false)
      return
    }

    const runDummy = () => {
      const all: CourseMatch[] = []
      DUMMY_INSTITUTIONS.forEach(inst => {
        const dist = haversineDistanceKm(userCoords, { lat: inst.latitude, lng: inst.longitude })
        inst.courses.forEach(course => {
          const courseMatch = geoCourseQuery.trim().length === 0
            ? true
            : course.name.toLowerCase().includes(geoCourseQuery.toLowerCase())
          if (courseMatch) {
            all.push({
              id: all.length + 1,
              institute: inst.name,
              course: course.name,
              fee: course.price,
              duration: `${course.durationMonths} months`,
              location: inst.city,
              distanceKm: Math.round((dist + Number.EPSILON) * 100) / 100,
            })
          }
        })
      })
      setGeoAllResults(all)
      const within = all.filter(m => (m.distanceKm ?? Infinity) <= geoRadiusKm)
      setGeoResults(applyFiltersAndSort(within, geoFilters, geoCourseQuery))
    }

    try {
      const payload = {
        course_name: geoCourseQuery,
        latitude: userCoords.lat,
        longitude: userCoords.lng,
        radius_km: geoRadiusKm,
      }
      const res = await api.post<{ status?: string; matches?: ApiMatch[] } | ApiMatch[]>("courses/search-institutes/", payload)
      const raw = res.data as any
      const matches: ApiMatch[] = Array.isArray(raw) ? raw : (Array.isArray(raw?.matches) ? raw.matches : [])

      // Convert API matches to CourseMatch array and enforce distance <= 50km on client for safety
      const allCourseMatches: CourseMatch[] = []
      matches.forEach((m, index) => {
        const lat = m.latitude ? parseFloat(m.latitude) : 0
        const lng = m.longitude ? parseFloat(m.longitude) : 0
        const dist = userCoords ? haversineDistanceKm(userCoords, { lat, lng }) : Infinity
        allCourseMatches.push({
          id: index + 1,
          institute: (m.institute_name || m.institute || "Unknown").toString(),
          course: (m.course_name || m.course || "").toString(),
          fee: Number((m as any).fees ?? m.fee) || 0,
          duration: (m.duration ?? "0 months").toString(),
          location: (m.location || "").toString(),
          description: m.description,
          keywords: m.keywords,
          distanceKm: Number((m as any).distance_km) || Math.round((dist + Number.EPSILON) * 100) / 100,
          mode: m.mode, // <-- Add this line!
        })
      })
      setGeoAllResults(allCourseMatches)
      const within = allCourseMatches.filter(m => (m.distanceKm ?? Infinity) <= geoRadiusKm)
      setGeoResults(applyFiltersAndSort(within, geoFilters, geoCourseQuery))
    } catch (err: any) {
      setGeoError(err?.message || "Failed to fetch nearest institutions. Showing demo data.")
      runDummy()
    } finally {
      setGeoLoading(false)
    }
  }

  // Maximum distance for nearest search (in km)
  const MAX_DISTANCE_KM = 50;

  // Re-apply on geo filter changes
  useEffect(() => {
    if (geoSearched && userCoords) {
      const courseMatches: CourseMatch[] = []
      DUMMY_INSTITUTIONS.forEach(inst => {
        const dist = haversineDistanceKm(userCoords, { lat: inst.latitude, lng: inst.longitude })
        if (dist <= MAX_DISTANCE_KM) {
          inst.courses.forEach(course => {
            const courseMatch = geoCourseQuery.trim().length === 0
              ? true
              : course.name.toLowerCase().includes(geoCourseQuery.toLowerCase())
            
            if (courseMatch) {
              courseMatches.push({
                id: courseMatches.length + 1,
                institute: inst.name,
                course: course.name,
                fee: course.price,
                duration: `${course.durationMonths} months`,
                location: inst.city,
              })
            }
          })
        }
      })
      setGeoResults(applyFiltersAndSort(courseMatches, geoFilters, geoCourseQuery))
    }
  }, [geoFilters])

  

  const CourseMatchCard = ({ match }: { match: CourseMatch }) => {
    return (
      <div className="p-5 rounded-xl bg-gray-800/60 border border-gray-700 hover:border-cyan-500/40 transition">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-cyan-300">{match.course}</h3>
            <p className="text-gray-400 text-sm mb-2">{match.institute}</p>
            <div className="flex items-center gap-4 text-sm text-gray-300 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="text-gray-500">📍</span>
                {match.location}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-gray-500">⏱️</span>
                {match.duration}
              </span>
              {match.mode && (
                <span className="flex items-center gap-1">
                  <span className="text-gray-500">🎓</span>
                  {match.mode}
                </span>
              )}
              {typeof match.distanceKm === "number" && !Number.isNaN(match.distanceKm) && (
                <span className="flex items-center gap-1">
                  <span className="text-gray-500">📏</span>
                  {match.distanceKm.toFixed(2)} km
                </span>
              )}
            </div>
            {match.description && (
              <p className="text-gray-400 text-sm mt-2 line-clamp-2">{match.description}</p>
            )}
            {match.keywords && match.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {match.keywords.slice(0, 3).map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                    {keyword}
                  </span>
                ))}
                {match.keywords.length > 3 && (
                  <span className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-400">
                    +{match.keywords.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-right ml-4">
            <p className="text-sm text-gray-400">Fee</p>
            <p className="text-xl font-semibold text-white">₹{match.fee.toLocaleString()}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-cyan-400 mb-10">Find Institutions</h1>

        {/* Unified Search Form */}
        <motion.form
          onSubmit={handleUnifiedSearch}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/60 border border-cyan-500/20 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm text-gray-300 mb-1">Course Name</label>
            <input
              type="text"
              value={courseQuery}
              onChange={e => setCourseQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/60 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              placeholder="e.g. React, Data Science"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Location</label>
            <div className="flex gap-2">
              <select
                value={locationMode}
                onChange={e => setLocationMode(e.target.value as "manual" | "nearest")}
                className="px-2 py-2 rounded-lg bg-black/60 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
              >
                <option value="manual">Prefered Location</option>
                <option value="nearest">Find Nearest</option>
              </select>
              {locationMode === "nearest" ? (
                <button
                  type="button"
                  onClick={requestLocation}
                  className="px-3 py-2 rounded-lg bg-gray-800/60 border border-gray-600 text-white hover:bg-gray-800 transition flex items-center gap-2"
                  disabled={locLoading}
                >
                  {locLoading ? (
                    <span className="flex items-center gap-2">
                      <span>Accessing</span>
                      <span className="w-4 h-4 border-2 border-gray-400 border-t-cyan-400 rounded-full animate-spin"></span>
                    </span>
                  ) : userCoords ? (
                    "Location Set ✓"
                  ) : (
                    "Allow Location"
                  )}
                </button>
              ) : null}
            </div>
            {locationMode === "manual" && (
              <div style={{ position: "relative", marginTop: "0.5rem" }}>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={e => setLocationQuery(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/60 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
                  placeholder="e.g. Mumbai, Delhi"
                />
                {locationSuggestions.length > 0 && (
                  <div
                    className="absolute left-0 right-0 mt-2 rounded-lg border border-gray-700 bg-gray-900/80 max-h-56 overflow-auto z-10"
                    style={{ top: "100%" }}
                  >
                    {locationSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectLocationSuggestion(s)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-800 text-sm text-gray-200"
                      >
                        {s}
                      </button>
                    ))}
                    {locLoading && (
                      <div className="px-3 py-2 text-xs text-gray-400">Loading…</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="md:col-span-2">
            {/* {locationMode === "nearest" && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Radius (km)</label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={radiusKm}
                  onChange={e => setRadiusKm(Number(e.target.value) || 1)}
                  className="w-full px-4 py-3 rounded-lg bg-black/60 border border-gray-600 text-white focus:ring-2 focus:ring-cyan-400 outline-none"
                  placeholder="e.g. 50"
                />
              </div>
            )} */}
            <div className="flex items-end mt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3 rounded-lg bg-cyan-500 text-black font-semibold"
              >
                Search
              </motion.button>
            </div>
          </div>
        </motion.form>

        {/* Filters */}
        <div className="mt-6">
          <FilterControls filters={prefFilters} setFilters={setPrefFiltersMemo} />
        </div>

        {/* Results */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {prefLoading && (
            <p className="text-gray-400">Searching...</p>
          )}
          {!prefLoading && prefMessage && (
            <div className="col-span-full mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-center">
              <p className="text-sm">{prefMessage}</p>
            </div>
          )}
          {!prefLoading && prefError && (
            <p className="text-yellow-400 col-span-full">{prefError}</p>
          )}
          {prefSearched && prefResults.length === 0 && !prefMessage && (
            <p className="text-gray-400 col-span-full">No institutions match your search.</p>
          )}
          {prefResults.map(match => (
            <CourseMatchCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </div>
  )
}


