import { useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Particles from "react-tsparticles";
import type { Engine } from "tsparticles-engine";
import { loadSlim } from "tsparticles-slim";

export default function Hero() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particleOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: "transparent" },
      particles: {
        number: { value: 60, density: { enable: true, area: 800 } },
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
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-hidden">
      <Particles id="tsparticles" init={particlesInit} options={particleOptions} className="absolute inset-0 z-0" />

      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl top-10 left-10 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl bottom-10 right-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 text-center px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
          Find the Perfect Course with AI
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Discover institutions, explore courses, and let our AI recommend the best path
          based on your qualification and interests.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/career-guide"
            className="px-6 py-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold shadow-lg shadow-cyan-500/50 transition"
          >
            🚀 Get AI Guidance
          </Link>
          <Link
            to="/find-institutions"
            className="px-6 py-3 rounded-full border border-gray-500 hover:border-cyan-400 hover:text-cyan-400 transition"
          >
            🎓 Find Institutions
          </Link>
        </div>

        <div className="mt-10 max-w-md mx-auto">
          <input
            type="text"
            placeholder="🔍 Search courses..."
            className="w-full px-4 py-3 rounded-full bg-gray-800/60 border border-gray-600 text-gray-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>
      </div>
    </section>
  );
}


