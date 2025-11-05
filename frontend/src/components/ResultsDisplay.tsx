import type { ResultsDisplayProps } from "../types";
import { CourseCard } from "./CourseCard";
import { LoadingSpinner } from "./LoadingSpinner";

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ title, courses, isLoading }) => (
  <div className="container mx-auto max-w-5xl my-8">
    <h2 className="text-2xl font-semibold text-gray-800 mb-6 px-4 md:px-0">{title}</h2>

    {isLoading && <LoadingSpinner />}

    {!isLoading && courses.length === 0 && (
      <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow-sm">
        No results to display.
      </div>
    )}

    {!isLoading && courses.length > 0 && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    )}
  </div>
);