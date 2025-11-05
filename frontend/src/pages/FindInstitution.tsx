// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { fetchCourses, buildPrompt, callGeminiAPI, getCurrentLocation, fetchLocationSuggestions } from '../api/courseApi.ts';
// import type { Course, SearchResults, Coordinates } from '../types.ts';
// import SearchResult from './SearchResult.tsx';

// // Custom hook for debouncing a value
// function useDebounce(value: string, delay: number) {
//     const [debouncedValue, setDebouncedValue] = useState(value);
//     useEffect(() => {
//         const handler = setTimeout(() => {
//             setDebouncedValue(value);
//         }, delay);
//         return () => {
//             clearTimeout(handler);
//         };
//     }, [value, delay]);
//     return debouncedValue;
// }

// export default function FindInstitution() {
//     // --- STATE MANAGEMENT ---
//     const [allCourses, setAllCourses] = useState<Course[]>([]);
//     const [searchMode, setSearchMode] = useState<'location' | 'nearest'>('location');

//     // Form input states
//     const [courseQuery, setCourseQuery] = useState('');
//     const [location, setLocation] = useState('');
//     const [duration, setDuration] = useState<number | ''>('');
//     const [minFee, setMinFee] = useState<number | ''>('');
//     const [maxFee, setMaxFee] = useState<number | ''>('');

//     // UI states
//     const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
//     const [fetchInitialError, setFetchInitialError] = useState<string | null>(null);
//     const [uniqueCourseNames, setUniqueCourseNames] = useState<string[]>([]);
//     const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);
//     const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [loadingMessage, setLoadingMessage] = useState('');
//     const [error, setError] = useState<string | null>(null);

//     // Results state
//     const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
//     const [userCoords, setUserCoords] = useState<Coordinates | null>(null);

//     // Debounce the location input to avoid excessive API calls
//     const debouncedLocationQuery = useDebounce(location, 300);
    
//     const justSelectedLocation = useRef(false);

//     // Effect to fetch initial data from the backend
//     useEffect(() => {
//         const loadCourses = async () => {
//             try {
//                 const courses = await fetchCourses();
//                 setAllCourses(courses);
//                 setUniqueCourseNames([...new Set(courses.map(c => c.course))]);
//             } catch (err) {
//                 setFetchInitialError("Failed to load course data. Please try refreshing the page.");
//             } finally {
//                 setIsFetchingInitialData(false);
//             }
//         };
//         loadCourses();
//     }, []);

//     // Effect for location autocomplete
//     useEffect(() => {
//         if (justSelectedLocation.current) {
//             justSelectedLocation.current = false;
//             return;
//         }

//         if (searchMode === 'location' && debouncedLocationQuery.length > 2) {
//             const getSuggestions = async () => {
//                 const suggestions = await fetchLocationSuggestions(debouncedLocationQuery);
//                 setLocationSuggestions(suggestions);
//             };
//             getSuggestions();
//         } else {
//             setLocationSuggestions([]);
//         }
//     }, [debouncedLocationQuery, searchMode]);

//     // Clear location input when switching to nearest search
//     useEffect(() => {
//         if (searchMode === 'nearest') {
//             setLocation('');
//         }
//     }, [searchMode]);


//     const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const query = e.target.value;
//         setCourseQuery(query);
//         if (query.length > 0) {
//             const filtered = uniqueCourseNames
//                 .filter(name => name.toLowerCase().includes(query.toLowerCase()))
//                 .slice(0, 5);
//             setAutocompleteSuggestions(filtered);
//         } else {
//             setAutocompleteSuggestions([]);
//         }
//     };

//     const handleSelectSuggestion = (suggestion: string) => {
//         setCourseQuery(suggestion);
//         setAutocompleteSuggestions([]);
//     };
    
//     // New handler to specifically clear course suggestions
//     const clearCourseSuggestions = () => {
//         setAutocompleteSuggestions([]);
//     };

//     // New handlers for location input
//     const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         setLocation(e.target.value);
//     };

//     const handleSelectLocationSuggestion = (suggestion: string) => {
//         justSelectedLocation.current = true;
//         setLocation(suggestion);
//         setLocationSuggestions([]);
//     };
    
//     // New handler to specifically clear location suggestions
//     const clearLocationSuggestions = () => {
//         setLocationSuggestions([]);
//     };

//     const handleSearch = useCallback(async () => {
//          setError(null); // Clear previous errors
        
