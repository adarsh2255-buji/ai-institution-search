import { useEffect, useState } from "react";
import { type Course, type SearchFilters } from "../types";
// import { MOCK_COURSES } from "../data";
import { callGeminiAPI } from "../api/courseApi";
import SearchForm from "./SearchForm";
import { ResultsDisplay } from "./ResultsDisplay";
import api from "../api/client";

export default function FindInstitution() {
    // const [allCourses] = useState<Course[]>(MOCK_COURSES)
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [searchTitle, setSearchTitle] = useState<string>("Loading course data...");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

    //Fetch data on load
    useEffect(() => {
      const fetchCourse = async () => {
        try {
          const response = await api.get<Course[]>("/courses/list/");
           if (response.status !== 200) {
          throw new Error(`Failed to fetch courses: ${response.statusText}`);
          console.log(response.data)
        }
        const data: Course[] =  response.data;


          setAllCourses(data);
          setIsDataLoaded(true);
          setSearchTitle("Search for courses");
        } catch (error) {
            console.error("Failed to fetch courses:", error);
            setSearchTitle("Error: Could not load course data. Please refresh.");
        } finally {
            setIsLoading(false);
        }
      };
      fetchCourse();
    }, []);

    /**
   * Main search handler.
   * This is passed to the SearchForm and called on submit.
   */
  const handleSearch = async (filters: SearchFilters) => {
     if (!isDataLoaded) {
      setSearchTitle("Course data is still loading. Please wait.");
      return;
    }
    setIsLoading(true);
    setSearchTitle("AI is analyzing your request...");
    setFilteredCourses([]);

    //call our AI's response
    const response = await callGeminiAPI(filters, allCourses);
    console.log("AI Response:", response);

    //update state with the AI's response
    setSearchTitle(response.title);
    setFilteredCourses(response.results);
    setIsLoading(false)
  };

  return(
        <div className="min-h-screen bg-gray-100 font-sans">
      
      <main>
        <SearchForm 
          onSubmit={handleSearch} 
          isLoading={isLoading || !isDataLoaded} 
        />
        <ResultsDisplay
          title={searchTitle} 
          courses={filteredCourses} 
          isLoading={isLoading} 
        />
      </main>

    </div>
  )
}