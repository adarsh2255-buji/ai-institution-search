// import React, { useState, useEffect, useRef } from 'react';
// import { motion, type Variants } from 'framer-motion';
// import api from '../api/client';
// import axios from 'axios';

// // --- Professional Utility Hook: useDebounce ---
// // This hook delays updating a value until a user stops interacting, preventing excessive API calls.
// function useDebounce<T>(value: T, delay: number): T {
//   const [debouncedValue, setDebouncedValue] = useState<T>(value);

//   useEffect(() => {
//     const handler = setTimeout(() => setDebouncedValue(value), delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);

//   return debouncedValue;
// }
// // External API Key 
// const GEOAPIFY_API_KEY = 'c9415ba75dd14ce0ac9d47160d8a12d6'
// const GEOAPIFY_REVERSE_URL = "https://api.geoapify.com/v1/geocode/reverse";



// // --- Framer Motion Variants (Kept from original snippet) ---
// const containerVariants: Variants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.6,
//       ease: 'easeInOut',
//     },
//   },
// };

// // --- Custom Animated Toggle Switch Component ---
// interface ToggleSwitchProps {
//   useNearest: boolean;
//   setUseNearest: (value: boolean) => void;
// }

// const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ useNearest, setUseNearest }) => {
//   return (
//     <div
//       className={`relative inline-flex items-center h-7 rounded-full w-14 transition-colors duration-200 cursor-pointer ${useNearest ? 'bg-blue-600' : 'bg-gray-300'}`}
//       onClick={() => setUseNearest(!useNearest)}
//     >
//       <motion.div
//         className="absolute w-5 h-5 bg-white rounded-full shadow-md"
//         initial={false}
//         animate={{ x: useNearest ? '1.75rem' : '0.25rem' }}
//         transition={{ type: "spring", stiffness: 700, damping: 30 }}
//       />
//     </div>
//   );
// };


// // --- Main Application Component (Renamed to FindInstitution for single-file export) ---
// const FindInstitution: React.FC = () => {
//   // State for the new toggle button
//   const [useNearest, setUseNearest] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [loadingLocation, setLoadingLocation] = useState(false);

//   // New states for GeoLocation feature
//   const [loadingGeo, setLoadingGeo] = useState(false);
//   const [currentLocationName, setCurrentLocationName] = useState('');

//   //Autocomplete states
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

//   //location Autocomplete States
//   const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
//   const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
//   const [activeLocationIndex, setActiveLocationIndex] = useState(-1);

//   // State for form inputs (for demonstration, allowing us to see values)
//   const [formData, setFormData] = useState({
//     courseName: '',
//     location: '',
//     minPrice: '',
//     maxPrice: '',
//     duration: '',
//   });

//   // Debounced form data for search
//   const debouncedCourseName = useDebounce(formData.courseName, 300);
//   const debouncedLocation = useDebounce(formData.location, 300);

//     // Ref to target the next input box for focusing (Location input)
//     const locationInputRef = React.useRef<HTMLInputElement>(null);
//     // Ref to track if the input was set programmatically (via selection)
//     const isProgrammaticRef = useRef(false);
//     const isLocationProgrammaticRef = useRef(false);

//     //Geolocation functionality
//     const fetchCurrentLocationName = () => {
//     if (!navigator.geolocation) {
//       console.error('Geolocation is not supported by your browser');
//       setCurrentLocationName("Geolocation not supported");
//       return;
//     }
//     setLoadingGeo(true);
//     setCurrentLocationName(""); // Clear previous location
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         console.log('User coordinates:', latitude, longitude);
//         try {
//           const response = await axios.get(`${GEOAPIFY_REVERSE_URL}?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`);
//           setCurrentLocationName(response.data.features[0].properties.formatted);
//           setLoadingGeo(false);
//         } catch (error) {
//           console.error('Error fetching location name:', error);
//           setCurrentLocationName("Unable to retrieve location");
//         } finally {
//           setLoadingGeo(false);
//         }
//       },
//       (error) => {
//         console.error('Error getting location:', error);
//         setLoadingGeo(false);
//       }
//     );
//   }


