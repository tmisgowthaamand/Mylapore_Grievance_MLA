"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/StatCard";
import GrievanceCard from "@/components/GrievanceCard";
import { LayoutDashboard, CheckSquare, AlertCircle, Clock, Lock, User as UserIcon, MapPin } from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Dashboard");
  const [inboxFilter, setInboxFilter] = useState("All");

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

  const getFilteredGrievances = () => {
    if (filter === "Inbox") {
      return inboxFilter === "All" 
        ? grievances.filter(g => g.status !== "Resolved") 
        : grievances.filter(g => g.status === inboxFilter);
    }
    if (filter === "Resolved") return grievances.filter(g => g.status === "Resolved");
    return grievances;
  };

  const filteredGrievances = getFilteredGrievances();

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
        <header className="mb-8 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 p-2 flex items-center justify-center">
              <img src="/categories/social/Youtube.png" alt="TVK" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-navy tracking-tight mb-1">
                {filter === "Dashboard" ? "Constituency Overview" : "Inbox Intelligence"}
              </h1>
              <p className="text-gray-500 text-sm font-medium">
                {filter === "Dashboard" ? "Real-time performance metrics and statistics." : "Manage and respond to constituency grievances."}
              </p>
            </div>
          </div>
        </header>

        {/* Dashboard View: Stats & Categories */}
        {filter === "Dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard title="Total Grievances" value={totalCount} icon={LayoutDashboard} colorClass="bg-blue-500" trend={12} />
              <StatCard title="Open Issues" value={openCount} icon={AlertCircle} colorClass="bg-red-500" trend={-5} />
              <StatCard title="Responded" value={respondedCount} icon={Clock} colorClass="bg-orange-500" />
              <StatCard title="Resolved" value={resolvedCount} icon={CheckSquare} colorClass="bg-green-500" trend={18} />
            </div>

            {/* Constituency Analytics Section */}
            <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-saffron rounded-full" />
                <h3 className="text-xl font-black text-navy">Data Distribution Analytics</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active Categories</p>
                  {Object.entries(
                    grievances.reduce((acc, g) => { acc[g.category] = (acc[g.category] || 0) + 1; return acc; }, {})
                  ).sort((a,b) => b[1]-a[1]).slice(0, 4).map(([name, count], idx) => (
                    <div key={name} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black text-navy uppercase">
                        <span>{name}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                        <div className={`h-full ${["bg-saffron", "bg-blue-500", "bg-tvk-green", "bg-purple-500"][idx % 4]} rounded-full`} style={{ width: `${(count/totalCount)*100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-navy rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Total System Load</p>
                  <h4 className="text-5xl font-black text-white tracking-tighter">{totalCount}</h4>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Inbox View: Grievance Details */}
        {(filter === "Inbox" || filter === "Resolved") && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 bg-saffron rounded-full" />
                <h2 className="text-xl font-black text-navy tracking-tight">
                  {filter === "Resolved" ? "Resolved Archives" : `${inboxFilter} Monitoring`}
                </h2>
              </div>
              {filter === "Inbox" && (
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                  {['All', 'Open', 'Responded'].map(f => (
                    <button
                      key={f}
                      onClick={() => setInboxFilter(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        inboxFilter === f 
                          ? 'bg-white text-navy shadow-sm border border-gray-200' 
                          : 'text-gray-500 hover:text-navy'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center text-gray-400 font-semibold animate-pulse font-mono tracking-tighter uppercase">Initializing Inbox Data...</div>
            ) : filteredGrievances.length === 0 ? (
              <div className="py-20 text-center text-gray-400 font-semibold">No {filter.toLowerCase()} grievances found in inbox.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGrievances.map((g) => (
                  <GrievanceCard key={g.id} grievance={g} onStatusUpdate={handleStatusUpdate} />
                ))}
              </div>
            )}
          </div>
        )}

        {filter === "Settings" && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100 mt-8">
            <Settings className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-navy mb-2">Settings</h2>
            <p className="text-gray-500">System configuration and admin preferences will appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
}
