import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";


export default function LandingPage() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particleOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: "transparent" },
      particles: {
        number: { value: 50, density: { enable: true, area: 800 } },
        size: { value: 3 },
        move: { enable: true, speed: 1 },
        opacity: { value: 0.6 },
        color: { value: "#00fff7" },
        links: { enable: true, color: "#00fff7", opacity: 0.3, distance: 150 },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    <div className="text-white">
      {/* Hero Section */}
      <section
        id="hero"
        className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden"
      >
        <Particles
          id="tsparticles"
          init={particlesInit}
          options={particleOptions}
          className="absolute inset-0 z-0"
        />
        {/* Soft Glow Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>
        <div className="absolute w-80 h-80 bg-pink-500/10 rounded-full blur-2xl top-1/3 right-1/4 animate-ping"></div>
        <div className="absolute w-72 h-72 bg-blue-500/10 rounded-full blur-2xl bottom-1/4 left-1/3 animate-ping"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-10 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
          Find the Perfect Course with AI
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          Explore institutions and courses handpicked for your growth. Let our AI guide
          you to the best opportunities based on your skills and interests.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/career-guide"
            className="px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/50 transition-all transform hover:scale-105"
          >
            🚀 Get AI Guidance
          </Link>
          <Link
            to="/find-institutions"
            className="px-6 py-3 rounded-full border border-gray-500 hover:border-cyan-400 hover:text-cyan-400 transition-all transform hover:scale-105"
          >
            🎓 Find Institutions
          </Link>
        </div>

        {/* Floating Info Cards */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-cyan-500/30 transition transform hover:-translate-y-2">
            <h3 className="text-xl font-semibold text-white mb-2">✅ Personalized AI</h3>
            <p className="text-gray-400 text-sm">
              Recommendations tailored to your skills and preferences.
            </p>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-purple-500/30 transition transform hover:-translate-y-2">
            <h3 className="text-xl font-semibold text-white mb-2">📚 Curated Courses</h3>
            <p className="text-gray-400 text-sm">
              Discover high-quality courses across top institutions.
            </p>
          </div>
          <div className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl shadow-lg hover:shadow-blue-500/30 transition transform hover:-translate-y-2">
            <h3 className="text-xl font-semibold text-white mb-2">🚀 Career Growth</h3>
            <p className="text-gray-400 text-sm">
              Advance your career with skills that matter in today’s market.
            </p>
          </div>
        </div>
      </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-gray-950 text-center">
  <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
    Powerful Features
  </h1>
  <p className="text-base text-gray-400 max-w-md mx-auto">
    Everything you need to manage, track, and grow your skills and learning, efficiently and effectively.
  </p>

  <div className="flex flex-wrap items-center justify-center gap-8 mt-20 px-4 md:px-0">
    {/* Feature Card 1 */}
    <div className="flex flex-col text-center items-center justify-center rounded-2xl p-8 border border-violet-500/30 bg-gray-900/50 
                    hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/20 
                    transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 max-w-sm">
      <div className="p-6 aspect-square bg-violet-100 rounded-full flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 18.667V24.5m4.668-8.167V24.5m4.664-12.833V24.5m2.333-21L15.578 13.587a.584.584 0 0 1-.826 0l-3.84-3.84a.583.583 0 0 0-.825 0L2.332 17.5M4.668 21v3.5m4.664-8.167V24.5" stroke="#7F22FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="space-y-2 mt-4">
        <h3 className="text-lg font-semibold text-white">AI-Powered Course Search</h3>
        <p className="text-gray-400">Find the most relevant courses instantly using AI-driven search that matches your skills, interests, and career goals.</p>
      </div>
    </div>

    {/* Feature Card 2 */}
    <div className="flex flex-col text-center items-center justify-center rounded-2xl p-8 border border-green-500/30 bg-gray-900/50 
                    hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 
                    transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 max-w-sm">
      <div className="p-6 aspect-square bg-green-100 rounded-full flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 11.667A2.333 2.333 0 0 0 11.667 14c0 1.19-.117 2.929-.304 4.667m4.972-3.36c0 2.776 0 7.443-1.167 10.36m5.004-1.144c.14-.7.502-2.683.583-3.523M2.332 14a11.667 11.667 0 0 1 21-7m-21 11.667h.01m23.092 0c.233-2.333.152-6.246 0-7" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M5.832 22.75C6.415 21 6.999 17.5 6.999 14a7 7 0 0 1 .396-2.333m2.695 13.999c.245-.77.525-1.54.665-2.333m-.255-15.4A7 7 0 0 1 21 14v2.333" stroke="#00A63E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="space-y-2 mt-4">
        <h3 className="text-lg font-semibold text-white">Personalized Recommendations</h3>
        <p className="text-gray-400">Receive tailored course suggestions based on your qualifications, learning history, and professional aspirations.</p>
      </div>
    </div>

    {/* Feature Card 3 */}
    <div className="flex flex-col text-center items-center justify-center rounded-2xl p-8 border border-orange-500/30 bg-gray-900/50 
                    hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 
                    transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 max-w-sm">
      <div className="p-6 aspect-square bg-orange-100 rounded-full flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.668 25.666h16.333a2.333 2.333 0 0 0 2.334-2.333V8.166L17.5 2.333H7a2.333 2.333 0 0 0-2.333 2.333v4.667" stroke="#F54900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.332 2.333V7a2.334 2.334 0 0 0 2.333 2.333h4.667m-21 8.167h11.667M10.5 21l3.5-3.5-3.5-3.5" stroke="#F54900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="space-y-2 mt-4">
        <h3 className="text-lg font-semibold text-white">Nearest Course Finder</h3>
        <p className="text-gray-400">Locate courses and training centers near you with real-time, location-based search functionality.</p>
      </div>
    </div>
  </div>
</section>


      {/* Contact Section */}
      <div className="w-full bg-slate-900 px-2 text-center text-white py-20 flex flex-col items-center justify-center">
    <p className="text-indigo-500 font-medium">Get updated</p>
    <h1 className="max-w-lg font-semibold text-4xl/[44px] mt-2">Subscribe to our newsletter & get the latest news</h1>
    <div className="flex items-center justify-center mt-10 border border-slate-600 focus-within:outline focus-within:outline-indigo-600 text-sm rounded-full h-14 max-w-md w-full">
        <input type="text" className="bg-transparent outline-none rounded-full px-4 h-full flex-1" placeholder="Enter your email address"/>
        <button className="bg-indigo-600 text-white rounded-full h-11 mr-1 px-8 flex items-center justify-center">
            Subscribe now
        </button>
    </div>
</div>

      {/* Footer */}
      <footer className="flex flex-wrap justify-center lg:justify-between overflow-hidden gap-10 md:gap-20 py-16 px-6 md:px-16 lg:px-24 xl:px-32 text-[13px] text-gray-500 bg-black">
    <div className="flex flex-wrap items-start gap-10 md:gap-[60px] xl:gap-[140px]">
        <a href="https://prebuiltui.com">
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
        <div>
            <p className="text-slate-100 font-semibold">Product</p>
            <ul className="mt-2 space-y-2">
                <li><a href="/" className="hover:text-indigo-600 transition">Home</a></li>
                <li><a href="/" className="hover:text-indigo-600 transition">Support</a></li>
                <li><a href="/" className="hover:text-indigo-600 transition">Pricing</a></li>
                <li><a href="/" className="hover:text-indigo-600 transition">Affiliate</a></li>
            </ul>
        </div>
        <div>
            <p className="text-slate-100 font-semibold">Resources</p>
            <ul className="mt-2 space-y-2">
                <li><a href="/" className="hover:text-indigo-600 transition">Company</a></li>
                <li><a href="/" className="hover:text-indigo-600 transition">Blogs</a></li>
                <li><a href="/" className="hover:text-indigo-600 transition">Community</a></li>
                <li><a href="/" className="hover:text-indigo-600 transition">Careers<span className="text-xs text-white bg-indigo-600 rounded-md ml-2 px-2 py-1">We’re hiring!</span></a></li>
                <li><a href="/" className="hover:text-indigo-600 transition">About</a></li>
            </ul>
        </div>
        <div>
            <p className="text-slate-100 font-semibold">Legal</p>
            <ul className="mt-2 space-y-2">
                <li><a href="/" className="hover:text-indigo-600 transition">Privacy</a></li>
                <li><a href="/" className="hover:text-indigo-600 transition">Terms</a></li>
            </ul>
        </div>
    </div>
    <div className="flex flex-col max-md:items-center max-md:text-center gap-2 items-end">
        <p className="max-w-60">Making every customer feel valued—no matter the size of your audience.</p>
        <div className="flex items-center gap-4 mt-3">
            <a href="https://dribbble.com/prebuiltui" target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-dribbble size-5 hover:text-indigo-500" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94"></path>
                    <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32"></path>
                    <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72"></path>
                </svg>
            </a>
            <a href="https://www.linkedin.com/company/prebuiltui" target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-linkedin size-5 hover:text-indigo-500" aria-hidden="true">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect width="4" height="12" x="2" y="9"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                </svg>
            </a>
            <a href="https://x.com/prebuiltui" target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-twitter size-5 hover:text-indigo-500" aria-hidden="true">
                    <path
                        d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z">
                    </path>
                </svg>
            </a>
            <a href="https://www.youtube.com/@prebuiltui" target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-youtube size-6 hover:text-indigo-500" aria-hidden="true">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17">
                    </path>
                    <path d="m10 15 5-3-5-3z"></path>
                </svg>
            </a>
        </div>
        <p className="mt-3 text-center">© 2025 <a href="https://prebuiltui.com">PrebuiltUI</a></p>
    </div>
</footer>
    </div>
  );
}