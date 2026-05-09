import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLang } from '../i18n'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { lang, setLang, t } = useLang()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* National Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isHome && (
            <button
              onClick={() => navigate('/')}
              className="w-9 h-9 rounded-lg bg-navy/5 hover:bg-navy/10 flex items-center justify-center transition-colors flex-shrink-0"
              title={t('backToHome')}
            >
              <ArrowLeft className="w-4 h-4 text-navy" />
            </button>
          )}
          <img
            src="/tn-govt-logo.jpeg"
            alt={t('govTitle')}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer border border-gray-200"
            onClick={() => navigate('/')}
          />
          <div>
            <h1 className="text-sm font-bold text-navy font-serif">{t('govTitle')}</h1>
            <p className="text-xs text-gray-500">{t('govSub')}</p>
          </div>
        </div>
        <div className="hidden md:block text-right text-xs text-gray-500">
          <div className="font-semibold text-navy">{new Date().toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-IN', { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div>{lang === 'ta' ? 'தொகுதி எண் 10 | சென்னை மாவட்டம்' : 'Constituency No. 10 | Chennai District'}</div>
        </div>
      </header>

      {/* Tricolor */}
      <div className="tricolor"></div>

      {/* Portal Header */}
      <div className="bg-navy-dark text-white">
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b-[3px] border-saffron">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/30 bg-[#1a1a2e]">
            <img
              src="/tvk-logo.jpg"
              alt="TVK"
              className="w-full h-full object-cover scale-[1.15]"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-sm md:text-base font-bold font-serif">{t('portalTitle')}</h2>
            <p className="text-xs text-blue-300">{t('portalSub')}</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setLang('en')}
              className={`text-xs px-2 py-1 border border-white/30 rounded transition-all ${lang === 'en' ? 'bg-saffron text-white' : 'text-white/70 hover:text-white'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('ta')}
              className={`text-xs px-2 py-1 border border-white/30 rounded transition-all ${lang === 'ta' ? 'bg-saffron text-white' : 'text-white/70 hover:text-white'}`}
            >
              தமிழ்
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center px-4 md:px-6 py-2 bg-navy text-xs">
          <div>
            <span className="text-blue-300">{t('constituency')} </span>
            <span className="text-white font-semibold">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 animate-pulse-dot"></span>
              {t('liveSupport')}
            </span>
          </div>
          <div className="hidden md:block text-center">
            <span className="text-blue-300">{t('helpline')}: </span>
            <span className="text-white font-semibold">1800-XXX-XXXX</span>
          </div>
          <div className="text-right">
            <span className="text-blue-300">{t('ref')}: </span>
            <span className="text-white font-semibold">#MYL-2026-XXXXX</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-navy-dark text-blue-300 text-center py-3 text-xs mt-auto">
        {t('footer')}
      </footer>
    </div>
  )
}