//   // --- Simulated API Call Function ---
//   // In a real application, replace this with your actual fetch logic.
//   const fetchCourseSuggestions = async (input: string) => {
//     //only fetch if input is significant
//     if (input.length < 2) {
//       setSuggestions([]);
//       setShowSuggestions(false);
//       setLoading(false);
//       return;
//     }
//     // If this fetch was triggered by a programmatic change (selection),
//     // clear the flag and prevent the suggestion box from re-opening.
//     if (isProgrammaticRef.current) {
//         isProgrammaticRef.current = false;
//         setLoading(false);
//         return;
//     }
//     setLoading(true);
//     try {
//       //Simulate API call to /courses/course-names with a delay
//       const response = await api.get('/courses/course-names/');
//       // Filter the results based on the user input
//       const filtered = response.data.courses.filter((course: string) =>
//         course.toLowerCase().includes(input.toLowerCase())
//       );
//       setSuggestions(filtered);
//       setShowSuggestions(filtered.length > 0);
//     } catch (error) {
//       console.error('Error fetching course suggestions:', error);
//       setSuggestions([]);
//     } finally {
//       setLoading(false);
//     }
//   }
//   // --- Geoapify Location Suggestions Logic (Simulated) ---
//   const fetchLocationSuggestions = async (input: string) => {
//     // Autocomplete is disabled if useNearest is true
//     if(useNearest || input.length < 3) {
//       setLocationSuggestions([]);
//       setShowLocationSuggestions(false);
//       setLoadingLocation(false);
//       return;
//     }

//     if(isLocationProgrammaticRef.current) {
//       isLocationProgrammaticRef.current = false;
//       setLoadingLocation(false);
//       return;
//     }
//     setLoadingLocation(true);
//     try {
//       const response = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(input)}&limit=5&apiKey=${GEOAPIFY_API_KEY}`);
//       const data = response.data;
//       setLocationSuggestions(data.features.map((feature: any) => feature.properties.formatted));
//       setShowLocationSuggestions(true);
//     } catch (error) {
//       console.error('Error fetching location suggestions:', error);
//       setLocationSuggestions([]);
//     } finally {
//       setLoadingLocation(false);
//     }
//   }
//   // Effect to fetch suggestions when debouncedCourseName changes
//    useEffect(() => {
//     if (debouncedCourseName) {
//       fetchCourseSuggestions(debouncedCourseName);
//     } else {
//       setSuggestions([]);
//       setShowSuggestions(false);
//     }
//   }, [debouncedCourseName]);

//   // Effect to fetch location suggestions when debouncedLocation changes
//     useEffect(() => {
//     if (debouncedLocation && !useNearest) {
//       fetchLocationSuggestions(debouncedLocation);
//     } else {
//       setLocationSuggestions([]);
//       setShowLocationSuggestions(false);
//     }
//   }, [debouncedLocation, useNearest]);

//     // --- Handlers ---

//   const handleToggleNearest = (isNearest: boolean) => {
//     setUseNearest(isNearest);
//     // If turning ON nearest mode, fetch location
//     if (isNearest) {
//         // Clear manual input immediately
//         setFormData(prev => ({ ...prev, location: '' })); 
//         fetchCurrentLocationName();
//     } else {
//         // If turning OFF nearest mode, clear auto-detected status
//         setCurrentLocationName('');
//         setLoadingGeo(false);
//     }
//   };


