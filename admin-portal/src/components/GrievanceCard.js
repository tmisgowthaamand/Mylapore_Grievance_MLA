"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, CheckCircle2, MessageSquare, AlertCircle, User, Phone } from "lucide-react";
import axios from "axios";

export default function GrievanceCard({ grievance, onStatusUpdate }) {
  const [isResolving, setIsResolving] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [responseText, setResponseText] = useState("");

  const handleResolve = async () => {
    setIsResolving(true);
    try {
      await axios.post(`http://localhost:4000/api/admin/grievances/${grievance.id}/resolve`);
      onStatusUpdate(grievance.id, 'Resolved');
    } catch (err) {
      console.error(err);
    }
    setIsResolving(false);
  };

  const handleRespond = async () => {
    if (!responseText.trim()) return;
    setIsResponding(true);
    try {
      const res = await axios.post(`http://localhost:4000/api/admin/grievances/${grievance.id}/respond`, { response: responseText });
      onStatusUpdate(grievance.id, 'Responded', responseText);
      setShowResponseInput(false);
      setResponseText("");
    } catch (err) {
      console.error(err);
    }
    setIsResponding(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-700 border-red-200';
      case 'Responded': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'Responded': return <MessageSquare className="w-3.5 h-3.5" />;
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
      {/* User Info Header */}
      <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-slate-50 rounded-xl border border-gray-100">
        <div className="flex items-center gap-2 text-[11px] font-bold text-navy truncate">
          <User className="w-3.5 h-3.5 text-saffron flex-shrink-0" /> {grievance.userName || 'Guest'}
        </div>
        <div className="w-px h-3 bg-gray-300" />
        <div className="flex items-center gap-2 text-[11px] font-bold text-navy">
          <Phone className="w-3.5 h-3.5 text-tvk-green flex-shrink-0" /> {grievance.userPhone || (grievance.userId && grievance.userId.length === 10 && !isNaN(grievance.userId) ? grievance.userId : 'No Phone')}
        </div>
        <div className="w-px h-3 bg-gray-300" />
        <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
          <span className="bg-navy/10 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-tighter">EPIC</span> {grievance.userId || 'N/A'}
        </div>
      </div>

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
          <h3 className="font-bold text-navy text-lg leading-tight">{grievance.subCategory || grievance.sub}</h3>
          <p className="text-[11px] text-saffron font-bold uppercase tracking-tight">{grievance.category}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
        "{grievance.message}"
      </p>

      {grievance.response && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-[10px] font-bold text-blue-600 uppercase mb-1 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Official Response
          </p>
          <p className="text-xs text-blue-800 italic">"{grievance.response}"</p>
          <p className="text-[9px] text-blue-400 mt-1">Sent: {grievance.respondedAt}</p>
        </div>
      )}

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

      {showResponseInput && (
        <div className="mb-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
          <textarea
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-navy/20 focus:border-navy outline-none resize-none"
            placeholder="Type your response..."
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleRespond}
              disabled={isResponding || !responseText.trim()}
              className="flex-1 bg-navy text-white font-bold text-xs py-2 rounded-lg hover:bg-navy-dark disabled:opacity-50 transition-colors"
            >
              {isResponding ? "Sending..." : "Send Response"}
            </button>
            <button
              onClick={() => setShowResponseInput(false)}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {(grievance.status === 'Open' || grievance.status === 'Responded') && !showResponseInput && (
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <button
            onClick={handleResolve}
            disabled={isResolving}
            className="flex-1 bg-tvk-green text-white font-bold text-xs py-2.5 rounded-xl shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" /> {isResolving ? 'Resolving...' : 'Mark Resolved'}
          </button>
          {grievance.status === 'Open' && (
            <button 
              onClick={() => setShowResponseInput(true)}
              className="flex-1 bg-navy/5 text-navy font-bold text-xs py-2.5 rounded-xl hover:bg-navy/10 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> Respond
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
