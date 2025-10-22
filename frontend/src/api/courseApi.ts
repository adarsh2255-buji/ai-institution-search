import axios from 'axios';
import type { Course, Coordinates } from '../types';
import api from './client';

// In a real application, this would be fetched from an API endpoint.
// export const mockCourseData: Course[] = [
//     {"id": 1, "course": "Web Development", "description": "Learn to design and build dynamic, responsive websites using modern front-end and back-end technologies.", "keywords": ["frontend development", "backend development", "full stack development", "html", "css", "javascript", "react"], "fee": 45000, "durationInMonths": 6, "institute": "Tech Academy", "location": "Trivandrum", "latitude": 8.5241, "longitude": 76.9366, "mode": "Online"},
//     {"id": 2, "course": "Data Science", "description": "Gain hands-on experience in data analysis, machine learning, and AI-driven insights using Python and advanced tools.", "keywords": ["machine learning", "AI", "big data", "python", "statistics"], "fee": 60000, "durationInMonths": 8, "institute": "Data Insights", "location": "Trivandrum", "latitude": 8.5241, "longitude": 76.9366, "mode": "Offline"},
//     {"id": 3, "course": "Digital Marketing", "description": "Master SEO, SEM, content marketing, and social media strategies to drive business growth online.", "keywords": ["seo", "sem", "social media", "google analytics"], "fee": 35000, "durationInMonths": 4, "institute": "MarketPro", "location": "Kochi", "latitude": 9.9312, "longitude": 76.2673, "mode": "Online"},
//     {"id": 4, "course": "Cyber Security", "description": "Learn ethical hacking, network security, and cryptography to protect digital assets from cyber threats.", "keywords": ["ethical hacking", "network security", "penetration testing"], "fee": 75000, "durationInMonths": 9, "institute": "SecureNet", "location": "Kochi", "latitude": 9.9312, "longitude": 76.2673, "mode": "Offline"},
//     {"id": 5, "course": "Full Stack Engineering", "description": "Become a complete developer by mastering both front-end and back-end technologies including databases and deployment.", "keywords": ["react", "nodejs", "mongodb", "full stack", "web development"], "fee": 80000, "durationInMonths": 8, "institute": "Tech Academy", "location": "Trivandrum", "latitude": 8.5241, "longitude": 76.9366, "mode": "Online"},
//     {"id": 6, "course": "AI and Machine Learning", "description": "Dive deep into the world of Artificial Intelligence, learning algorithms, neural networks, and practical applications.", "keywords": ["ai", "machine learning", "neural networks", "tensorflow", "data science"], "fee": 90000, "durationInMonths": 10, "institute": "Data Insights", "location": "Kochi", "latitude": 9.9312, "longitude": 76.2673, "mode": "Hybrid"},
//     {"id": 7, "course": "Cloud Computing", "description": "Master AWS, Azure, and Google Cloud platforms to design, deploy, and manage scalable applications.", "keywords": ["aws", "azure", "gcp", "devops", "cloud"], "fee": 65000, "durationInMonths": 7, "institute": "CloudVerse", "location": "Bangalore", "latitude": 12.9716, "longitude": 77.5946, "mode": "Online"},
//     {"id": 8, "course": "Mobile App Development", "description": "Build native and cross-platform mobile apps for Android and iOS using Flutter and React Native.", "keywords": ["android", "ios", "flutter", "react native", "mobile"], "fee": 55000, "durationInMonths": 6, "institute": "AppMakers", "location": "Bangalore", "latitude": 12.9716, "longitude": 77.5946, "mode": "Offline"},
//     {"id": 9, "course": "Web Development", "description": "Learn to design and build dynamic, responsive websites using modern front-end and back-end technologies.", "keywords": ["frontend development", "backend development", "full stack development", "html", "css", "javascript", "react"], "fee": 45000, "durationInMonths": 6, "institute": "Future tech", "location": "Kollam", "latitude": 8.8932, "longitude": 76.6141, "mode": "Offline"},
//     {"id": 10, "course": "Web Development", "description": "Learn to design and build dynamic, responsive websites using modern front-end and back-end technologies.", "keywords": ["frontend development", "backend development", "full stack development", "html", "css", "javascript", "react"], "fee": 45000, "durationInMonths": 6, "institute": "Future tech", "location": "Kollam", "latitude": 8.8932, "longitude": 76.6141, "mode": "Offline"},
// ];

// ---NEW GEOAPIFY INTEGRATION---
const geoapifyApiKey = 'c9415ba75dd14ce0ac9d47160d8a12d6';
/**
 * Fetches location autocomplete suggestions from Geoapify.
 * @param query The text the user has typed.
 * @returns A promise that resolves to an array of formatted location strings.
 */
