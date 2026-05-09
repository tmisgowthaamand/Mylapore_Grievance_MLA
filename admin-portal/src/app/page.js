"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import GrievanceCard from "@/components/GrievanceCard";
import { LayoutDashboard, CheckSquare, AlertCircle, Clock, Lock, User as UserIcon } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    const auth = localStorage.getItem("tvk_admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
      fetchGrievances();
    }
    setAuthChecked(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      localStorage.setItem("tvk_admin_auth", "true");
      setIsAuthenticated(true);
      fetchGrievances();
    } else {
      setLoginError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tvk_admin_auth");
    setIsAuthenticated(false);
  };

  const fetchGrievances = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/admin/grievances");
      if (res.data.success) {
        setGrievances(res.data.grievances.reverse());
      }
    } catch (err) {
      console.error("Failed to fetch grievances", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (id, newStatus, response = null) => {
    setGrievances(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, status: newStatus, ...(response && { response }) };
      }
      return g;
    }));
  };

  const openCount = grievances.filter(g => g.status === 'Open').length;
  const resolvedCount = grievances.filter(g => g.status === 'Resolved').length;
  const respondedCount = grievances.filter(g => g.status === 'Responded').length;
  const totalCount = grievances.length;

  const filteredGrievances = filter === "All" 
    ? grievances 
    : grievances.filter(g => g.status === filter);

  if (!authChecked) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-navy">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-saffron/30 rounded-full mix-blend-screen filter blur-[150px] opacity-70 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-tvk-green/30 rounded-full mix-blend-screen filter blur-[150px] opacity-70 animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50" />
        </div>

        {/* Ambient Overlay for texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay z-0"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[420px] p-10 rounded-[2.5rem] bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
        >
          <div className="text-center mb-10 relative">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white to-gray-200 flex items-center justify-center shadow-[0_0_40px_rgba(255,139,0,0.3)] border-2 border-white/50 relative group"
            >
              <div className="absolute inset-0 rounded-2xl bg-saffron/20 blur-xl transition-all duration-500 group-hover:bg-saffron/40" />
              <span className="font-black text-4xl text-navy relative z-10 tracking-tighter">TVK</span>
            </motion.div>
            
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Admin Portal</h1>
            <p className="text-sm text-saffron/90 font-bold mt-2 tracking-[0.2em] uppercase drop-shadow-sm">Mylapore Constituency</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-white/70 uppercase tracking-widest ml-1 drop-shadow-sm">Username</label>
              <div className="relative group">
                <UserIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-saffron transition-colors" />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron focus:bg-black/30 backdrop-blur-md transition-all shadow-inner"
                  placeholder="admin"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[11px] font-black text-white/70 uppercase tracking-widest ml-1 drop-shadow-sm">Password</label>
              <div className="relative group">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50 group-focus-within:text-saffron transition-colors" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-saffron/50 focus:border-saffron focus:bg-black/30 backdrop-blur-md transition-all shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 backdrop-blur-md border border-red-500/30 text-red-200 text-sm font-bold text-center p-3 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.2)]"
              >
                {loginError}
              </motion.div>
            )}
            
            <button 
              type="submit" 
              className="w-full mt-8 relative overflow-hidden group bg-gradient-to-r from-saffron to-[#e67e00] text-white font-black text-lg py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(255,139,0,0.4)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              <span className="relative z-10 drop-shadow-md">Secure Login</span>
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex animated-bg relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 rounded-full blur-[100px]" />
      </div>

      <Sidebar activeTab={filter} onTabChange={setFilter} onLogout={handleLogout} />

      <main className="flex-1 ml-64 p-8 relative z-10 overflow-y-auto h-screen">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-navy tracking-tight mb-1">Overview</h1>
            <p className="text-gray-500 text-sm font-medium">Track, resolve, and manage constituency issues.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-600">System Online</span>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Grievances" value={totalCount} icon={LayoutDashboard} colorClass="bg-blue-500" trend={12} />
          <StatCard title="Open Issues" value={openCount} icon={AlertCircle} colorClass="bg-red-500" trend={-5} />
          <StatCard title="Responded" value={respondedCount} icon={Clock} colorClass="bg-orange-500" />
          <StatCard title="Resolved" value={resolvedCount} icon={CheckSquare} colorClass="bg-green-500" trend={18} />
        </div>

        {/* Filters & Content */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-navy">Recent Grievances</h2>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
              {['All', 'Open', 'Responded', 'Resolved'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filter === f 
                      ? 'bg-white text-navy shadow-sm border border-gray-200' 
                      : 'text-gray-500 hover:text-navy'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-400 font-semibold animate-pulse">Loading grievances...</div>
          ) : filteredGrievances.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-semibold">No {filter.toLowerCase()} grievances found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGrievances.map((g) => (
                <GrievanceCard key={g.id} grievance={g} onStatusUpdate={handleStatusUpdate} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
