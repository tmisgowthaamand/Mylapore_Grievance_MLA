"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, CheckCircle2, MessageSquare, AlertCircle } from "lucide-react";
import axios from "axios";

export default function GrievanceCard({ grievance, onStatusUpdate }) {
  const [isResolving, setIsResolving] = useState(false);

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await axios.post(`http://localhost:4000/api/admin/grievances/${grievance.id}/status`, { status: 'Resolved' });
      onStatusUpdate(grievance.id, 'Resolved');
    } catch (err) {
      console.error(err);
    }
    setIsResolving(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700 border-red-200';
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'Resolved': return <CheckCircle2 className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 card-3d relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${getStatusColor(grievance.status)}`}>
              {getStatusIcon(grievance.status)} {grievance.status}
            </span>
            <span className="text-[11px] text-gray-400 font-mono tracking-tight bg-gray-50 px-2 py-1 rounded-lg">
              #{grievance.id}
            </span>
          </div>
          <h3 className="font-bold text-navy text-lg">{grievance.subCategory || grievance.sub}</h3>
          <p className="text-xs text-saffron font-semibold">{grievance.category}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
        "{grievance.message}"
      </p>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-[150px]">{grievance.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{grievance.submittedAt}</span>
        </div>
      </div>

      {grievance.status === 'Open' && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="flex-1 bg-tvk-green text-white font-bold text-xs py-2.5 rounded-xl shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> {isResolving ? 'Resolving...' : 'Mark Resolved'}
          </button>
          <button className="flex-1 bg-navy/5 text-navy font-bold text-xs py-2.5 rounded-xl hover:bg-navy/10 transition-colors flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" /> Respond
          </button>
        </div>
      )}
    </motion.div>
  );
}
