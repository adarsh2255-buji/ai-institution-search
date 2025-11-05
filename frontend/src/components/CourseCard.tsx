import type React from "react";
import type { CourseCardProps } from "../types";

export const CourseCard : React.FC<CourseCardProps> = ({ course }) => (
  
     <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-shadow duration-300 hover:shadow-lg">
    <div className="p-6">
      <h3 className="text-xl font-bold text-blue-700 mb-1">{course.courseName}</h3>
      <p className="text-md font-semibold text-gray-800 mb-3">{course.institutionName}</p>
      
      <div className="flex flex-wrap gap-4 text-sm mb-4">
        <span className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
          {/* Location Icon */}
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
          {course.location}
        </span>
        <span className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
          {/* Duration Icon */}
          <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
          {course.duration}
        </span>
      </div>

      <div className="text-2xl font-bold text-green-600">
        ${course.fees}
      </div>
    </div>
  </div>
)