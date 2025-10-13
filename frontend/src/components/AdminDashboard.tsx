// src/components/AdminDashboard.tsx
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Institution {
  id: number
  name: string
  location: string
  email: string
  phone: string
  courses: number
  registeredDate: string
  status: 'active' | 'pending' | 'inactive'
}

export default function AdminDashboard() {
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  
  // Mock data - replace with actual API calls
  const totalUsers = 1247
  const totalInstitutions = 89
  
  const institutions: Institution[] = [
    {
      id: 1,
      name: "Tech Academy Mumbai",
      location: "Mumbai, Maharashtra",
      email: "info@techacademy.in",
      phone: "+91-9876543210",
      courses: 15,
      registeredDate: "2024-01-15",
      status: 'active'
    },
    {
      id: 2,
      name: "Digital Learning Hub",
      location: "Bangalore, Karnataka",
      email: "contact@digitalhub.com",
      phone: "+91-8765432109",
      courses: 22,
      registeredDate: "2024-02-03",
      status: 'active'
    },
    {
      id: 3,
      name: "Innovation Institute",
      location: "Delhi, NCR",
      email: "admin@innovation.edu",
      phone: "+91-7654321098",
      courses: 18,
      registeredDate: "2024-01-28",
      status: 'pending'
    },
    {
      id: 4,
      name: "Future Skills Center",
      location: "Pune, Maharashtra",
      email: "hello@futureskills.org",
      phone: "+91-6543210987",
      courses: 12,
      registeredDate: "2024-02-10",
      status: 'active'
    },
    {
      id: 5,
      name: "Code Masters Academy",
      location: "Hyderabad, Telangana",
      email: "info@codemasters.ac",
      phone: "+91-5432109876",
      courses: 25,
      registeredDate: "2024-01-20",
      status: 'active'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'pending': return 'text-yellow-400 bg-yellow-400/20'
      case 'inactive': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-7xl mx-auto"
      >
        <h1 className="text-4xl font-bold text-center text-green-400 mb-8">
          Admin Dashboard
        </h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gray-900/60 backdrop-blur-md border border-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-gray-300 mb-2">Total Users</h3>
                <p className="text-4xl font-bold text-green-400">{totalUsers.toLocaleString()}</p>
              </div>
              <div className="text-6xl opacity-20">👥</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-gray-900/60 backdrop-blur-md border border-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg text-gray-300 mb-2">Total Institutions</h3>
                <p className="text-4xl font-bold text-green-400">{totalInstitutions.toLocaleString()}</p>
              </div>
              <div className="text-6xl opacity-20">🏫</div>
            </div>
          </motion.div>
        </div>

        {/* Institutions Table */}
        <div className="rounded-2xl bg-gray-900/60 backdrop-blur-md border border-green-500/30 overflow-hidden">
          <div className="p-6 border-b border-green-500/30">
            <h2 className="text-2xl font-bold text-green-400">Registered Institutions</h2>
            <p className="text-gray-400 mt-1">Click on any institution to view details</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-green-300 font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-green-300 font-semibold">Location</th>
                  <th className="px-6 py-4 text-left text-green-300 font-semibold">Courses</th>
                  <th className="px-6 py-4 text-left text-green-300 font-semibold">Status</th>
                  <th className="px-6 py-4 text-left text-green-300 font-semibold">Registered</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((institution) => (
                  <motion.tr
                    key={institution.id}
                    whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.1)" }}
                    className="border-b border-gray-700/50 cursor-pointer"
                    onClick={() => setSelectedInstitution(institution)}
                  >
                    <td className="px-6 py-4 text-green-200 font-medium">{institution.name}</td>
                    <td className="px-6 py-4 text-gray-300">{institution.location}</td>
                    <td className="px-6 py-4 text-gray-300">{institution.courses}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(institution.status)}`}>
                        {institution.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{institution.registeredDate}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Institution Details Popup */}
        <AnimatePresence>
          {selectedInstitution && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedInstitution(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-green-500/30"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-green-400">Institution Details</h3>
                  <button
                    onClick={() => setSelectedInstitution(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-green-300 text-sm">Name</label>
                    <p className="text-white font-medium">{selectedInstitution.name}</p>
                  </div>
                  
          <div>
                    <label className="text-green-300 text-sm">Location</label>
                    <p className="text-white">{selectedInstitution.location}</p>
          </div>

          <div>
                    <label className="text-green-300 text-sm">Email</label>
                    <p className="text-white">{selectedInstitution.email}</p>
          </div>

          <div>
                    <label className="text-green-300 text-sm">Phone</label>
                    <p className="text-white">{selectedInstitution.phone}</p>
          </div>

          <div>
                    <label className="text-green-300 text-sm">Courses Offered</label>
                    <p className="text-white font-medium">{selectedInstitution.courses}</p>
          </div>

          <div>
                    <label className="text-green-300 text-sm">Registration Date</label>
                    <p className="text-white">{selectedInstitution.registeredDate}</p>
          </div>

          <div>
                    <label className="text-green-300 text-sm">Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInstitution.status)}`}>
                      {selectedInstitution.status}
                    </span>
                  </div>
          </div>

                <div className="mt-6 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 bg-green-500 text-black font-bold rounded-lg"
                  >
                    Edit Institution
                  </motion.button>
          <motion.button
                    whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedInstitution(null)}
                    className="flex-1 py-2 bg-gray-700 text-white font-bold rounded-lg"
          >
                    Close
          </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
