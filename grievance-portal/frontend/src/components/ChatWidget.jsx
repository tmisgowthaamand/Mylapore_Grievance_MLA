import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, ChevronRight, ChevronLeft, User, CheckCircle2, AlertCircle, FileText } from 'lucide-react'
import axios from 'axios'

import { SERVICES } from '../utils/servicesData'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: 'Vanakkam 🙏 Welcome to TVK Public Grievance Portal.', sender: 'bot' },
    { id: 2, text: 'Register to file a grievance or browse services below.', sender: 'bot' }
  ])
  // Flow: idle → registration → services → options → grievance_form → submitted
  const [flowState, setFlowState] = useState('idle')
  const [currentScreen, setCurrentScreen] = useState('REG_START')
  const [screenData, setScreenData] = useState({})
  const [formData, setFormData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [grievanceText, setGrievanceText] = useState('')
  const [grievanceLocation, setGrievanceLocation] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen, flowState, currentScreen, selectedService])

  // ─── Registration Handlers ───
  const startRegistration = async () => {
    setIsLoading(true)
    try {
      const res = await axios.post('/api/flow/exchange', { action: 'INIT' })
      setCurrentScreen(res.data.screen)
      setScreenData(res.data.data)
      setFlowState('registration')
      setMessages(prev => [...prev, { id: Date.now(), text: 'Starting registration...', sender: 'user' }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), text: '⚠️ Failed to connect to server.', sender: 'bot' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleFlowAction = async (actionName, payload) => {
    setIsLoading(true)
    try {
      const res = await axios.post('/api/flow/exchange', {
        action: 'data_exchange',
        screen: currentScreen,
        data: screenData,
        payload: { ...payload, action: actionName }
      })
      setCurrentScreen(res.data.screen)
      setScreenData(res.data.data)
      if (actionName === 'lookup_epic') {
        setMessages(prev => [...prev, { id: Date.now(), text: `Checking EPIC: ${payload.epic_no}...`, sender: 'user' }])
      } else if (actionName === 'save_epic' || actionName === 'save_manual') {
        setMessages(prev => [...prev, { id: Date.now(), text: 'Confirming registration...', sender: 'user' }])
      }
    } catch {
      setScreenData(prev => ({ ...prev, has_error: true, error_text: 'Connection error' }))
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Service Selection ───
  const goToServices = () => {
    setFlowState('services')
    setSelectedService(null)
    setSelectedOption(null)
    setMessages(prev => [...prev, { id: Date.now(), text: 'Choose a grievance category:', sender: 'bot' }])
  }

  const selectService = (svc) => {
    setSelectedService(svc)
    setFlowState('options')
    setMessages(prev => [...prev, { id: Date.now(), text: svc.title, sender: 'user' }])
  }

  const selectOption = (opt) => {
    setSelectedOption(opt)
    setFlowState('grievance_form')
    setGrievanceText('')
    setGrievanceLocation('')
    setMessages(prev => [...prev, { id: Date.now(), text: opt.title, sender: 'user' }])
  }

  const submitGrievance = async () => {
    if (!grievanceText.trim()) return
    setIsLoading(true)
    try {
      await axios.post('/api/grievances', {
        category: selectedService.title,
        subCategory: selectedOption.title,
        message: grievanceText,
        location: grievanceLocation,
        userName: 'WhatsApp User',
        userPhone: '0000000000'
      })
      setFlowState('submitted')
      setMessages(prev => [...prev, { id: Date.now(), text: 'Grievance submitted!', sender: 'user' }])
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), text: '⚠️ Submission failed. Try again.', sender: 'bot' }])
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Screen Renderers ───
  const renderRegistration = () => {
    if (currentScreen === 'REG_START') {
      return (
        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-navy flex items-center gap-2">
            <User className="w-4 h-4" /> Voter Registration
          </h4>
          <p className="text-xs text-gray-500">Enter your Voter ID and Date of Birth.</p>
          {screenData.has_error && (
            <div className="p-2 bg-red-50 text-red-600 text-[10px] rounded-lg flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {screenData.error_text}
            </div>
          )}
          <input type="text" placeholder="EPIC Number (e.g. TNA123)" className="text-sm border-b border-gray-200 py-2 focus:border-navy outline-none"
            onChange={(e) => setFormData({ ...formData, epic_no: e.target.value })} />
          <input type="date" className="text-sm border-b border-gray-200 py-2 focus:border-navy outline-none"
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })} />
          <button disabled={isLoading} onClick={() => handleFlowAction('lookup_epic', formData)}
            className="bg-navy text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
            {isLoading ? 'Processing...' : 'Verify EPIC'} <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setCurrentScreen('REG_MANUAL')}
            className="text-[11px] text-gray-400 hover:text-navy transition-colors text-center">
            Don't have EPIC? Register Manually
          </button>
        </div>
      )
    }

    if (currentScreen === 'REG_CONFIRM') {
      return (
        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-green-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Record Found
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-400">Name:</span> <span className="font-semibold text-navy">{screenData.voter_name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">EPIC:</span> <span className="font-semibold">{screenData.epic_no}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Assembly:</span> <span className="font-semibold">{screenData.assembly}</span></div>
          </div>
          <button disabled={isLoading} onClick={() => handleFlowAction('save_epic', {})}
            className="bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold shadow-md flex items-center justify-center gap-2">
            {isLoading ? 'Saving...' : 'Confirm & Register'}
          </button>
        </div>
      )
    }

    if (currentScreen === 'REG_MANUAL') {
      return (
        <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-navy">Manual Registration</h4>
          <input type="text" placeholder="Full Name" className="text-sm border-b border-gray-200 py-2 focus:border-navy outline-none"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <input type="text" placeholder="Voter ID (EPIC Number)" className="text-sm border-b border-gray-200 py-2 focus:border-navy outline-none"
            onChange={(e) => setFormData({ ...formData, epic: e.target.value })} />
          <input type="email" placeholder="Email (optional)" className="text-sm border-b border-gray-200 py-2 focus:border-navy outline-none"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <select className="text-sm border-b border-gray-200 py-2 focus:border-navy outline-none bg-transparent"
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <button disabled={isLoading} onClick={() => handleFlowAction('save_manual', formData)}
            className="bg-saffron text-white py-2.5 rounded-xl text-sm font-semibold">
            {isLoading ? 'Registering...' : 'Register Now'}
          </button>
        </div>
      )
    }

    if (currentScreen === 'REG_DONE') {
      return (
        <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-green-800">{screenData.info_title || '🙏 Registered'}</h4>
          <p className="text-[11px] text-green-700 mt-1">{screenData.info_body}</p>
          <button onClick={goToServices}
            className="mt-4 bg-navy text-white py-2.5 px-6 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors">
            Browse Services →
          </button>
        </div>
      )
    }
  }

  const renderServices = () => (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold text-center mb-1">Select a Category</div>
      {SERVICES.map((svc) => (
        <button key={svc.id} onClick={() => selectService(svc)}
          className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-navy/30 hover:bg-navy/[0.02] transition-all text-left group">
          <span className="text-xl flex-shrink-0">{svc.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-navy group-hover:text-navy">{svc.title}</div>
            <div className="text-[10px] text-gray-400 truncate">{svc.description}</div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-navy transition-colors flex-shrink-0" />
        </button>
      ))}
    </div>
  )

  const renderOptions = () => (
    <div className="flex flex-col gap-2">
      <button onClick={() => setFlowState('services')}
        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-navy transition-colors mb-1">
        <ChevronLeft className="w-3 h-3" /> Back to Categories
      </button>
      <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold text-center mb-1">
        {selectedService?.icon} {selectedService?.title}
      </div>
      {selectedService?.options.map((opt) => (
        <button key={opt.id} onClick={() => selectOption(opt)}
          className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-saffron/30 hover:bg-saffron/[0.02] transition-all text-left group">
          <div className="w-8 h-8 rounded-xl bg-saffron/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-saffron" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-navy">{opt.title}</div>
            <div className="text-[10px] text-gray-400 truncate">{opt.description}</div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-saffron transition-colors flex-shrink-0" />
        </button>
      ))}
    </div>
  )

  const renderGrievanceForm = () => (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <button onClick={() => setFlowState('options')}
        className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-navy transition-colors">
        <ChevronLeft className="w-3 h-3" /> Back
      </button>
      <h4 className="font-bold text-navy text-sm">{selectedOption?.title}</h4>
      <p className="text-[10px] text-gray-400">{selectedService?.title} → {selectedOption?.title}</p>
      <textarea placeholder="Describe your grievance in detail..."
        value={grievanceText} onChange={(e) => setGrievanceText(e.target.value)}
        className="text-sm border border-gray-200 rounded-xl p-3 h-24 resize-none focus:border-navy outline-none" />
      <input type="text" placeholder="Location (optional)" value={grievanceLocation}
        onChange={(e) => setGrievanceLocation(e.target.value)}
        className="text-sm border-b border-gray-200 py-2 focus:border-navy outline-none" />
      <button disabled={isLoading || !grievanceText.trim()} onClick={submitGrievance}
        className="bg-navy text-white py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
        {isLoading ? 'Submitting...' : 'Submit Grievance'} <Send className="w-4 h-4" />
      </button>
    </div>
  )

  const renderSubmitted = () => (
    <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <h4 className="font-bold text-green-800">Grievance Submitted!</h4>
      <p className="text-[10px] text-green-700 mt-1">Your grievance has been recorded. You will receive updates on WhatsApp.</p>
      <div className="flex gap-2 mt-4 justify-center">
        <button onClick={goToServices}
          className="bg-navy text-white py-2 px-4 rounded-xl text-[11px] font-bold">
          File Another
        </button>
        <button onClick={() => { setFlowState('idle'); setMessages([{ id: Date.now(), text: 'How else can I help?', sender: 'bot' }]) }}
          className="border border-gray-200 text-gray-500 py-2 px-4 rounded-xl text-[11px] font-medium">
          Close
        </button>
      </div>
    </div>
  )

  const renderCurrentFlow = () => {
    switch (flowState) {
      case 'registration': return renderRegistration()
      case 'services': return renderServices()
      case 'options': return renderOptions()
      case 'grievance_form': return renderGrievanceForm()
      case 'submitted': return renderSubmitted()
      default: return null
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl w-[340px] mb-4 border border-gray-100 overflow-hidden flex flex-col transition-all h-[520px] ring-1 ring-black/5">
          {/* Header */}
          <div className="bg-navy p-5 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <span className="text-xs font-black tracking-tighter">TVK</span>
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">TVK Helper Bot</h3>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] text-white/60">Live Support Active</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="p-4 bg-gray-50/50 flex-1 overflow-y-auto flex flex-col gap-4 scrollbar-hide">
            <div className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-semibold py-2">Today</div>
            
            {messages.map((msg) => (
              <div key={msg.id} className={`${msg.sender === 'bot' ? 'self-start' : 'self-end'} max-w-[85%]`}>
                <div className={`p-3 rounded-2xl text-sm shadow-sm border ${
                  msg.sender === 'bot' 
                  ? 'bg-white border-gray-100 rounded-tl-sm text-gray-700' 
                  : 'bg-navy border-navy rounded-tr-sm text-white'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {flowState === 'idle' && (
              <div className="flex flex-col gap-2">
                <button onClick={goToServices}
                  className="w-full py-3 bg-white border border-gray-200 text-navy rounded-2xl text-xs font-bold shadow-sm hover:border-saffron hover:bg-saffron/5 transition-all flex items-center justify-center gap-2 group">
                  <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" /> Browse Services
                </button>
              </div>
            )}

            {renderCurrentFlow()}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Footer */}
          <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-3 shrink-0">
            <input type="text" placeholder="Select an option above..." 
              className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-xs outline-none text-gray-400" disabled />
            <button className="w-11 h-11 rounded-2xl bg-navy/10 text-navy flex items-center justify-center transition-all cursor-not-allowed opacity-50">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all float-right ${
          isOpen ? 'bg-white text-navy border border-gray-100' : 'bg-navy text-white'
        }`}>
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
      </button>
    </div>
  )
}
