import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext } from 'react'
import { LangProvider } from './i18n'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GrievanceHome from './pages/GrievanceHome'
import MyGrievances from './pages/MyGrievances'
import TrackStatus from './pages/TrackStatus'
import AdminPanel from './pages/AdminPanel'
import VoterSearch from './pages/VoterSearch'

export const AuthContext = createContext(null)

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tvk_user');
    return saved ? JSON.parse(saved) : null;
  })
  const [grievances, setGrievances] = useState([])

  return (
    <LangProvider>
      <AuthContext.Provider value={{ user, setUser, grievances, setGrievances }}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/grievance" element={<GrievanceHome />} />
            <Route path="/my-grievances" element={<MyGrievances />} />
            <Route path="/track" element={<TrackStatus />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/voters" element={<VoterSearch />} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </LangProvider>
  )
}

export default App
