import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Phone, User, Shield, Lock, MapPin, ArrowRight, Loader2, UserCheck, CreditCard } from 'lucide-react'
import axios from 'axios'

export default function RegisterPage() {
  const location = useLocation()
  const [formData, setFormData] = useState({
    name: '',
    phone: location.state?.phone || '',
    epic: '',
    area: 'Mylapore'
  })
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) // 1: Details, 2: OTP
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // If they came from login, step 1 is done (phone checked).
    // Actually, check-phone in login only redirects here if they are new.
    // So they still need to fill name and epic.
  }, [])

  const handleRequestOTP = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || formData.phone.length < 10) {
      return setError('Name and 10-digit phone number required')
    }
    setIsLoading(true)
    setError('')
    try {
      // Send OTP
      await axios.post('/api/auth/send-otp', { phone: formData.phone })
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (otp.length < 4) return setError('Enter valid OTP')
    setIsLoading(true)
    setError('')
    try {
      // 1. Verify OTP
      const verifyRes = await axios.post('/api/auth/verify-otp', { phone: formData.phone, otp })
      
      if (!verifyRes.data.success) {
        throw new Error('Invalid OTP')
      }

      // 2. Complete Registration
      const regRes = await axios.post('/api/auth/complete-register', formData)
      
      if (regRes.data.success) {
        localStorage.setItem('tvk_user', JSON.stringify(regRes.data.user))
        navigate('/grievance')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-600/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-navy/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 ring-1 ring-black/5">
        <div className="bg-gradient-to-br from-navy to-slate-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-saffron to-red-500" />
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-md border border-white/20 mb-4">
            <UserCheck className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-white/70 text-sm">Join the TVK Mylapore Community</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
              <Shield className="w-4 h-4" /> {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-4 animate-in fade-in zoom-in-95">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-navy font-semibold focus:ring-2 focus:ring-navy focus:border-navy transition-all"
                    placeholder="E.g. Gowtham"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-navy font-semibold focus:ring-2 focus:ring-navy focus:border-navy transition-all"
                    placeholder="Enter 10-digit number"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Voter ID / EPIC Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.epic}
                    onChange={(e) => setFormData({ ...formData, epic: e.target.value.toUpperCase() })}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-navy font-semibold focus:ring-2 focus:ring-navy focus:border-navy transition-all uppercase tracking-wide"
                    placeholder="E.g. TNA1234567"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || formData.phone.length < 10 || !formData.name || !formData.epic}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-navy hover:bg-slate-800 mt-6 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="ml-2 w-4 h-4" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5 animate-in fade-in slide-in-from-right-4">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500">OTP sent to <span className="font-bold text-navy">+91 {formData.phone}</span></p>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-navy font-bold hover:underline mt-1">Edit Details</button>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Enter OTP</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-navy font-semibold tracking-widest text-center focus:ring-2 focus:ring-navy focus:border-navy transition-all"
                    placeholder="••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.length < 4}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-saffron hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-saffron disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Create Account'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-navy hover:text-slate-700 mt-1 inline-block">
                Log In Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
