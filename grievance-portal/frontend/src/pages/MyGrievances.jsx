import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { MapPin, Clock, MessageSquare, Plus, Search } from 'lucide-react'
import axios from 'axios'

export default function MyGrievances() {
  const { user, grievances, setGrievances } = useContext(AuthContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGrievances()
  }, [])

  const fetchGrievances = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/grievances/user/${user.phone || user.epic}`)
      if (res.data.grievances) {
        setGrievances(res.data.grievances)
      }
    } catch (err) {
      // Use local state
    }
    setLoading(false)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700">🔴 Open</span>
      case 'Responded':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">🟢 Responded</span>
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">🔵 In Progress</span>
      case 'Resolved':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-green-200 text-green-800">✅ Resolved</span>
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">{status}</span>
    }
  }

  const getProgressWidth = (status) => {
    switch (status) {
      case 'Open': return '12%'
      case 'In Progress': return '40%'
      case 'Responded': return '55%'
      case 'Resolved': return '100%'
      default: return '12%'
    }
  }

  const getProgressColor = (status) => {
    switch (status) {
      case 'Resolved': return 'bg-tvk-green'
      case 'Responded': return 'bg-tvk-green'
      case 'In Progress': return 'bg-tvk-blue'
      default: return 'bg-saffron'
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy font-serif">📂 My Grievances</h1>
          <p className="text-sm text-gray-500">
            {user?.name || 'Mylapore Resident'} — <strong>{grievances.length}</strong> grievance{grievances.length !== 1 ? 's' : ''} filed
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/track')} className="btn-outline text-xs py-2 px-3 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" /> Track
          </button>
          <button onClick={() => navigate('/grievance')} className="btn-primary text-xs py-2 px-3 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
      </div>

      {/* Grievance List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">
          <div className="animate-spin w-8 h-8 border-3 border-navy border-t-transparent rounded-full mx-auto mb-3"></div>
          Loading grievances...
        </div>
      ) : grievances.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-gray-500 mb-4">No grievances raised yet.</p>
          <button onClick={() => navigate('/grievance')} className="btn-primary text-sm">
            📋 Raise Your First Grievance
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {grievances.map((g, i) => (
            <div key={g.id || i} className={`card p-5 ${g.status === 'Responded' ? 'border-green-200 bg-green-50/30' : ''}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-tvk-blue tracking-wide">#{g.id}</span>
                {getStatusBadge(g.status)}
              </div>

              {/* Category Tag */}
              <div className="mb-2">
                <span className="inline-block bg-navy-light text-navy text-xs font-bold px-2 py-0.5 rounded">
                  {g.category}
                </span>
              </div>

              {/* Issue */}
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{g.sub || g.subCategory}</h3>

              {/* Location */}
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <MapPin className="w-3.5 h-3.5" />
                {g.location}
              </div>

              {/* Message */}
              {g.message && (
                <p className="text-xs text-gray-600 italic bg-gray-50 rounded p-2 mb-3">
                  "{g.message.substring(0, 100)}{g.message.length > 100 ? '...' : ''}"
                </p>
              )}

              {/* MLA Response */}
              {g.response && (
                <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-tvk-green mb-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    MLA Team Response:
                  </div>
                  <p className="text-sm text-green-800">"{g.response}"</p>
                  {g.respondedAt && (
                    <p className="text-xs text-green-600 mt-1">Responded: {g.respondedAt}</p>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  📅 {g.submittedAt}
                </span>
                <span className={`font-semibold ${g.status === 'Responded' ? 'text-tvk-green' : 'text-saffron'}`}>
                  {g.status === 'Responded' ? '✓ Action Initiated' : '⏳ Awaiting Review'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${getProgressColor(g.status)}`} style={{ width: getProgressWidth(g.status) }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>Received</span><span>Review</span><span>Action</span><span>Resolved</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
