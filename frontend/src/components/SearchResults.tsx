import React from "react";
import { motion, AnimatePresence } from "framer-motion";

type Match = {
  institute: string;
  course: string;
  fee: number;
  duration: string;
  location: string;
  description: string;
  mode: string;
};

export type ApiResponse =
  | {
      status: "results";
      message: string;
      matches: Match[];
    }
  | {
      status: "suggestions";
      message: string;
      matches: Match[];
    }
    ;

interface SearchResultsProps {
  response: ApiResponse;
}

const SearchResults: React.FC<SearchResultsProps> = ({ response }) => {
  return (
    <motion.div
      className="max-w-4xl w-full mt-10 bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-2xl p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {response.status === "suggestions" && (
        <motion.p
          className="text-yellow-400 font-medium mb-4 text-center "
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {response.message}
        </motion.p>
      )}
            {/* <h1 className="text-center mb-5 text-xl text-yellow-400 font-bold">{response.message}</h1> */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <AnimatePresence>
          {response.matches.map((item, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group border border-white/10 rounded-xl p-5 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300"
            >
              
              <h3 className="text-lg font-semibold text-indigo-400 mb-1 group-hover:text-indigo-300 transition-colors">
                {item.course}
              </h3>
              <p className="text-sm text-gray-300 mb-2">
                <span className="font-medium text-white">{item.institute}</span>{" "}
                — {item.location}
              </p>
              <p className="text-gray-400 text-sm mb-3">
                {item.description || "No description available"}
              </p>
              <div className="flex justify-between text-sm text-gray-400">
                <span>💰 ₹{item.fee}</span>
                <span>⏳ {item.duration}</span>
                <span>🎓 {item.mode}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SearchResults;
