import { Routes, Route } from "react-router-dom"

import UnifiedLogin from './components/UnifiedLogin'
import AdminDashboard from "./components/AdminDashboard"
import ProviderDashboard from "./components/ProviderDashboard"
import UserHome from "./components/UserHome"
import ProviderRegister from "./components/ProviderRegister"
import Header from "./components/Header"
import Hero from "./components/Hero.tsx"
import GetAllCourses from "./pages/GetAllCourses.tsx"
import CreateUser from "./pages/CreateUser.tsx"
// import FindInstitution from "./components/FindInstitution.tsx"
import CareerGuide from "./components/CareerGuide.tsx"
import FindInstitution from "./components/FindInstitution.tsx"
// import FindInstitution from "./pages/FindInstitution.tsx"
// import SearchResult from "./pages/SearchResult.tsx"


function App() {


  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="h-20" />
      {/* Simple Navbar 
      <nav className="flex justify-center space-x-6 py-4 bg-gray-900 border-b border-gray-700">
        <Link
          to="/login"
          className="text-purple-400 hover:text-purple-300 font-semibold"
        >
          Admin Login
        </Link>
        <Link
          to="/provider/register"
          className="text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          Provider Register
        </Link>
        <Link
          to="/provider/login"
          className="text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          Provider Login
        </Link>
        <Link to="/dashboard" className="text-green-400 hover:text-green-300 font-semibold">
          Dashboard
        </Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/login" element={<UnifiedLogin />} />
        
        {/* Role-based dashboards */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/user/home" element={<UserHome />} />

        {/* Registration routes */}
        <Route path="/provider/register" element={<ProviderRegister />} />
        <Route path="/register" element={<CreateUser />} />

        {/* Other pages */}
        <Route path="/courses" element={<GetAllCourses />} />
        <Route path="/career-guide" element={<CareerGuide />} />
        
        {/* Legacy redirects for backward compatibility */}
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/user/login" element={<UnifiedLogin />} />
        <Route path="/admin/login" element={<UnifiedLogin />} />
        <Route path="/provider/login" element={<UnifiedLogin />} />
        {/* <Route path="/find-institutions" element={<FindInstitution />} /> */}
        <Route path="/find-institutions" element={<FindInstitution />} />
        {/* <Route path="/search" element={<SearchResult />} /> */}

      </Routes>
    </div>
  )
}

export default App
