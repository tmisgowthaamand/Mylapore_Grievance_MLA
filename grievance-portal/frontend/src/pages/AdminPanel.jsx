import { useState, useEffect } from 'react'
import { MapPin, MessageSquare, Send, CheckCircle2, Clock, Filter, Phone, RefreshCw, ImageIcon } from 'lucide-react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function AdminPanel() {
  const [grievances, setGrievances] = useState([])
  const [filter, setFilter] = useState('all') // all, Open, Responded, Resolved
  const [responseText, setResponseText] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllGrievances()
  }, [])

  const fetchAllGrievances = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${API}/api/admin/grievances`)
      setGrievances(res.data.grievances || [])
    } catch (err) {
      console.error('Failed to fetch grievances:', err)
      setGrievances([])
    }
    setLoading(false)
  }

  const handleRespond = async (grievanceId) => {
    const text = responseText[grievanceId]
    if (!text?.trim()) return

    try {
      const res = await axios.post(`${API}/api/admin/grievances/${grievanceId}/respond`, { response: text.trim() })
      if (res.data.success) {
        setGrievances(prev => prev.map(g =>
          g.id === grievanceId ? { ...g, ...res.data.grievance } : g
        ))
      }
    } catch (err) {
      // Fallback: update locally
      setGrievances(prev => prev.map(g =>
        g.id === grievanceId ? { ...g, status: 'Responded', response: text.trim(), respondedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) } : g
      ))
    }
    setResponseText(prev => ({ ...prev, [grievanceId]: '' }))
  }

  const handleResolve = async (grievanceId) => {
    try {
      const res = await axios.post(`${API}/api/admin/grievances/${grievanceId}/resolve`)
      if (res.data.success) {
        setGrievances(prev => prev.map(g =>
          g.id === grievanceId ? { ...g, ...res.data.grievance } : g
        ))
      }
    } catch (err) {
      setGrievances(prev => prev.map(g =>
        g.id === grievanceId ? { ...g, status: 'Resolved' } : g
      ))
    }
  }

  const filtered = filter === 'all' ? grievances : grievances.filter(g => g.status === filter)

  const stats = {
    total: grievances.length,
    open: grievances.filter(g => g.status === 'Open').length,
    responded: grievances.filter(g => g.status === 'Responded').length,
    resolved: grievances.filter(g => g.status === 'Resolved').length,
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-navy font-serif">🏛 Admin Panel — MLA Office</h1>
          <p className="text-sm text-gray-500">Manage grievances and respond to constituents</p>
        </div>
        <button
          onClick={fetchAllGrievances}
          className="flex items-center gap-1.5 text-xs font-semibold text-navy bg-navy/5 hover:bg-navy/10 px-3 py-2 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className={`card p-4 text-center cursor-pointer hover:shadow-md transition-shadow ${filter === 'all' ? 'ring-2 ring-navy' : ''}`} onClick={() => setFilter('all')}>
          <div className="text-xl font-bold text-navy">{stats.total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className={`card p-4 text-center cursor-pointer hover:shadow-md transition-shadow ${filter === 'Open' ? 'ring-2 ring-saffron' : ''}`} onClick={() => setFilter('Open')}>
          <div className="text-xl font-bold text-saffron">{stats.open}</div>
          <div className="text-xs text-gray-500">Open</div>
        </div>
        <div className={`card p-4 text-center cursor-pointer hover:shadow-md transition-shadow ${filter === 'Responded' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setFilter('Responded')}>
          <div className="text-xl font-bold text-blue-600">{stats.responded}</div>
          <div className="text-xs text-gray-500">Responded</div>
        </div>
        <div className={`card p-4 text-center cursor-pointer hover:shadow-md transition-shadow ${filter === 'Resolved' ? 'ring-2 ring-tvk-green' : ''}`} onClick={() => setFilter('Resolved')}>
          <div className="text-xl font-bold text-tvk-green">{stats.resolved}</div>
          <div className="text-xs text-gray-500">Resolved</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        {['all', 'Open', 'Responded', 'Resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors ${
              filter === f ? 'bg-navy text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Grievance Cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading grievances...</div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">No grievances matching filter.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(g => (
            <div key={g.id} className={`card p-5 ${g.status === 'Open' ? 'border-l-4 border-l-saffron' : g.status === 'Responded' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-tvk-green'}`}>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-blue-600 font-mono">#{g.id}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    g.status === 'Open' ? 'bg-orange-100 text-orange-700' :
                    g.status === 'Responded' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>{g.status}</span>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />{g.submittedAt}
                </span>
              </div>

              {/* User Info with Phone */}
              <div className="flex items-center gap-4 mb-3 bg-gray-50 rounded-lg px-3 py-2">
                <div className="text-xs text-gray-600">
                  <span className="text-gray-400">From:</span> <strong className="text-navy">{g.userName || 'Anonymous'}</strong>
                </div>
                {g.userPhone && (
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-tvk-green" />
                    <a href={`tel:+91${g.userPhone}`} className="font-semibold text-tvk-green hover:underline">
                      +91 {g.userPhone}
                    </a>
                  </div>
                )}
              </div>

              {/* Issue */}
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{g.subCategory || g.category}</h3>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <MapPin className="w-3.5 h-3.5" />{g.location}
              </div>
              {g.message && (
                <p className="text-xs text-gray-600 italic bg-gray-50 rounded p-2 mb-3">"{g.message}"</p>
              )}

              {/* Grievance Image */}
              {g.image && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Attached Photo:
                  </div>
                  <a href={`${API}${g.image}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`${API}${g.image}`}
                      alt="Grievance"
                      className="w-full max-h-64 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </a>
                </div>
              )}

              {/* Response */}
              {g.response && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-tvk-green mb-1">
                    <MessageSquare className="w-3.5 h-3.5" /> Response Sent:
                  </div>
                  <p className="text-sm text-green-800">"{g.response}"</p>
                  <p className="text-xs text-green-600 mt-1">Responded: {g.respondedAt}</p>
                </div>
              )}

              {/* Action Buttons */}
              {g.status === 'Open' && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input-field text-xs flex-1"
                      placeholder="Type response to constituent..."
                      value={responseText[g.id] || ''}
                      onChange={(e) => setResponseText(prev => ({ ...prev, [g.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleRespond(g.id)}
                    />
                    <button
                      onClick={() => handleRespond(g.id)}
                      className="btn-primary text-xs py-2 px-3 flex items-center gap-1"
                      disabled={!responseText[g.id]?.trim()}
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </div>
                </div>
              )}

              {g.status === 'Responded' && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => handleResolve(g.id)}
                    className="text-xs font-semibold text-tvk-green hover:underline flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
