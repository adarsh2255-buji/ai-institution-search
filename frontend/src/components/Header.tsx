import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Home, BookOpen, Cpu, GraduationCap } from "lucide-react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-black/50 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-white tracking-wide hover:scale-105 transition transform font-italic flex gap-1">
        <a href="/">
            <svg width="31" height="34" viewBox="0 0 31 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m8.75 5.3 6.75 3.884 6.75-3.885M8.75 28.58v-7.755L2 16.939m27 0-6.75 3.885v7.754M2.405 9.408 15.5 16.954l13.095-7.546M15.5 32V16.939M29 22.915V10.962a2.98 2.98 0 0 0-1.5-2.585L17 2.4a3.01 3.01 0 0 0-3 0L3.5 8.377A3 3 0 0 0 2 10.962v11.953A2.98 2.98 0 0 0 3.5 25.5L14 31.477a3.01 3.01 0 0 0 3 0L27.5 25.5a3 3 0 0 0 1.5-2.585" stroke="url(#a)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                <defs>
                    <linearGradient id="a" x1="15.5" y1="2" x2="15.5" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#F8FAFC"/>
                    <stop offset="1" stop-color="#383838"/>
                    </linearGradient>
                </defs>
            </svg>
        </a>
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

        {/* Login Button */}
        <Link
  to="/login"
  className="hidden md:inline-block px-6 py-2 rounded-full font-semibold text-black
             bg-gradient-to-r from-cyan-400 to-purple-500
             hover:from-purple-500 hover:to-cyan-400
             shadow-lg shadow-cyan-500/50 hover:shadow-purple-500/60
             transition-all transform hover:scale-105 hover:brightness-110"
>
  Login
</Link>


        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-gray-200 hover:text-cyan-400 transition"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-black/70 backdrop-blur-md px-6 py-6 space-y-4 text-gray-200 font-medium">
          <Link to="/" className="flex items-center gap-2 hover:text-cyan-400 transition">
            <Home size={18} /> Home
          </Link>
          <Link to="/institutions" className="flex items-center gap-2 hover:text-cyan-400 transition">
            <GraduationCap size={18} /> Institutions
          </Link>
          <Link to="/career-guide" className="flex items-center gap-2 text-cyan-400 font-semibold">
            <Cpu size={18} /> AI Career Guide
          </Link>
          <Link to="/courses" className="flex items-center gap-2 hover:text-cyan-400 transition">
            <BookOpen size={18} /> Courses
          </Link>
          <Link
  to="/login"
  className="hidden md:inline-block px-6 py-2 rounded-full font-semibold text-black
             bg-gradient-to-r from-cyan-400 to-purple-500
             hover:from-purple-500 hover:to-cyan-400
             shadow-lg shadow-cyan-500/50 hover:shadow-purple-500/60
             transition-all transform hover:scale-105 hover:brightness-110"
>
  Login
</Link>

        </nav>
      )}
    </header>
  );
}