export async function fetchLocationSuggestions(query: string): Promise<string[]> {
    if (!geoapifyApiKey ) {
        console.warn("Geoapify API key is not set. Location autocomplete will not work.");
        return [];
    }
    
    // Bias search towards Kollam, Kerala, India to make local results more relevant
    const bias = 'proximity:76.6141,8.8932'; // Longitude, Latitude

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${geoapifyApiKey}&${bias}&limit=5`;

    try {
        const response = await axios.get(url);
        // console.log("Geoapify API raw response:", response.data);
    if (response.data.features && response.data.features.length > 0) {
      // ✅ Extract only the first word from each formatted address
      return response.data.features.map((feature: any) => {
        const formatted = feature.properties.formatted;
        // Split by comma, take first segment, then take first word
        return formatted.split(",")[0].trim().split(" ")[0];
      });
    }
        return [];
    } catch (error) {
        console.error("Error fetching location suggestions from Geoapify:", error);
        return []; // Return empty array on error to prevent crashes
    }
}

// Define types for the raw API response structure for type safety
interface ApiCourse {
    id: number;
    name : string;
    keywords: string[];
    fee: number;
    duration: number;
    mode : 'Online' | 'Offline' | 'Hybrid';
    description: string;
}

interface ApiInstitution {
    id: number;
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    courses: ApiCourse[];
}

/**
 * Parses a duration string (e.g., "6 Months") into a number.
 * @param durationStr The string to parse.
 * @returns The number of months.
 */
function parseDuration(durationStr: string): number {
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[0], 10) : 0;
}
/**
 * Transforms the nested API response into a flat array of Course objects.
 * This is the structure the rest of our application expects.
 * @param apiData The raw data from the /courses/institution-courses/ endpoint.
 * @returns A flattened array of Course objects.
 */
function transformApiResponse(apiData: ApiInstitution[]): Course[] {
    const flattenedCourses: Course[] = [];
    apiData.forEach(institution => {
        institution.courses.forEach(course => {
            flattenedCourses.push({
                id: course.id,
                course: course.name,
                description: course.description,
                keywords: course.keywords,
                fee: course.fee,
                durationInMonths: course.duration,
                institute: institution.name,
                location: institution.location,
                latitude: institution.latitude,
                longitude: institution.longitude,
                mode: course.mode,
            });
        });
    });
    console.log(flattenedCourses)
    return flattenedCourses;
}
/**
 * Fetches course data from the backend API and transforms it.
 * @returns A promise that resolves to an array of Course objects.
 */
export async function fetchCourses(): Promise<Course[]> {
    try {
        // **CHANGE**: Replaced fetch with axios.get
        // In a real project, the base URL would come from an environment variable.
        const response = await api.get<{ data: ApiInstitution[] }>('/courses/institutions-courses/');
        // axios automatically checks for non-2xx responses and throws an error.
        // The response data is directly available on the `data` property.
        return transformApiResponse(response.data.data);
    } catch (error) {
        console.error("Failed to fetch courses:", error);
        throw error;
    }
}
export function getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            return reject(new Error("Geolocation is not supported."));
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => reject(err)
        );
    });
}

export function buildPrompt(
    inputs: { course: string; location: string; minFee: string; maxFee: string; duration: string; },
    courses: Course[],
    isNearest: boolean,
    coords: Coordinates | null
): string {
    const criteria = [
        inputs.course && `Course Name Query: "${inputs.course}"`,
        !isNearest && inputs.location && `Location: "${inputs.location}"`,
        inputs.minFee && `Minimum Fee: ${inputs.minFee}`,
        inputs.maxFee && `Maximum Fee: ${inputs.maxFee}`,
        inputs.duration && `Maximum Duration (in months): ${inputs.duration}`,
    ].filter(Boolean).join('\n    - ');

    const locationRule = isNearest && coords
        ? `Calculate the distance from the user's current location (${coords.latitude}, ${coords.longitude}) to each course. Only include courses within a 50-kilometer radius.`
        : `Location must be an exact, case-insensitive match to the user's provided location.`;

    const taskDescription = `
Your Task:
Return a JSON object with two keys: "exactMatches" and "recommendations".

1.  **"exactMatches":**
    - This is an array of course objects that strictly meet ALL of the user's criteria.
    - The user's 'Course Name Query' must be found within the 'keywords' array of the course.
    - The fee, duration, and location (or distance, if applicable) must all match the user's criteria.

2.  **"recommendations":**
    - This is an array of other suggested courses.
    - To create this list, find ALL courses where the user's 'Course Name Query' is found within the 'keywords' array.
    - For this "recommendations" list, IGNORE all other criteria like location, fee, and duration.
    - To avoid duplicates, do not include any courses in this list that are already present in the "exactMatches" list.

Always return both "exactMatches" and "recommendations" keys, even if one or both are empty arrays. Respond ONLY with the JSON object.`;

    return `You are a world-class course-finding AI assistant. Your task is to analyze the user's criteria and filter the provided JSON data of courses.

User's Criteria:
    - ${criteria || "No specific criteria provided."}

JSON Data of All Courses:
${JSON.stringify(courses, null, 2)}

Rules for Matching:
1. The primary way to match a course is by checking if the user's 'Course Name Query' string appears as a substring in any of the strings within the course's 'keywords' array.
2. ${locationRule}
3. Fee must be within the user's minimum and maximum range.
4. durationInMonths must be less than or equal to the user's maximum duration.

${taskDescription}
`;
}

export async function callGeminiAPI(prompt: string, retries = 3, delay = 1000): Promise<string> {
    const apiKey = "AIzaSyBHkmTAaYexHbV6FCLATyUpmyZWmXPez88"; // API Key is automatically managed by the environment.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (!result.candidates?.[0]?.content?.parts?.[0]?.text) {
             throw new Error("Invalid response structure from API.");
        }
        return result.candidates[0].content.parts[0].text;
    } catch (error) {
        if (retries > 1) {
            await new Promise(res => setTimeout(res, delay));
            return callGeminiAPI(prompt, retries - 1, delay * 2);
        } else {
            throw error;
        }
    }
}



export function haversineDistance(coords1: Coordinates, coords2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = (coords2.latitude - coords1.latitude) * Math.PI / 180;
    const dLon = (coords2.longitude - coords1.longitude) * Math.PI / 180;
    const a = 0.5 - Math.cos(dLat) / 2 + Math.cos(coords1.latitude * Math.PI / 180) * Math.cos(coords2.latitude * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
}