//   /**
//    * Handles changes in all input fields, with special logic for courseName.
//    */
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { id, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [id]: value,
//     }));
  
//   };

//   /**
//    * Handles selection of a suggestion (either via click or Enter key).
//    */
//     const handleSelectSuggestion = (course: string) => {
//     // FIX: Set flag to prevent debounced fetch from re-opening suggestions
//     isProgrammaticRef.current = true;
//     setFormData(prev => ({ ...prev, courseName: course }));
//     setShowSuggestions(false);
//     setSuggestions([]);
    
//     // Move focus to the next input immediately after selection
//     if (locationInputRef.current) {
//         locationInputRef.current.focus();
//     }
//    };

//      const handleSelectLocation = (location: string) => {
//     isLocationProgrammaticRef.current = true;
//     setFormData(prev => ({ ...prev, location }));
//     setShowLocationSuggestions(false);
//     setActiveLocationIndex(-1);
    
//     // Move focus to the next input (Min Price, though we don't have a ref for it,
//     // selecting usually moves focus away from the list)
//   };

//      /**
//    * Handles keyboard navigation and submission for the courseName input.
//    */
//     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     // Escape key always closes suggestions
//     if (e.key === 'Escape') {
//       setShowSuggestions(false);
//       setActiveSuggestionIndex(-1);
//       return;
//     }
//         // Only handle navigation keys if suggestions are visible
//     if (!showSuggestions) {
//       if (e.key === 'Enter' && locationInputRef.current) {
//         // If no suggestions are showing, hitting Enter moves focus to the next field
//         e.preventDefault();
//         locationInputRef.current.focus();
//       }
//       return;
//     }

//     if (e.key === 'ArrowDown') {
//       e.preventDefault(); // Prevent cursor movement
//       setActiveSuggestionIndex(prevIndex => 
//         (prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0)
//       );
//     } else if (e.key === 'ArrowUp') {
//       e.preventDefault(); // Prevent cursor movement
//       setActiveSuggestionIndex(prevIndex => 
//         (prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1)
//       );
//     } else if (e.key === 'Enter') {
//       e.preventDefault();
//       if (activeSuggestionIndex !== -1) {
//         // User selected a suggestion
//         handleSelectSuggestion(suggestions[activeSuggestionIndex]);
//       } else {
//         // User typed a value and hit Enter without selecting
//         setShowSuggestions(false);
//         setActiveSuggestionIndex(-1);
//         if (locationInputRef.current) {
//           locationInputRef.current.focus();
//         }
//       }
//     }
//   }

//    const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Escape') {
//       setShowLocationSuggestions(false);
//       setActiveLocationIndex(-1);
//       return;
//     }
    
//     if (!showLocationSuggestions) return;

//     if (e.key === 'ArrowDown') {
//       e.preventDefault();
//       setActiveLocationIndex(prevIndex => 
//         (prevIndex < locationSuggestions.length - 1 ? prevIndex + 1 : 0)
//       );
//     } else if (e.key === 'ArrowUp') {
//       e.preventDefault();
//       setActiveLocationIndex(prevIndex => 
//         (prevIndex > 0 ? prevIndex - 1 : locationSuggestions.length - 1)
//       );
//     } else if (e.key === 'Enter') {
//       e.preventDefault();
//       if (activeLocationIndex !== -1) {
//         handleSelectLocation(locationSuggestions[activeLocationIndex]);
//       } else {
//         setShowLocationSuggestions(false);
//         setActiveLocationIndex(-1);
//       }
//     }
//   }

//   const handleSearch = () => {
//     // In a real app, you would dispatch an API call here.
//     const searchMode = useNearest ? 'Find Nearest' : 'Preferred Location';
//     console.log(`Searching in mode: ${searchMode}`);
//     console.log('Form Data:', formData);
//     // Logic for search: If useNearest is true, you would use Geolocation API data
//     // If useNearest is false, you would use formData.location
//   };

//   // Class strings for conditional styling of the location input
//   const locationInputClasses = useNearest 
//     ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
//     : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

//   const preferredLabelClass = !useNearest ? 'text-blue-600 font-bold' : 'text-gray-500 font-medium';
//   const nearestLabelClass = useNearest ? 'text-blue-600 font-bold' : 'text-gray-500 font-medium';

//     // Determine input display properties when nearest mode is active
//   let locationValue = formData.location;
//   let locationPlaceholder = "City, State or Country";
//     if (useNearest) {
//       if (loadingGeo) {
//           locationPlaceholder = "Fetching your location...";
//           locationValue = '';
//       } else if (currentLocationName) {
//           locationValue = currentLocationName;
//           locationPlaceholder = "Auto-detected";
//       } else {
//           locationPlaceholder = "Auto-detecting your location...";
//           locationValue = '';
//       }
//       // Note: When useNearest is true, we display the auto-detected or loading status,
//       // not the manually entered formData.location.
//       locationValue = currentLocationName;
//   } else {
//     locationValue = formData.location;
//     locationPlaceholder = "City, State or Country";
//   }

//   return (
//     <div className="font-sans flex justify-center p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
//       <motion.div
//         className="w-full max-w-4xl p-6 sm:p-8 bg-white rounded-xl shadow-2xl border border-gray-100"
//         variants={containerVariants}
//         initial="hidden"
//         animate="visible"
//       >
//         <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
//           Find Your Institution
//         </h2>
        
//         {/* Toggle Switch for Location Mode */}
//         <div className="flex items-center justify-between mb-4 p-4 bg-blue-50/50 rounded-lg border border-blue-100">
//           <span className={`text-base transition-colors duration-200 ${preferredLabelClass}`}>
//             Your Preferred Location
//           </span>
          
//           <ToggleSwitch 
//             useNearest={useNearest} 
//             setUseNearest={setUseNearest} 
//           />
          
//           <span className={`text-base transition-colors duration-200 ${nearestLabelClass}`}>
//             Find Nearest
//           </span>
//         </div>
        
//         {/* Search Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
//           {/* Course Name Input with Autocomplete */}
//           <div className="relative">
//             <label htmlFor="courseName" className="block mb-2 text-sm font-medium text-gray-700">
//               Course Name
//             </label>
//             <div className="relative">
//                 <input
//                     type="text"
//                     id="courseName"
//                     value={formData.courseName}
//                     onChange={handleInputChange}
//                     onKeyDown={handleKeyDown}
//                     onBlur={() => {
//                       // Delay hiding to allow click events on suggestions to register
//                       setTimeout(() => setShowSuggestions(false), 150);
//                     }}
//                     onFocus={() => {
//                       // Show suggestions again if there is input and we have results
//                       if (formData.courseName.length >= 2 && suggestions.length > 0) {
//                           setShowSuggestions(true);
//                       }
//                     }}
//                     placeholder="e.g., Full-Stack Development"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow pr-10"
//                     autoComplete="off" // Critical for preventing browser autocomplete
//                 />
//                 {/* Loading Spinner */}
//                 {loading && (
//                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                         <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                     </div>
//                 )}
//             </div>

//             {/* Suggestions Dropdown */}
//             {showSuggestions && suggestions.length > 0 && (
//               <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
//                 {suggestions.map((course, index) => (
//                   <li
//                     key={course}
//                     // Use onMouseDown instead of onClick to ensure the event fires before input loses focus
//                     onMouseDown={() => handleSelectSuggestion(course)}
//                     className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${
//                       index === activeSuggestionIndex 
//                         ? 'bg-blue-100 text-blue-800 font-semibold' 
//                         : 'text-gray-700 hover:bg-gray-50'
//                     }`}
//                   >
//                     {course}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* 2. Location Input with Autocomplete/Geolocation */}
//           <div className="relative">
//             <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-700">
//               Location
//             </label>
//             <div className="relative">
//                 <input
//                 ref={locationInputRef}
//                 type="text"
//                 id="location"
//                 value={locationValue}
//                 onChange={handleInputChange}
//                 onKeyDown={handleLocationKeyDown}
//                 onBlur={() => {
//                     setTimeout(() => setShowLocationSuggestions(false), 150);
//                 }}
//                 onFocus={() => {
//                     if (!useNearest && formData.location.length >= 3 && locationSuggestions.length > 0) {
//                         setShowLocationSuggestions(true);
//                     }
//                 }}
//                 disabled={useNearest || loadingGeo}
//                 placeholder={locationPlaceholder}
//                 className={`w-full px-4 py-2 border rounded-lg transition-all duration-200 text-sm pr-10 ${locationInputClasses}`}
//                 autoComplete="off"
//                 />
//                 {/* Loading Spinner for Location Autocomplete/Geolocation */}
//                 {(loadingLocation && !useNearest) || (loadingGeo && useNearest) ? (
//                     <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                         <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                     </div>
//                 ) : null}
//             </div>

//             {/* Suggestions Dropdown for Location (Only visible in manual mode) */}
//             {showLocationSuggestions && locationSuggestions.length > 0 && !useNearest && (
//               <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
//                 {locationSuggestions.map((location, index) => (
//                   <li
//                     key={location}
//                     onMouseDown={() => handleSelectLocation(location)}
//                     className={`px-4 py-2 text-sm cursor-pointer transition-colors duration-150 ${
//                       index === activeLocationIndex 
//                         ? 'bg-blue-100 text-blue-800 font-semibold' 
//                         : 'text-gray-700 hover:bg-gray-50'
//                     }`}
//                   >
//                     {location}
//                   </li>
//                 ))}
//               </ul>
//             )}

//             {/* Status message for Find Nearest mode */}
//             {useNearest && (
//                 <p className={`mt-1 text-xs flex items-center ${loadingGeo ? 'text-gray-500' : 'text-blue-600'}`}>
//                     {/* Map Pin Icon */}
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                     </svg>
//                     {loadingGeo 
//                         ? 'Fetching your current location...' 
//                         : currentLocationName 
//                             ? `Auto-detected: ${currentLocationName}` 
//                             : 'Search will use your current geographical location.'
//                     }
//                 </p>
//             )}
//           </div>
//           {/* Min Price Input */}
//           <div>
//             <label htmlFor="minPrice" className="block mb-2 text-sm font-medium text-gray-700">
//               Min Price ($)
//             </label>
//             <input
//               type="number"
//               id="minPrice"
//               value={formData.minPrice}
//               onChange={handleInputChange}
//               placeholder="1000"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
//             />
//           </div>

//           {/* Max Price Input */}
//           <div>
//             <label htmlFor="maxPrice" className="block mb-2 text-sm font-medium text-gray-700">
//               Max Price ($)
//             </label>
//             <input
//               type="number"
//               id="maxPrice"
//               value={formData.maxPrice}
//               onChange={handleInputChange}
//               placeholder="5000"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
//             />
//           </div>

//           {/* Duration Input */}
//           <div>
//             <label htmlFor="duration" className="block mb-2 text-sm font-medium text-gray-700">
//               Duration (months)
//             </label>
//             <input
//               type="text"
//               id="duration"
//               value={formData.duration}
//               onChange={handleInputChange}
//               placeholder="e.g., 6"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
//             />
//           </div>
//         </div>

//         {/* Button container */}
//         <div className="mt-8 flex justify-center">
//           <button
//             type="button"
//             onClick={handleSearch}
//             className="w-full sm:w-auto px-12 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
//           >
//             Search Institutions
//           </button>
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default FindInstitution;





import React, { useState, useEffect, useCallback } from 'react';

// --- TYPE DEFINITIONS ---
// Defines the structure for a single course object
interface Course {
    id: number;
    course: string;
    description: string;
    keywords: string[];
    fee: number;
    durationInMonths: number;
    institute: string;
    location: string;
    latitude: number;
    longitude: number;
    mode: 'Online' | 'Offline' | 'Hybrid';
}

// Defines the structure for the search results returned by the AI
interface SearchResults {
    exactMatches: Course[];
    recommendations: Course[];
}

// Defines the structure for user coordinates
interface Coordinates {
    latitude: number;
    longitude: number;
}


// --- MOCK BACKEND DATA ---
// In a real application, this would be fetched from an API endpoint.
const mockCourseData: Course[] = [
    {"id": 1, "course": "Web Development", "description": "Learn to design and build dynamic, responsive websites using modern front-end and back-end technologies.", "keywords": ["frontend development", "backend development", "full stack development", "html", "css", "javascript", "react"], "fee": 45000, "durationInMonths": 6, "institute": "Tech Academy", "location": "Trivandrum", "latitude": 8.5241, "longitude": 76.9366, "mode": "Online"},
    {"id": 2, "course": "Data Science", "description": "Gain hands-on experience in data analysis, machine learning, and AI-driven insights using Python and advanced tools.", "keywords": ["machine learning", "AI", "big data", "python", "statistics"], "fee": 60000, "durationInMonths": 8, "institute": "Data Insights", "location": "Trivandrum", "latitude": 8.5241, "longitude": 76.9366, "mode": "Offline"},
    {"id": 3, "course": "Digital Marketing", "description": "Master SEO, SEM, content marketing, and social media strategies to drive business growth online.", "keywords": ["seo", "sem", "social media", "google analytics"], "fee": 35000, "durationInMonths": 4, "institute": "MarketPro", "location": "Kochi", "latitude": 9.9312, "longitude": 76.2673, "mode": "Online"},
    {"id": 4, "course": "Cyber Security", "description": "Learn ethical hacking, network security, and cryptography to protect digital assets from cyber threats.", "keywords": ["ethical hacking", "network security", "penetration testing"], "fee": 75000, "durationInMonths": 9, "institute": "SecureNet", "location": "Kochi", "latitude": 9.9312, "longitude": 76.2673, "mode": "Offline"},
    {"id": 5, "course": "Full Stack Engineering", "description": "Become a complete developer by mastering both front-end and back-end technologies including databases and deployment.", "keywords": ["react", "nodejs", "mongodb", "full stack", "web development"], "fee": 80000, "durationInMonths": 8, "institute": "Tech Academy", "location": "Trivandrum", "latitude": 8.5241, "longitude": 76.9366, "mode": "Online"},
    {"id": 6, "course": "AI and Machine Learning", "description": "Dive deep into the world of Artificial Intelligence, learning algorithms, neural networks, and practical applications.", "keywords": ["ai", "machine learning", "neural networks", "tensorflow", "data science"], "fee": 90000, "durationInMonths": 10, "institute": "Data Insights", "location": "Kochi", "latitude": 9.9312, "longitude": 76.2673, "mode": "Hybrid"},
    {"id": 7, "course": "Cloud Computing", "description": "Master AWS, Azure, and Google Cloud platforms to design, deploy, and manage scalable applications.", "keywords": ["aws", "azure", "gcp", "devops", "cloud"], "fee": 65000, "durationInMonths": 7, "institute": "CloudVerse", "location": "Bangalore", "latitude": 12.9716, "longitude": 77.5946, "mode": "Online"},
    {"id": 8, "course": "Mobile App Development", "description": "Build native and cross-platform mobile apps for Android and iOS using Flutter and React Native.", "keywords": ["android", "ios", "flutter", "react native", "mobile"], "fee": 55000, "durationInMonths": 6, "institute": "AppMakers", "location": "Bangalore", "latitude": 12.9716, "longitude": 77.5946, "mode": "Offline"},
    {"id": 9, "course": "Web Development", "description": "Learn to design and build dynamic, responsive websites using modern front-end and back-end technologies.", "keywords": ["frontend development", "backend development", "full stack development", "html", "css", "javascript", "react"], "fee": 45000, "durationInMonths": 6, "institute": "Future tech", "location": "Kollam", "latitude": 8.8932, "longitude": 76.6141, "mode": "Offline"},

];


// --- MAIN APP COMPONENT ---
export default function FindInstitution() {
    // --- STATE MANAGEMENT ---
    // Form input states
    const [courseQuery, setCourseQuery] = useState('');
    const [location, setLocation] = useState('');
    const [duration, setDuration] = useState('');
    const [minFee, setMinFee] = useState('');
    const [maxFee, setMaxFee] = useState('');

    // Data and UI states
    const [allCourses] = useState<Course[]>(mockCourseData);
    const [uniqueCourseNames, setUniqueCourseNames] = useState<string[]>([]);
    const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<SearchResults | null>(null);
    const [userCoords, setUserCoords] = useState<Coordinates | null>(null);

    // --- EFFECTS ---
    // Effect to populate unique course names on component mount
    useEffect(() => {
        setUniqueCourseNames([...new Set(allCourses.map(c => c.course))]);
    }, [allCourses]);

    // --- HANDLERS & LOGIC ---
    const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setCourseQuery(query);

        if (query.length > 0) {
            const filtered = uniqueCourseNames
                .filter(name => name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5);
            setAutocompleteSuggestions(filtered);
        } else {
            setAutocompleteSuggestions([]);
        }
    };

    const handleSelectSuggestion = (suggestion: string) => {
        setCourseQuery(suggestion);
        setAutocompleteSuggestions([]);
    };
    
    // Main search function triggered by buttons
    const handleSearch = useCallback(async (isNearestSearch: boolean) => {
        // Reset UI
        setIsLoading(true);
        setError(null);
        setResults(null);
        setUserCoords(null);
        setLoadingMessage(isNearestSearch ? "Getting your location and finding courses..." : "Asking Gemini AI for courses...");

        let coords: Coordinates | null = null;
        if (isNearestSearch) {
            try {
                coords = await getCurrentLocation();
                setUserCoords(coords);
            } catch (err) {
                setError("Could not get your location. Please enable location services and try again.");
                setIsLoading(false);
                return;
            }
        }

        const userInputs = { course: courseQuery, location, minFee, maxFee, duration };
        const prompt = buildPrompt(userInputs, allCourses, isNearestSearch, coords);

        try {
            const response = await callGeminiAPI(prompt);
            // Robust parsing of potentially malformed JSON
            const cleanedResponse = response.replace(/```json|```/g, '').trim();
            const searchResults: SearchResults = JSON.parse(cleanedResponse);
            setResults(searchResults);
        } catch (err) {
            console.error("Gemini API Error:", err);
            setError("Sorry, the AI is having trouble processing the request. Check the console for details.");
        } finally {
            setIsLoading(false);
        }
    }, [courseQuery, location, minFee, maxFee, duration, allCourses]);


    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
            <Header />
            <SearchForm 
                inputs={{ courseQuery, location, duration, minFee, maxFee }}
                setters={{ setCourseQuery, setLocation, setDuration, setMinFee, setMaxFee }}
                onSearch={handleSearch}
                autocompleteSuggestions={autocompleteSuggestions}
                onCourseInputChange={handleCourseInputChange}
                onSelectSuggestion={handleSelectSuggestion}
            />
            <ResultsDisplay 
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                error={error}
                results={results}
                userCoords={userCoords}
            />
        </div>
    );
}


