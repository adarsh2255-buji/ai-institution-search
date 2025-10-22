import { useEffect, useState } from "react";
import api from "../api/client";

type Course = {
  id: number | string;
  course: string;
  description: string;
};

export default function GetAllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null); // 👈 track hovered row

  useEffect(() => {
    api
      .get<Course[]>("/courses/list/")
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch courses");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-300 text-lg font-medium">
            Loading courses...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="bg-red-500/10 text-red-400 border border-red-500/30 p-6 rounded-2xl shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );

  // 🧮 Split courses into rows of 3
  const rows = [];
  for (let i = 0; i < courses.length; i += 3) {
    rows.push(courses.slice(i, i + 3));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-16 px-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          Available Courses
        </h2>
        <p className="text-gray-400 mt-3 text-lg">
          Explore a curated list of courses tailored to your goals.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="text-center text-gray-400 text-lg">
          No courses available right now.
        </p>
      ) : (
        <div className="max-w-6xl mx-auto space-y-10">
          {rows.map((rowCourses, rowIndex) => (
            <div
              key={rowIndex}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
              onMouseEnter={() => setHoveredRow(rowIndex)} // 👈 Hover entire row
              onMouseLeave={() => setHoveredRow(null)}
            >
              {rowCourses.map((course) => (
                <div
                  key={course.id}
                  className={`relative bg-gray-800/60 backdrop-blur-md border border-gray-700/40 rounded-2xl p-6 shadow-lg transition-all duration-300 ${
                    hoveredRow === rowIndex
                      ? "shadow-cyan-500/30 -translate-y-1"
                      : "hover:shadow-cyan-500/30 hover:-translate-y-1"
                  }`}
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 transition duration-500 ${
                      hoveredRow === rowIndex ? "opacity-100" : "opacity-0"
                    }`}
                  ></div>

                  <h3 className="text-xl font-semibold text-white relative z-10 mb-3">
                    {course.course}
                  </h3>

                  {/* Description block */}
                  <div
                    className={`relative z-10 overflow-hidden transition-all duration-500 ease-in-out ${
                      hoveredRow === rowIndex ? "max-h-96" : "max-h-24"
                    }`}
                  >
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                      {course.description}
                    </p>
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-gray-800 to-transparent pointer-events-none transition-opacity duration-500 ${
                        hoveredRow === rowIndex ? "opacity-0" : "opacity-100"
                      }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}