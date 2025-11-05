// --- TYPE DEFINITIONS ---
// This file centralizes the data structures used across the application.

export interface Course {
  id: number;
  courseName: string;
  courseTitle: string;
  description: string; 
  keywords: string[];
  fees: number;
  duration: number; 
  institutionName: string;
  location: string;
  latitude: string;     
  longitude: string;
  district: string;
  mode: string;
}

// Defines the structure for the user's search inputs
export interface SearchFilters {
  courseName: string;
  location: string;
  minPrice: number | string;
  maxPrice: number | string;
  duration: number | string;
}

// Defines the response structure from our AI
export interface AiResponse {
  title: string;
  results: Course[];
}
// Defines the props for our components
export type SearchFormProps = {
  onSubmit: (filters: SearchFilters) => void;
  isLoading: boolean;
};

export type ResultsDisplayProps = {
  title: string;
  courses: Course[];
  isLoading: boolean;
};

export type CourseCardProps = {
  course: Course;
};




export interface SearchResults {
    exactMatches: Course[];
    recommendations: Course[];
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}
