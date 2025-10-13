import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, Settings } from "lucide-react";
import axios from "axios";

interface User {
  username: string;
  role: string;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const checkAuthStatus = () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        // Invalid user data, clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check auth status on mount
    checkAuthStatus();

    // Listen for storage changes (when user logs in/out from other tabs or components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' || e.key === 'user') {
        checkAuthStatus();
      }
    };

    // Listen for custom events (when user logs in/out from same tab)
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authChange', handleAuthChange);

    // Also check periodically in case of direct localStorage changes
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://192.168.29.106:800/courses/logout/",
        {},
        {
          withCredentials: true,
          headers: token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      // Ignore errors; proceed with client-side cleanup regardless
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUser(null);
      setIsUserMenuOpen(false);
      setIsOpen(false);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('authChange'));
      
      navigate("/");
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/user/login";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "provider":
        return "/provider/dashboard";
      case "user":
        return "/user/home";
      default:
        return "/user/login";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "provider":
        return "Institution";
      case "user":
        return "Student";
      default:
        return "User";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-400 bg-red-400/20";
      case "provider":
        return "text-blue-400 bg-blue-400/20";
      case "user":
        return "text-green-400 bg-green-400/20";
      default:
        return "text-gray-400 bg-gray-400/20";
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-cyan-400 tracking-wide">
          FuturiGuide
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 text-gray-200">
          <Link to="/" className="hover:text-cyan-400 transition">Home</Link>
          <Link to="/find-institutions" className="hover:text-cyan-400 transition">Find Institutions</Link>
          <Link to="/career-guide" className="text-cyan-400 font-semibold hover:glow transition">
            🤖 AI Career Guide
          </Link>
          <Link to="/courses" className="hover:text-cyan-400 transition">Explore Courses</Link>
        </nav>

        {/* Right Side - Login/User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn && user ? (
            <div className="relative">
              {/* User Info & Menu Button */}
              <button
                type="button"
                onClick={toggleUserMenu}
                className="flex items-center space-x-3 bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-full transition-all border border-gray-600/50"
              >
                <div className="flex items-center space-x-2">
                  <User size={20} className="text-cyan-400" />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{user.username}</p>
                    {/* <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span> */}
                  </div>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-lg shadow-xl border border-gray-700/50 backdrop-blur-md z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-4 border-b border-gray-700/50">
                    <p className="text-white font-medium">{user.username}</p>
                    {/* <p className="text-gray-400 text-sm">{user.email || 'No email'}</p> */}
                  </div>
                  <div className="py-2">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 transition"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-3" />
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-800/50 transition"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/user/login"
              className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-full shadow-lg transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-200 hover:text-cyan-400 transition"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <nav className="md:hidden px-6 py-4 space-y-4 text-gray-200 bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50">
          <Link 
            to="/" 
            className="block hover:text-cyan-400" 
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/find-institutions" 
            className="block hover:text-cyan-400" 
            onClick={() => setIsOpen(false)}
          >
            Find Institutions
          </Link>
          <Link 
            to="/career-guide" 
            className="block text-cyan-400 font-semibold" 
            onClick={() => setIsOpen(false)}
          >
            🤖 AI Career Guide
          </Link>
          <Link 
            to="/courses" 
            className="block hover:text-cyan-400" 
            onClick={() => setIsOpen(false)}
          >
            Explore Courses
          </Link>
          
          {/* Mobile User Section */}
          {isLoggedIn && user ? (
            <div className="pt-4 border-t border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <User size={20} className="text-cyan-400" />
                <div>
                  <p className="text-white font-medium">{user.username}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
              </div>
              <Link
                to={getDashboardLink()}
                className="block bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-lg transition mb-2"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/user/login" 
              className="block bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-full shadow-lg transition"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </nav>
      )}

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
}
