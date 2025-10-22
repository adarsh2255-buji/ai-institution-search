
import type { Course, Coordinates, SearchResults } from '../types.ts';
import { haversineDistance } from '../api/courseApi.ts';

// --- NEW HELPER FUNCTION ---
/**
 * Formats a duration in months into a human-readable string.
 * e.g., 6 -> "6 Months", 12 -> "1 Year", 18 -> "1 Year and 6 Months"
 */
const formatDuration = (months: number): string => {
  if (!months || months <= 0) return "N/A";

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${months} ${months === 1 ? "mo" : "mos"}`;
  }

  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? "yr" : "yrs"}`;
  }

  return `${years} ${years === 1 ? "yr" : "yrs"} ${remainingMonths} ${remainingMonths === 1 ? "mo" : "mos"}`;
};



// --- COMPONENT PROPS ---
interface SearchResultProps {
    results: SearchResults | null;
    userCoords: Coordinates | null;
}

export default function SearchResult({ results, userCoords }: SearchResultProps) {
    if (!results) {
        return null; // Don't render anything if there are no results
    }

    if (results.exactMatches.length === 0 && results.recommendations.length === 0) {
        return (
            <div className="text-center p-8 mt-8 bg-gray-800 rounded-lg">
                <ErrorMessage message="No courses found matching your criteria. Try broadening your search." />
            </div>
        );
    }

    return (
        <div className="space-y-8 mt-12">
            {results.exactMatches.length > 0 && (
                <ResultSection 
                    title="Exact Matches" 
                    courses={results.exactMatches} 
                    userCoords={userCoords} 
                />
            )}
            {results.recommendations.length > 0 && (
                <ResultSection 
                    title="Recommendations" 
                    courses={results.recommendations} 
                    userCoords={userCoords} 
                />
            )}
        </div>
    );
}

// --- Child Components for this page ---

const ErrorMessage = ({ message }: { message: string }) => (
    <div className="bg-red-900 border border-red-700 text-red-200 p-4 rounded-lg text-center">{message}</div>
);

const ResultSection = ({ title, courses, userCoords }: { title: string; courses: Course[]; userCoords: Coordinates | null }) => (
    <div>
        <h2 className="text-2xl font-bold text-blue-300 mb-4 pb-2 border-b border-gray-700">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
                <CourseCard key={`${course.id}-${course.institute}`} course={course} userCoords={userCoords} />
            ))}
        </div>
    </div>
);

const CourseCard = ({ course, userCoords }: { course: Course; userCoords: Coordinates | null }) => {
    const distance = userCoords ? haversineDistance(userCoords, { latitude: course.latitude, longitude: course.longitude }).toFixed(1) : null;
    const modeBgColor = course.mode === 'Online' ? 'bg-green-800' : course.mode === 'Offline' ? 'bg-purple-800' : 'bg-yellow-800';

    return (
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700 hover:border-blue-500 transition duration-300 flex flex-col h-full">
            <h3 className="text-xl font-bold text-white">{course.course}</h3>
            <p className="text-blue-400 font-semibold">{course.institute}</p>
            <p className="text-gray-400 mt-2 text-sm flex-grow">{course.description}</p>
            
            <div className="mt-4 text-sm space-y-2 text-gray-300">
                <div className="flex items-center">
                    <span className="font-bold w-24 shrink-0 text-gray-400">Location:</span> 
                    <span>{course.location}{distance && ` (${distance} km away)`}</span>
                </div>
                <div className="flex items-center">
                    <span className="font-bold w-24 shrink-0 text-gray-400">Fee:</span> 
                    <span>₹{course.fee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center">
                    <span className="font-bold w-24 shrink-0 text-gray-400">Duration:</span> 
                    {/* --- THIS IS THE UPDATED LOGIC --- */}
                    <span>{formatDuration(course.durationInMonths)}</span>
                </div>
                <div className="flex items-center">
                    <span className="font-bold w-24 shrink-0 text-gray-400">Mode:</span> 
                    <span className={`px-2 py-1 ${modeBgColor} text-white text-xs rounded-full`}>{course.mode}</span>
                </div>
            </div>
        </div>
    );
};

