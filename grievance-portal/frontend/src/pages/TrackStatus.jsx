import { useState } from 'react'
import { Search, MapPin, Clock, MessageSquare, AlertCircle, Phone, Hash } from 'lucide-react'
import { useLang } from '../i18n'
import axios from 'axios'

export default function TrackStatus() {
  const { t } = useLang()
  const [mode, setMode] = useState('id') // 'id' or 'phone'
  const [trackId, setTrackId] = useState('')
  const [trackPhone, setTrackPhone] = useState('')
  const [result, setResult] = useState(null) // single grievance
  const [results, setResults] = useState([]) // multiple grievances (phone search)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setResult(null)
    setResults([])
  }

  const handleTrack = async (e) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setResults([])
    setLoading(true)

    if (mode === 'id') {
      const cleanId = trackId.trim().toUpperCase().replace('#', '')
      if (!cleanId) { setError('Please enter a Grievance ID'); setLoading(false); return }
      try {
        const res = await axios.get(`/api/grievances/track/${cleanId}`)
        if (res.data.grievance) {
          setResult(res.data.grievance)
        } else {
          setError(`No grievance found with ID "${cleanId}".`)
        }
      } catch {
        setError(`No grievance found with ID "${cleanId}". Please check and try again.`)
      }
    } else {
      const cleanPhone = trackPhone.replace(/[^0-9]/g, '')
      if (cleanPhone.length < 10) { setError('Enter a valid 10-digit mobile number'); setLoading(false); return }
      try {
        const res = await axios.get(`/api/grievances/by-phone/${cleanPhone}`)
        if (res.data.grievances && res.data.grievances.length > 0) {
          setResults(res.data.grievances)
        } else {
          setError(`No grievances found for +91 ${cleanPhone}.`)
        }
      } catch {
        setError(`No grievances found for this number. Please check and try again.`)
      }
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
        return <span className="text-xs font-semibold text-gray-500">{status}</span>
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

  const GrievanceCard = ({ g }) => (
    <div className={`border rounded-lg p-5 ${g.status === 'Responded' || g.status === 'Resolved' ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-tvk-blue tracking-wide">#{g.id}</span>
        {getStatusBadge(g.status)}
      </div>

      <div className="mb-2">
        <span className="inline-block bg-navy-light text-navy text-xs font-bold px-2 py-0.5 rounded">
          {g.category}
        </span>
      </div>

      <h3 className="font-semibold text-sm text-gray-800 mb-1">{g.sub || g.subCategory}</h3>

      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
        <MapPin className="w-3.5 h-3.5" />
        {g.location}
      </div>

      {g.message && (
        <p className="text-xs text-gray-600 italic bg-white rounded p-2 mb-3 border border-gray-100">
          "{g.message}"
        </p>
      )}

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

      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {g.submittedAt}
        </span>
        <span className={`font-semibold ${g.status === 'Responded' || g.status === 'Resolved' ? 'text-tvk-green' : 'text-saffron'}`}>
          {g.status === 'Responded' || g.status === 'Resolved' ? '✓ Action Taken' : '⏳ Awaiting'}
        </span>
      </div>

      <div className="mt-3">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${g.status === 'Responded' || g.status === 'Resolved' ? 'bg-tvk-green' : 'bg-saffron'}`} style={{ width: getProgressWidth(g.status) }}></div>
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
          <span>Received</span><span>Review</span><span>Action</span><span>Resolved</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto px-4 py-8 md:py-12">
      <div className="card p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-navy/10 flex items-center justify-center mx-auto mb-3">
            <Search className="w-7 h-7 text-navy" />
          </div>
          <h2 className="text-lg font-bold text-navy font-serif">{t('trackTitle')}</h2>
          <p className="text-xs text-gray-500 mt-1">{t('searchBy')}</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-5">
          <button
            type="button"
            onClick={() => switchMode('id')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
              mode === 'id' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Hash className="w-3.5 h-3.5" /> {t('referenceId')}
          </button>
          <button
            type="button"
            onClick={() => switchMode('phone')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
              mode === 'phone' ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Phone className="w-3.5 h-3.5" /> {t('mobileNumber')}
          </button>
        </div>

        <form onSubmit={handleTrack}>
          {mode === 'id' ? (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t('grievanceRefId')}</label>
              <input
                type="text"
                className="input-field text-center font-mono uppercase tracking-wider"
                placeholder="MYL-2026-XXXXX"
                value={trackId}
                onChange={(e) => setTrackId(e.target.value.toUpperCase())}
                autoFocus
              />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">{t('mobileNumber')}</label>
              <div className="flex">
                <span className="bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg px-3 py-3 text-sm text-gray-600 font-medium">+91</span>
                <input
                  type="tel"
                  className="input-field rounded-l-none"
                  placeholder="9876543210"
                  value={trackPhone}
                  onChange={(e) => setTrackPhone(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={10}
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">{t('showsAll')}</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs mb-4 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || (mode === 'id' ? !trackId.trim() : trackPhone.replace(/[^0-9]/g, '').length < 10)}
          >
            {loading ? t('searching') : t('trackStatusBtn')}
          </button>
        </form>

        {/* Single Result (ID search) */}
        {result && (
          <div className="mt-6">
            <GrievanceCard g={result} />
          </div>
        )}

        {/* Multiple Results (Phone search) */}
        {results.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-gray-500 mb-3">
              {t('found')} <span className="text-navy">{results.length}</span> {results.length > 1 ? t('grievances') : t('grievance')} {t('forNumber')} +91 {trackPhone}
            </p>
            <div className="space-y-4">
              {results.map((g) => (
                <GrievanceCard key={g.id} g={g} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
