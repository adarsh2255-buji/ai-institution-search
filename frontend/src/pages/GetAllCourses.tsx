import { useEffect, useState } from "react";
import api from "../api/client";

type Course = {
  id: number | string;
  course: string;
};

export default function GetAllCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get<Course[]>("http://192.168.29.106:800/courses/list/")
      .then((res) => {
        setCourses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(err.message || "Failed to fetch courses");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10 text-white">Loading courses...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-6">
      <h2 className="text-3xl font-bold text-cyan-400 text-center mb-10">
        All Courses
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {courses.map((course) => (
          <div
            key={course.id}
            className="p-6 bg-gray-800/70 rounded-2xl shadow-lg hover:shadow-cyan-500/50 transition"
          >
            <h3 className="text-xl font-semibold">{course.course}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
