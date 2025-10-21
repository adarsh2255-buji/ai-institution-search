import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export type NearbyInstitution = {
  institute: string;
  course: string;
  fee: number;
  duration: string;
  location: string;
  mode: string;
  description: string;
  reason?: string;
  distance_km?: number;
};

interface NearbyResultsProps {
  results: NearbyInstitution[];
  status: "results" | "suggestions";
}

const NearbyResults: React.FC<NearbyResultsProps> = ({ results, status }) => {
  return (
    <motion.div
      className="max-w-6xl w-full mt-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Dynamic heading */}
      <motion.h2
        className={`text-2xl font-bold mb-8 text-center tracking-wide ${
          status === "results" ? "text-cyan-400" : "text-yellow-400"
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {status === "results"
          ? "✅ Searched results"
          : "⚡ No exact match found — here are some recommendations"}
      </motion.h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.length > 0 ? (
          results.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative group bg-gradient-to-br from-[#0f172a]/70 to-[#1e293b]/60 
                         backdrop-blur-xl border border-[#38bdf8]/20 p-6 rounded-2xl 
                         shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
            >
              <motion.div
                className="absolute inset-0 rounded-2xl bg-cyan-500/10 opacity-0 group-hover:opacity-100 blur-md transition-opacity"
                initial={false}
              />
              <h2 className="text-xl font-semibold text-cyan-400 mb-2">{item.institute}</h2>
              <p className="text-gray-200 text-sm mb-3 italic">{item.course}</p>

              <div className="space-y-1 text-gray-300 text-sm">
                <p><span className="text-cyan-400">📍 Location:</span> {item.location}</p>
                <p><span className="text-cyan-400">🎓 Mode:</span> {item.mode}</p>
                <p><span className="text-cyan-400">⏱ Duration:</span> {item.duration}</p>
                <p><span className="text-cyan-400">💰 Fee:</span> ₹{item.fee}</p>
                {item.distance_km && (
                  <p><span className="text-cyan-400">📏 Distance:</span> {item.distance_km} km</p>
                )}
              </div>

              <p className="mt-4 text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>

              {item.reason && (
                <motion.div
                  className="mt-4 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 
                             text-cyan-300 text-xs rounded-lg w-fit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  🧭 {item.reason}
                </motion.div>
              )}
            </motion.div>
          ))
        ) : (
          <motion.p
            className="text-center py-10 text-gray-400 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No nearby institutions found within your radius 🚫
          </motion.p>
        )}
      </div>
    </motion.div>
  );
};

export default NearbyResults;
