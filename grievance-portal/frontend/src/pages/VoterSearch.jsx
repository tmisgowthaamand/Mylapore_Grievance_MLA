import { useState, useEffect } from 'react'
import { Search, Users, User, CreditCard, Home, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLang } from '../i18n'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function VoterSearch() {
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('name') // name, epic, house
  const [results, setResults] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    axios.get(`${API}/api/voters/stats`).then(r => setStats(r.data)).catch(() => {})
  }, [])

  const handleSearch = async (e, newPage = 1) => {
    if (e) e.preventDefault()
    if (!query.trim() || query.trim().length < 2) return
    setLoading(true)
    setError('')
    try {
      const res = await axios.get(`${API}/api/voters/search`, {
        params: { q: query.trim(), type, page: newPage, limit: 20 }
      })
      setResults(res.data.voters || [])
      setTotal(res.data.total || 0)
      setPage(res.data.page || 1)
      setPages(res.data.pages || 0)
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed')
      setResults([])
    }
    setLoading(false)
  }

  const goPage = (p) => {
    if (p < 1 || p > pages) return
    handleSearch(null, p)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-navy font-serif">🗳 Mylapore Voter Search</h1>
        <p className="text-sm text-gray-500">Assembly Constituency No. 25 — Electoral Roll</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4 text-center">
            <div className="text-xl font-bold text-navy">{stats.total?.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Total Voters</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xl font-bold text-blue-600">{stats.male?.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Male</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-xl font-bold text-pink-600">{stats.female?.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Female</div>
          </div>
        </div>
      )}

      {/* Search Form */}
      <div className="card p-5 mb-6">
        {/* Search Type Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-4">
          {[
            { key: 'name', label: 'Name', Icon: User },
            { key: 'epic', label: 'EPIC No.', Icon: CreditCard },
            { key: 'house', label: 'House No.', Icon: Home },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => { setType(key); setResults([]); setError('') }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all ${
                type === key ? 'bg-white text-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <input
              type="text"
              className="input-field flex-1"
              placeholder={
                type === 'name' ? 'Enter voter name...' :
                type === 'epic' ? 'Enter EPIC / Voter ID (e.g. RJE0667071)' :
                'Enter house number...'
              }
              value={query}
              onChange={(e) => setQuery(type === 'epic' ? e.target.value.toUpperCase() : e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="btn-primary px-4 flex items-center gap-1.5"
              disabled={loading || query.trim().length < 2}
            >
              <Search className="w-4 h-4" /> {loading ? '...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-red-600 text-xs mt-3 bg-red-50 p-3 rounded-lg">{error}</div>
        )}
      </div>

      {/* Results */}
      {total > 0 && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500">
            Found <span className="text-navy">{total.toLocaleString()}</span> voter{total !== 1 ? 's' : ''}
            {pages > 1 && <span> — Page {page} of {pages}</span>}
          </p>
        </div>
      )}

      {results.length > 0 && (
        <>
          {/* Table for desktop */}
          <div className="hidden md:block card overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold">#</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Name</th>
                  <th className="px-3 py-2.5 text-left font-semibold">EPIC No.</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Gender</th>
                  <th className="px-3 py-2.5 text-left font-semibold">House No.</th>
                  <th className="px-3 py-2.5 text-left font-semibold">Relation</th>
                </tr>
              </thead>
              <tbody>
                {results.map((v, i) => (
                  <tr key={v._id} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-blue-50/50 transition-colors`}>
                    <td className="px-3 py-2.5 text-gray-400">{v.ID}</td>
                    <td className="px-3 py-2.5 font-semibold text-navy">{v.VOTER_NAME}</td>
                    <td className="px-3 py-2.5 font-mono text-blue-600">{v.EPIC_NO}</td>
                    <td className="px-3 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        v.GENDER === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>{v.GENDER}</span>
                    </td>
                    <td className="px-3 py-2.5">{v.HOUSE_NO}</td>
                    <td className="px-3 py-2.5 text-gray-500">{v.RELATION_TYPE}: {v.RELATION_NAME}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards for mobile */}
          <div className="md:hidden space-y-3">
            {results.map(v => (
              <div key={v._id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-navy">{v.VOTER_NAME}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    v.GENDER === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                  }`}>{v.GENDER}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <span className="text-gray-400">EPIC</span>
                  <span className="font-mono text-blue-600 font-semibold">{v.EPIC_NO}</span>
                  <span className="text-gray-400">House No.</span>
                  <span>{v.HOUSE_NO}</span>
                  <span className="text-gray-400">{v.RELATION_TYPE}</span>
                  <span>{v.RELATION_NAME}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => goPage(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                let p
                if (pages <= 5) p = i + 1
                else if (page <= 3) p = i + 1
                else if (page >= pages - 2) p = pages - 4 + i
                else p = page - 2 + i
                return (
                  <button
                    key={p}
                    onClick={() => goPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      p === page ? 'bg-navy text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => goPage(page + 1)}
                disabled={page >= pages}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