//         // --- FORM VALIDATION ---
//         if (!courseQuery.trim()) {
//             setError("Please enter a course name.");
//             return;
//         }
//         if (searchMode === 'location' && !location.trim()) {
//             setError("Please enter a location.");
//             return;
//         }
//         if (minFee === '' || maxFee === '' || duration === '') {
//              setError("Please fill in all fee and duration fields.");
//             return;
//         }
//         if (duration < 1) {
//              setError("Duration must be at least 1 month.");
//             return;
//         }
//         if (minFee < 1000) {
//             setError("Minimum fee must be at least ₹1000.");
//             return;
//         }
//          if (maxFee < minFee) {
//             setError("Maximum fee cannot be less than the minimum fee.");
//             return;
//         }
//         // --- End Validation ---
//         const isNearestSearch = searchMode === 'nearest';
//         setIsLoading(true);
//         setError(null);
//         setSearchResults(null);
//         setUserCoords(null);
//         setLoadingMessage(isNearestSearch ? "Getting your location..." : "Asking Gemini AI...");

//         let coords: Coordinates | null = null;
//         if (isNearestSearch) {
//             try {
//                 coords = await getCurrentLocation();
//             } catch (err) {
//                 setError("Could not get your location. Please enable location services.");
//                 setIsLoading(false);
//                 return;
//             }
//         }
        
//         setLoadingMessage("Finding courses...");
//         const userInputs = { course: courseQuery, location, minFee, maxFee, duration };
//         const prompt = buildPrompt(userInputs, allCourses, isNearestSearch, coords);

//         try {
//             // const response = await callGeminiAPI(prompt);
//             // const cleanedResponse = response.replace(/```json|```/g, '').trim();
//             // const results: SearchResults = JSON.parse(cleanedResponse);
            
//             // setSearchResults(results);
//             setUserCoords(coords);

//         } catch (err) {
//             console.error("Gemini API Error:", err);
//             setError("Sorry, the AI had trouble with that request. Please try again.");
//         } finally {
//             setIsLoading(false);
//         }
//     }, [courseQuery, location, minFee, maxFee, duration, allCourses, searchMode]);

//     if (isFetchingInitialData) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div className="flex items-center text-xl">
//                     <div className="spinner mr-4"></div>
//                     Loading Courses...
//                 </div>
//             </div>
//         );
//     }

//     if (fetchInitialError) {
//         return (
//             <div className="flex justify-center items-center min-h-screen">
//                 <div className="bg-red-900 border border-red-700 text-red-200 p-6 rounded-lg text-center">
//                     <h2 className="text-2xl font-bold mb-2">Error</h2>
//                     <p>{fetchInitialError}</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="container mx-auto p-4 md:p-8 max-w-4xl">
//             <Header />
//             <SearchForm 
//                 inputs={{ courseQuery, location, duration, minFee, maxFee }}
//                 setters={{ setCourseQuery, setLocation, setDuration, setMinFee, setMaxFee }}
//                 onSearch={handleSearch}
//                 autocompleteSuggestions={autocompleteSuggestions}
//                 onCourseInputChange={handleCourseInputChange}
//                 onSelectSuggestion={handleSelectSuggestion}
//                 onClearCourseSuggestions={clearCourseSuggestions}
//                 locationSuggestions={locationSuggestions}
//                 onLocationInputChange={handleLocationInputChange}
//                 onSelectLocationSuggestion={handleSelectLocationSuggestion}
//                 onClearLocationSuggestions={clearLocationSuggestions} // Pass new handler
//                 isLoading={isLoading}
//                 loadingMessage={loadingMessage}
//                 error={error}
//                 searchMode={searchMode}
//                 setSearchMode={setSearchMode}
//             />
            
//             {searchResults && (
//                 <SearchResult results={searchResults} userCoords={userCoords} />
//             )}
//         </div>
//     );
// }

// // --- Child Components ---

// const Header = () => (
//     <header className="text-center mb-8">
//         <h1 className="text-4xl font-bold text-blue-400">AI Powered Course Finder</h1>
//         <p className="text-gray-400 mt-2">Find your perfect course with the power of Gemini AI.</p>
//     </header>
// );

// interface SearchFormProps {
//     inputs: { courseQuery: string; location: string; duration: number | ''; minFee: number | ''; maxFee: number | ''; };
//     setters: {
//         setCourseQuery: (val: string) => void;
//         setLocation: (val: string) => void;
//         setDuration: (val: number | '') => void;
//         setMinFee: (val: number | '') => void;
//         setMaxFee: (val: number | '') => void;
//     };
//     onSearch: () => void;
//     autocompleteSuggestions: string[];
//     onCourseInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     onSelectSuggestion: (suggestion: string) => void; // <-- This line was missing
//     onClearCourseSuggestions: () => void;
//     locationSuggestions: string[];
//     onLocationInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     onSelectLocationSuggestion: (suggestion: string) => void;
//     onClearLocationSuggestions: () => void; // New prop
//     isLoading: boolean;
//     loadingMessage: string;
//     error: string | null;
//     searchMode: 'location' | 'nearest';
//     setSearchMode: (mode: 'location' | 'nearest') => void;
// }

