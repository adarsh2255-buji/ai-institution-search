import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Home, BookOpen, Cpu, GraduationCap, User, LogOut, Settings } from "lucide-react";
import api from "../api/client";

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
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch {
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
    checkAuthStatus();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" || e.key === "user") checkAuthStatus();
    };
    const handleAuthChange = () => checkAuthStatus();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleAuthChange);
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await api.post(
        "/courses/logout/",
        {},
        {
          withCredentials: true,
          headers: token
            ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
            : { "Content-Type": "application/json" },
        }
      );
    } catch {
      // Ignore errors
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUser(null);
      setIsUserMenuOpen(false);
      setIsOpen(false);
      window.dispatchEvent(new Event("authChange"));
      navigate("/");
    }
  };

  const getDashboardLink = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "provider":
        return "/provider/dashboard";
      case "user":
        return "/user/home";
      default:
        return "/login";
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-white tracking-wide hover:scale-105 transition transform font-italic flex gap-1.5"
        >
          <svg width="31" height="34" viewBox="0 0 31 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="m8.75 5.3 6.75 3.884 6.75-3.885M8.75 28.58v-7.755L2 16.939m27 0-6.75 3.885v7.754M2.405 9.408 15.5 16.954l13.095-7.546M15.5 32V16.939M29 22.915V10.962a2.98 2.98 0 0 0-1.5-2.585L17 2.4a3.01 3.01 0 0 0-3 0L3.5 8.377A3 3 0 0 0 2 10.962v11.953A2.98 2.98 0 0 0 3.5 25.5L14 31.477a3.01 3.01 0 0 0 3 0L27.5 25.5a3 3 0 0 0 1.5-2.585"
              stroke="url(#a)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="a" x1="15.5" y1="2" x2="15.5" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#F8FAFC" />
                <stop offset="1" stopColor="#383838" />
              </linearGradient>
            </defs>
          </svg>
          ProLern
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-gray-200 font-medium">
          <Link to="/" className="flex items-center gap-1 hover:text-cyan-400 transition">
            <Home size={18} /> Home
          </Link>
          <Link to="/find-institutions" className="flex items-center gap-1 hover:text-cyan-400 transition">
            <GraduationCap size={18} /> Institutions
          </Link>
          <Link to="/career-guide" className="flex items-center gap-1 text-white font-semibold hover:text-cyan-400 transition">
            <Cpu size={18} /> AI Career Guide
          </Link>
          <Link to="/courses" className="flex items-center gap-1 hover:text-cyan-400 transition">
            <BookOpen size={18} /> Courses
          </Link>
        </nav>

        {/* Right Side Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 bg-gray-800/60 hover:bg-gray-700/70 px-4 py-2 rounded-full border border-gray-700/40 transition"
              >
                <User size={20} className="text-cyan-400" />
                <span className="text-white font-medium">{user.username}</span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 rounded-lg shadow-xl border border-gray-700/50 backdrop-blur-md z-50">
                  <div className="p-4 border-b border-gray-700/50">
                    <p className="text-white font-medium">{user.username}</p>
                  </div>
                  <div className="py-2">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 transition"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings size={16} className="mr-3" /> Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-gray-800/50 transition"
                    >
                      <LogOut size={16} className="mr-3" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2 rounded-full font-semibold text-black
              bg-gradient-to-r from-cyan-400 to-purple-500
              hover:from-purple-500 hover:to-cyan-400
              shadow-lg shadow-cyan-500/50 hover:shadow-purple-500/60
              transition-all transform hover:scale-105 hover:brightness-110"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-gray-200 hover:text-cyan-400 transition">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-black/70 backdrop-blur-md px-6 py-6 space-y-4 text-gray-200 font-medium">
          <Link to="/" className="flex items-center gap-2 hover:text-cyan-400 transition" onClick={() => setIsOpen(false)}>
            <Home size={18} /> Home
          </Link>
          <Link to="/find-institutions" className="flex items-center gap-2 hover:text-cyan-400 transition" onClick={() => setIsOpen(false)}>
            <GraduationCap size={18} /> Institutions
          </Link>
          <Link to="/career-guide" className="flex items-center gap-2 text-cyan-400 font-semibold" onClick={() => setIsOpen(false)}>
            <Cpu size={18} /> AI Career Guide
          </Link>
          <Link to="/courses" className="flex items-center gap-2 hover:text-cyan-400 transition" onClick={() => setIsOpen(false)}>
            <BookOpen size={18} /> Courses
          </Link>

          {isLoggedIn && user ? (
            <div className="pt-4 border-t border-gray-700/50">
              <div className="flex items-center space-x-3 mb-4">
                <User size={20} className="text-cyan-400" />
                <div>
                  <p className="text-white font-medium">{user.username}</p>
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
              to="/login"
              className="block bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-semibold px-4 py-2 rounded-full shadow-lg transition-all hover:from-purple-500 hover:to-cyan-400"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
          )}
        </nav>
      )}

      {isUserMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />}
    </header>
  );
}