// --- CHILD COMPONENTS ---

const Header = () => (
    <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-400">AI Powered Course Finder</h1>
        <p className="text-gray-400 mt-2">Find your perfect course with the power of Gemini AI.</p>
    </header>
);

// Defines the props for the SearchForm component
interface SearchFormProps {
    inputs: { courseQuery: string; location: string; duration: string; minFee: string; maxFee: string; };
    setters: {
        setCourseQuery: (val: string) => void;
        setLocation: (val: string) => void;
        setDuration: (val: string) => void;
        setMinFee: (val: string) => void;
        setMaxFee: (val: string) => void;
    };
    onSearch: (isNearest: boolean) => void;
    autocompleteSuggestions: string[];
    onCourseInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectSuggestion: (suggestion: string) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ inputs, setters, onSearch, autocompleteSuggestions, onCourseInputChange, onSelectSuggestion }) => (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative md:col-span-2">
                <label htmlFor="course-name" className="block text-sm font-medium text-gray-300 mb-1">Course Name</label>
                <input type="text" id="course-name" placeholder="e.g., Web Development" value={inputs.courseQuery} onChange={onCourseInputChange} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
                {autocompleteSuggestions.length > 0 && (
                    <div id="autocomplete-list" className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg">
                        {autocompleteSuggestions.map(suggestion => (
                            <div key={suggestion} onClick={() => onSelectSuggestion(suggestion)} className="p-3 hover:bg-gray-600 cursor-pointer">{suggestion}</div>
                        ))}
                    </div>
                )}
            </div>
             <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input type="text" id="location" placeholder="e.g., Trivandrum" value={inputs.location} onChange={e => setters.setLocation(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"/>
            </div>
            <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Max Duration (Months)</label>
                <input type="number" id="duration" placeholder="e.g., 6" value={inputs.duration} onChange={e => setters.setDuration(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"/>
            </div>
            <div>
                <label htmlFor="min-fees" className="block text-sm font-medium text-gray-300 mb-1">Min Fees (₹)</label>
                <input type="number" id="min-fees" placeholder="e.g., 30000" value={inputs.minFee} onChange={e => setters.setMinFee(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"/>
            </div>
            <div>
                <label htmlFor="max-fees" className="block text-sm font-medium text-gray-300 mb-1">Max Fees (₹)</label>
                <input type="number" id="max-fees" placeholder="e.g., 80000" value={inputs.maxFee} onChange={e => setters.setMaxFee(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"/>
            </div>
        </div>
        <div className="mt-6 flex flex-col md:flex-row gap-4">
            <button onClick={() => onSearch(false)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">Search Courses</button>
            <button onClick={() => onSearch(true)} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">Find Nearest Courses</button>
        </div>
    </div>
);

interface ResultsDisplayProps {
    isLoading: boolean;
    loadingMessage: string;
    error: string | null;
    results: SearchResults | null;
    userCoords: Coordinates | null;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ isLoading, loadingMessage, error, results, userCoords }) => {
    if (isLoading) {
        return <LoadingSpinner message={loadingMessage} />;
    }
    if (error) {
        return <ErrorMessage message={error} />;
    }
    if (!results) {
        return null; // Initial state, show nothing
    }
     if (results.exactMatches.length === 0 && results.recommendations.length === 0) {
        return <ErrorMessage message="No courses found matching your criteria. Try broadening your search." />;
    }
    return (
        <div className="space-y-8">
            {results.exactMatches.length > 0 && <ResultSection title="Exact Matches" courses={results.exactMatches} userCoords={userCoords} />}
            {results.recommendations.length > 0 && <ResultSection title="Recommendations" courses={results.recommendations} userCoords={userCoords} />}
        </div>
    );
};

const LoadingSpinner = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg">
        <div className="spinner mb-4"></div>
        <p className="text-gray-300">{message}</p>
    </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg text-center">{message}</div>
);

const ResultSection = ({ title, courses, userCoords }: { title: string; courses: Course[]; userCoords: Coordinates | null }) => (
    <div>
        <h2 className="text-2xl font-bold text-blue-300 mb-4 pb-2 border-b border-gray-700">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => <CourseCard key={`${course.id}-${course.institute}`} course={course} userCoords={userCoords} />)}
        </div>
    </div>
);

const CourseCard = ({ course, userCoords }: { course: Course, userCoords: Coordinates | null }) => {
    const distance = userCoords ? haversineDistance(userCoords, { latitude: course.latitude, longitude: course.longitude }).toFixed(1) : null;
    const modeBgColor = course.mode === 'Online' ? 'bg-green-800' : course.mode === 'Offline' ? 'bg-purple-800' : 'bg-yellow-800';

    return (
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-blue-500 transition duration-300 flex flex-col">
            <h3 className="text-xl font-bold text-white">{course.course}</h3>
            <p className="text-blue-400 font-semibold">{course.institute}</p>
            <p className="text-gray-400 mt-2 text-sm flex-grow">{course.description}</p>
            <div className="mt-4 text-sm space-y-2">
                <div className="flex items-center"><span className="font-bold w-24">Location:</span> <span>{course.location}{distance && ` (${distance} km away)`}</span></div>
                <div className="flex items-center"><span className="font-bold w-24">Fee:</span> <span>₹{course.fee.toLocaleString('en-IN')}</span></div>
                <div className="flex items-center"><span className="font-bold w-24">Duration:</span> <span>{course.durationInMonths} Months</span></div>
                <div className="flex items-center"><span className="font-bold w-24">Mode:</span> <span className={`px-2 py-1 ${modeBgColor} text-white text-xs rounded-full`}>{course.mode}</span></div>
            </div>
        </div>
    );
};


// --- API & UTILITY FUNCTIONS ---
// (These can be moved to separate files in a larger project)

function getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error("Geolocation is not supported."));
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => reject(err)
        );
    });
}