// const SearchForm: React.FC<SearchFormProps> = ({ 
//     inputs, setters, onSearch, autocompleteSuggestions, onCourseInputChange, 
//     onSelectSuggestion, onClearCourseSuggestions, locationSuggestions, onLocationInputChange, onSelectLocationSuggestion,
//     onClearLocationSuggestions, // Destructure new prop
//      isLoading, loadingMessage, error, searchMode, setSearchMode 
// }) => {
//     const [highlightedCourseIndex, setHighlightedCourseIndex] = useState(-1);
//     const [highlightedLocationIndex, setHighlightedLocationIndex] = useState(-1);
//     const locationInputRef = useRef<HTMLInputElement>(null);
//     const durationInputRef = useRef<HTMLInputElement>(null);
//     const courseAutocompleteRef = useRef<HTMLDivElement>(null);
//     const locationAutocompleteRef = useRef<HTMLDivElement>(null); // New ref for location

//     // Effect to handle clicks outside of the course autocomplete
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (courseAutocompleteRef.current && !courseAutocompleteRef.current.contains(event.target as Node)) {
//                 onClearCourseSuggestions();
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [onClearCourseSuggestions, onClearLocationSuggestions]);
    
//     // New Effect to handle clicks outside of the location autocomplete
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (locationAutocompleteRef.current && !locationAutocompleteRef.current.contains(event.target as Node)) {
//                 onClearLocationSuggestions();
//             }
//         };
//         document.addEventListener('mousedown', handleClickOutside);
//         return () => {
//             document.removeEventListener('mousedown', handleClickOutside);
//         };
//     }, [onClearLocationSuggestions]);

//     useEffect(() => {
//         setHighlightedCourseIndex(-1);
//     }, [autocompleteSuggestions]);

//     useEffect(() => {
//         setHighlightedLocationIndex(-1);
//     }, [locationSuggestions]);

//     const handleCourseKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (autocompleteSuggestions.length === 0) {
//             if (e.key === 'Enter') {
//                 e.preventDefault();
//                 if (searchMode === 'location' && locationInputRef.current) {
//                     locationInputRef.current.focus();
//                 } else if (durationInputRef.current) {
//                     durationInputRef.current.focus();
//                 }
//             }
//             return;
//         }

//         if (e.key === 'ArrowDown') {
//             e.preventDefault();
//             setHighlightedCourseIndex(prev => (prev + 1) % autocompleteSuggestions.length);
//         } else if (e.key === 'ArrowUp') {
//             e.preventDefault();
//             setHighlightedCourseIndex(prev => (prev - 1 + autocompleteSuggestions.length) % autocompleteSuggestions.length);
//         } else if (e.key === 'Enter') {
//             e.preventDefault();
//             if (highlightedCourseIndex > -1) {
//                 onSelectSuggestion(autocompleteSuggestions[highlightedCourseIndex]);
//                 setHighlightedCourseIndex(-1);
//             } else {
//                 onClearCourseSuggestions(); // Clear suggestions on Enter
//                 if (searchMode === 'location' && locationInputRef.current) {
//                     locationInputRef.current.focus();
//                 } else if (durationInputRef.current) {
//                     durationInputRef.current.focus();
//                 }
//             }
//         }
//     };

//     const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (locationSuggestions.length === 0) {
//             if (e.key === 'Enter') {
//                 e.preventDefault();
//                 if (durationInputRef.current) {
//                     durationInputRef.current.focus();
//                 }
//             }
//             return;
//         }

//         if (e.key === 'ArrowDown') {
//             e.preventDefault();
//             setHighlightedLocationIndex(prev => (prev + 1) % locationSuggestions.length);
//         } else if (e.key === 'ArrowUp') {
//             e.preventDefault();
//             setHighlightedLocationIndex(prev => (prev - 1 + locationSuggestions.length) % locationSuggestions.length);
//         } else if (e.key === 'Enter') {
//             e.preventDefault();
//             if (highlightedLocationIndex > -1) {
//                 onSelectLocationSuggestion(locationSuggestions[highlightedLocationIndex]);
//                 setHighlightedLocationIndex(-1);
//                 if (durationInputRef.current) {
//                     durationInputRef.current.focus();
//                 }
//             } else {
//                 onClearLocationSuggestions(); // Clear suggestions on Enter
//                 if (durationInputRef.current) {
//                     durationInputRef.current.focus();
//                 }
//             }
//         }
//     };


//     return (
//         <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl mb-8">
//             <div className="flex justify-center items-center bg-gray-900 p-1 rounded-full mb-6 max-w-md mx-auto">
//                 <button 
//                     onClick={() => setSearchMode('location')} 
//                     className={`w-1/2 text-center px-4 py-2 rounded-full transition-colors duration-300 text-sm font-semibold ${searchMode === 'location' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
//                 >
//                     Your Preferred Location
//                 </button>
//                 <button 
//                     onClick={() => setSearchMode('nearest')} 
//                     className={`w-1/2 text-center px-4 py-2 rounded-full transition-colors duration-300 text-sm font-semibold ${searchMode === 'nearest' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
//                 >
//                     Find Nearest
//                 </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="relative md:col-span-2" ref={courseAutocompleteRef}>
//                     <label htmlFor="course-name" className="block text-sm font-medium text-gray-300 mb-1">Course Name</label>
//                     <input 
//                         type="text" 
//                         id="course-name" 
//                         placeholder="e.g., Web Development" 
//                         value={inputs.courseQuery} 
//                         onChange={onCourseInputChange} 
//                         onKeyDown={handleCourseKeyDown}
//                         className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
//                         disabled={isLoading} 
//                     />
//                     {autocompleteSuggestions.length > 0 && (
//                         <div id="autocomplete-list" className="absolute z-20 w-full mt-1 bg-gray-700 text-white border border-gray-600 rounded-lg shadow-lg">
//                             {autocompleteSuggestions.map((suggestion, index) => (
//                                 <div 
//                                     key={suggestion} 
//                                     onClick={() => onSelectSuggestion(suggestion)} 
//                                     className={`p-3 cursor-pointer ${index === highlightedCourseIndex ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
//                                 >
//                                     {suggestion}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
                
//                  {searchMode === 'location' && (
//                      <div className="relative md:col-span-2" ref={locationAutocompleteRef}>
//                          <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
//                          <input 
//                              ref={locationInputRef}
//                              type="text" 
//                              id="location" 
//                              placeholder="e.g., Trivandrum" 
//                              value={inputs.location} 
//                              onChange={onLocationInputChange}
//                              onKeyDown={handleLocationKeyDown}
//                              className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
//                              disabled={isLoading}
//                          />
//                          {locationSuggestions.length > 0 && (
//                              <div className="absolute z-10 w-full mt-1 bg-gray-700 border text-white border-gray-600 rounded-lg shadow-lg">
//                                  {locationSuggestions.map((suggestion, index) => (
//                                      <div 
//                                          key={`${suggestion}-${index}`} 
//                                          onClick={() => onSelectLocationSuggestion(suggestion)} 
//                                          className={`p-3 cursor-pointer ${index === highlightedLocationIndex ? 'bg-blue-600' : 'hover:bg-gray-600'}`}
//                                      >
//                                          {suggestion}
//                                      </div>
//                                  ))}
//                              </div>
//                          )}
//                      </div>
//                  )}
                
                
                
//                 {/* Full-width container for fees */}
//                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                         <label htmlFor="min-fees" className="block text-sm font-medium text-gray-300 mb-1">Min Fees (₹)</label>
//                         <input 
//                             type="number" 
//                             id="min-fees" 
//                             placeholder="e.g., 30000" 
//                             value={inputs.minFee} 
//                             min="1000"
//                             onChange={e => setters.setMinFee(e.target.value === '' ? '' : Number(e.target.value))} 
//                             className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
//                             disabled={isLoading}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="max-fees" className="block text-sm font-medium text-gray-300 mb-1">Max Fees (₹)</label>
//                         <input 
//                             type="number" 
//                             id="max-fees" 
//                             placeholder="e.g., 80000" 
//                             value={inputs.maxFee} 
//                             min="0"
//                             onChange={e => setters.setMaxFee(e.target.value === '' ? '' : Number(e.target.value))} 
//                             className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
//                             disabled={isLoading}
//                         />
//                     </div>
//                 </div>

//                 {/* Full-width container for duration */}
//                 <div className="md:col-span-2">
//                     <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Max Duration (Months)</label>
//                     <input 
//                         ref={durationInputRef}
//                         type="number" 
//                         id="duration" 
//                         placeholder="e.g., 6" 
//                         value={inputs.duration} 
//                         min="1"
//                         onChange={e => setters.setDuration(e.target.value === '' ? '' : Number(e.target.value))} 
//                         className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" 
//                         disabled={isLoading}
//                     />
//                 </div>
                 
//             </div>

//             <div className="mt-6">
//                 <button 
//                     onClick={onSearch} 
//                     className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
//                     disabled={isLoading}
//                 >
//                     Search Courses
//                 </button>
//             </div>

//             {isLoading && (
//                 <div className="flex items-center justify-center mt-4 text-gray-300">
//                     <div className="spinner mr-3"></div>
//                     {loadingMessage}
//                 </div>
//             )}
//             {error && (
//                  <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg text-center mt-4">{error}</div>
//             )}
//         </div>
//     );
// }





