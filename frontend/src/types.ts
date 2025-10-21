// --- TYPE DEFINITIONS ---
// This file centralizes the data structures used across the application.

export interface Course {
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

export interface SearchResults {
    exactMatches: Course[];
    recommendations: Course[];
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}