function buildPrompt(
    inputs: { course: string; location: string; minFee: string; maxFee: string; duration: string; },
    courses: Course[],
    isNearest: boolean,
    coords: Coordinates | null
): string {
    const criteria = [
        inputs.course && `Course Name Query: "${inputs.course}"`,
        !isNearest && inputs.location && `Location: "${inputs.location}"`,
        inputs.minFee && `Minimum Fee: ${inputs.minFee}`,
        inputs.maxFee && `Maximum Fee: ${inputs.maxFee}`,
        inputs.duration && `Maximum Duration (in months): ${inputs.duration}`,
    ].filter(Boolean).join('\n    - ');

    const locationRule = isNearest && coords
        ? `Calculate the distance from the user's current location (${coords.latitude}, ${coords.longitude}) to each course. Only include courses within a 50-kilometer radius.`
        : `Location must be an exact, case-insensitive match to the user's provided location.`;

    const taskDescription = isNearest
        ? `
Your Task:
Return a JSON object with two keys: "exactMatches" and "recommendations".
- "exactMatches": An array of course objects that strictly meet ALL the user's criteria (including the 50km distance rule).
- "recommendations": An array of other courses that are semantically similar to the user's course query but which STILL meet all other criteria (distance, fee, duration).
If no matches are found in a category, return an empty array for that key. Respond ONLY with the JSON object.`
        : `
Your Task:
Return a JSON object with two keys: "exactMatches" and "recommendations".

1.  **"exactMatches":**
    - This is an array of course objects that strictly meet ALL of the user's criteria.
    - The 'location' must be a case-insensitive match for "${inputs.location}".

2.  **"recommendations":**
    - This is an array for showing the same course in different locations.
    - Find all courses where the 'course' name is a case-insensitive match for "${inputs.course}".
    - From those, filter out any course where the 'location' is a case-insensitive match for "${inputs.location}" (to avoid duplicates from the "exactMatches" list).
    - Finally, ensure the remaining courses still meet all other user criteria (Minimum Fee, Maximum Fee, Maximum Duration).

If no matches are found in a category, return an empty array for that key. Respond ONLY with the JSON object.`;

    return `You are a world-class course-finding AI assistant. Your task is to analyze the user's criteria and filter the provided JSON data of courses.

User's Criteria:
    - ${criteria || "No specific criteria provided."}

JSON Data of All Courses:
${JSON.stringify(courses, null, 2)}

Rules for Matching:
1. Fee must be within the user's minimum and maximum range. If only one is provided, treat it as a lower or upper bound.
2. ${locationRule}
3. durationInMonths must be less than or equal to the user's maximum duration.
4. For the course name, give highest priority to items where the 'course' field closely matches the query. Also consider matches in 'keywords' as secondary.

${taskDescription}
`;
}

async function callGeminiAPI(prompt: string, retries = 3, delay = 1000): Promise<string> {
    const apiKey = "AIzaSyBHkmTAaYexHbV6FCLATyUpmyZWmXPez88"; // API Key is automatically managed by the environment.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
             throw new Error("Invalid response structure from API.");
        }
        return result.candidates[0].content.parts[0].text;
    } catch (error) {
        if (retries > 1) {
            await new Promise(res => setTimeout(res, delay));
            return callGeminiAPI(prompt, retries - 1, delay * 2);
        } else {
            throw error;
        }
    }
}

function haversineDistance(coords1: Coordinates, coords2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = (coords2.latitude - coords1.latitude) * Math.PI / 180;
    const dLon = (coords2.longitude - coords1.longitude) * Math.PI / 180;
    const a = 0.5 - Math.cos(dLat) / 2 + Math.cos(coords1.latitude * Math.PI / 180) * Math.cos(coords2.latitude * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

