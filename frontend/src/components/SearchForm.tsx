import { useState } from "react";
import {type SearchFilters, type SearchFormProps } from "../types";

export default function SearchForm({ onSubmit, isLoading }: SearchFormProps) {
    const [inputs, setInputs] = useState<SearchFilters>({
        courseName: "",
        location: "",
        minPrice: 0,
        maxPrice: 10000,
        duration: 8
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setInputs((prev) => ({
            ...prev,
            [name]: type === "number" ? parseFloat(value) || 0 : value
        }));
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(inputs);
    };
    return (
    <div className="container mx-auto max-w-5xl my-8 p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Course Name */}
        <div className="flex flex-col">
          <label htmlFor="courseName" className="mb-1 font-semibold text-gray-700">Course Name</label>
          <input
            type="text"
            id="courseName"
            name="courseName"
            value={inputs.courseName}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., Data Science"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col">
          <label htmlFor="location" className="mb-1 font-semibold text-gray-700">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={inputs.location}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., New York"
          />
        </div>

        {/* Min Price */}
        <div className="flex flex-col">
          <label htmlFor="minPrice" className="mb-1 font-semibold text-gray-700">Min Price</label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            value={inputs.minPrice}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="1000"
          />
        </div>

        {/* Max Price */}
        <div className="flex flex-col">
          <label htmlFor="maxPrice" className="mb-1 font-semibold text-gray-700">Max Price</label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            value={inputs.maxPrice}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="5000"
          />
        </div>

        {/* Duration */}
        <div className="flex flex-col">
          <label htmlFor="duration" className="mb-1 font-semibold text-gray-700">Duration</label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={inputs.duration}
            onChange={handleChange}
            className="p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="e.g., 6 Weeks"
          />
        </div>

        {/* Submit Button */}
        <div className="md:col-span-3 lg:col-span-5 flex justify-end mt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
    </div>
  );
};