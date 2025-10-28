import React from 'react';
import type { Course, SearchResults, Coordinates } from '../types';

// --- HELPER FUNCTION ---
const haversineDistance = (coords1: Coordinates, coords2: Coordinates): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth's radius in km

    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c; // in kilometers
};
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


// --- The Main Exported Component ---
interface SearchResultProps {
    results: SearchResults;
    userCoords: Coordinates | null;
}

const SearchResult: React.FC<SearchResultProps> = ({ results, userCoords }) => {
    const { exactMatches = [], recommendations = [] } = results;
    const hasResults = exactMatches.length > 0 || recommendations.length > 0;

    return (
        <div className="mt-12 animate-fade-in">
            {!hasResults ? (
                 <div className="text-center bg-gray-800 p-8 rounded-2xl">
                    <h2 className="text-2xl font-bold text-white">No Courses Found</h2>
                    <p className="text-gray-400 mt-2">We couldn't find any courses matching your criteria. Please try a different search.</p>
                </div>
            ) : (
                <>
                    {exactMatches.length > 0 && (
                        <ResultsSection title="Exact Matches" courses={exactMatches} userCoords={userCoords} />
                    )}
                    {recommendations.length > 0 && (
                        <ResultsSection title="Related Courses" courses={recommendations} userCoords={userCoords} />
                    )}
                </>
            )}
        </div>
    );
};

export default SearchResult;

// --- Child Components for this file ---

interface ResultsSectionProps {
    title: string;
    courses: Course[];
    userCoords: Coordinates | null;
}

const ResultsSection: React.FC<ResultsSectionProps> = ({ title, courses, userCoords }: ResultsSectionProps) => (
    <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-blue-500 pb-2">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
                <CourseCard key={`${course.id}-${course.institute}`} course={course} userCoords={userCoords} />
            ))}
        </div>
    </div>
);

const CourseCard: React.FC<{ course: Course, userCoords: Coordinates | null }> = ({ course, userCoords }) => {
    const distance = userCoords ? haversineDistance(userCoords, { latitude: course.latitude, longitude: course.longitude }) : null;

    return (
        <div className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col justify-between transition-transform transform hover:scale-105 hover:shadow-blue-500/20">
            <div>
                <h3 className="text-xl font-bold text-blue-400">{course.course}</h3>
                <p className="text-gray-300 font-semibold mt-1">{course.institute}</p>
                <p className="text-gray-400 text-sm mt-2 mb-4">{course.description}</p>
            </div>
            <div className="space-y-3 text-sm border-t border-gray-700 pt-4 mt-4">
                <InfoItem icon="📍" label="Location" value={course.location} />
                {distance !== null && <InfoItem icon="🚗" label="Distance" value={`${distance.toFixed(1)} km away`} />}
                <InfoItem icon="💰" label="Fee" value={`₹${course.fee.toLocaleString('en-IN')}`} />
                <InfoItem icon="⏳" label="Duration" value={formatDuration(course.durationInMonths)} />
                <InfoItem icon="🖥️" label="Mode" value={course.mode} />
            </div>
        </div>
    );
};

const InfoItem: React.FC<{ icon: string, label: string, value: string }> = ({ icon, label, value }) => (
    <div className="flex items-center text-gray-300">
        <span className="mr-3 text-lg">{icon}</span>
        <span className="font-semibold w-24">{label}:</span>
        <span className="text-white">{value}</span>
    </div>
);

