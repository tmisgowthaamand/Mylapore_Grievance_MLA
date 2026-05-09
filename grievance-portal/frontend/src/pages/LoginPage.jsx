import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowRight, Loader2, ShieldCheck, CreditCard, UserPlus } from 'lucide-react'
import axios from 'axios'

export default function LoginPage() {
  const [epic, setEpic] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!epic || epic.trim() === '') {
      return setError('Please enter your EPIC number')
    }

    const epicRegex = /^[A-Z]{3}[0-9]{7}$/
    if (!epicRegex.test(epic.trim().toUpperCase())) {
      return setError('Invalid EPIC format. Use 3 letters and 7 numbers (e.g., TNA1234567)')
    }
    
    setIsLoading(true)
    setError('')
    try {
      const res = await axios.post('/api/auth/login-epic', { epic: epic.trim().toUpperCase() })
      if (res.data.success) {
        localStorage.setItem('tvk_user', JSON.stringify(res.data.user))
        // Dispatch event for App.jsx if needed
        window.dispatchEvent(new Event('storage'))
        navigate('/grievance')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log in. Are you registered?')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-navy/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-saffron/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 ring-1 ring-black/5">
        <div className="bg-navy p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron via-red-500 to-green-600" />
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md border border-white/20 mb-4">
            <span className="text-2xl font-black text-white tracking-tighter">TVK</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
          <p className="text-white/70 text-sm">Log in directly with your EPIC Number</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in zoom-in-95">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">EPIC Number (Voter ID)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={epic}
                  onChange={(e) => setEpic(e.target.value.toUpperCase().replace(/\s/g, '').slice(0, 10))}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-navy font-bold tracking-wide uppercase focus:ring-2 focus:ring-navy focus:border-navy transition-all"
                  placeholder="E.g., TNA1234567"
                  required
                  maxLength={10}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || epic.length < 5}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-navy hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Log In <ArrowRight className="ml-2 w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Not registered yet?{' '}
              <Link to="/register" className="font-bold text-saffron hover:text-orange-600 flex items-center justify-center gap-1 mt-1">
                <UserPlus className="w-4 h-4" /> Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
