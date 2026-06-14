import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Calendar, LogOut, Globe, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import LearnerDashboard from './pages/LearnerDashboard';
import TutorDashboard from './pages/TutorDashboard';
import SupporterDashboard from './pages/SupporterDashboard';
import { useLearnerStore } from './store/learnerStore';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// --- Login Simulator ---
const LoginSimulator = () => {
  const login = useAuthStore(state => state.login);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bright text-on-surface p-4 transition-colors duration-300">
      <div className="bg-surface/80 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] max-w-5xl w-full border border-outline-variant/30">
        <div className="flex justify-center mb-8">
           <div className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center text-on-primary-container font-headline-lg font-bold text-5xl shadow-sm">L</div>
        </div>
        <h1 className="text-3xl font-headline-md font-bold text-center mb-3 text-primary">{t('login.title')}</h1>
        <p className="text-base text-on-surface-variant text-center mb-10">{t('login.subtitle')}</p>
        
        <div className="flex flex-col gap-4">
          <button onClick={() => login('learner')} className="py-4 rounded-2xl font-label-sm text-base font-bold bg-primary text-on-primary shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
             {t('login.learner_btn')}
          </button>
          <button onClick={() => login('tutor')} className="py-4 rounded-2xl font-label-sm text-base font-bold bg-secondary text-on-secondary shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
             {t('login.tutor_btn')}
          </button>
          <button onClick={() => login('supporter')} className="py-4 rounded-2xl font-label-sm text-base font-bold bg-tertiary text-on-tertiary shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
             {t('login.supporter_btn')}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Theme Initializer ---
const ThemeInitializer = () => {
  const { customColors } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', customColors.primary);
    root.style.setProperty('--color-secondary', customColors.secondary);
    root.style.setProperty('--color-accent', customColors.accent);
    root.style.setProperty('--color-background', customColors.background);
    root.style.setProperty('--color-text', customColors.text);
  }, [customColors]);

  return null;
}

// --- Protected Route Wrapper ---
const ProtectedRoute = ({ role, children }: { role: 'learner' | 'tutor' | 'supporter', children: React.ReactNode }) => {
  const userRole = useAuthStore(state => state.role);
  
  if (!userRole) {
    return <Navigate to="/" replace />;
  }
  
  if (userRole !== role) {
    return <Navigate to={`/${userRole}`} replace />;
  }

  return <>{children}</>;
};

// --- Main App Layout ---
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { t, i18n } = useTranslation();
  const streak = useLearnerStore(state => state.streak);
  const { role, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'vi' : 'en');
  };

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('pastel');
    else setTheme('light');
  };

  return (
    <div className="min-h-screen bg-canvas font-sans text-on-surface transition-colors duration-300">
      <header className="bg-canvas dark:bg-charcoal docked full-width top-0 z-40 fixed w-full">
        <div className="flex justify-between items-center w-full px-md py-sm max-w-max-content-width mx-auto">
          <Link to={`/${role || ''}`} className="flex items-center gap-2">
            <h1 className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
              LinguaCare
            </h1>
          </Link>
          
          <div className="flex items-center gap-md">
            {role === 'learner' && (
              <div className="hidden sm:flex items-center gap-2 text-sm font-label-sm text-primary bg-primary-container/20 px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
                {streak > 0 ? t('common.streak', { count: streak }) : t('common.streak_zero')}
              </div>
            )}
            
            <button onClick={toggleLanguage} className="material-symbols-outlined text-primary dark:text-primary-fixed hover:bg-surface-container-low transition-colors p-2 rounded-full cursor-pointer" title={t('common.language')}>
              language
            </button>
            <button onClick={cycleTheme} className="material-symbols-outlined text-primary dark:text-primary-fixed hover:bg-surface-container-low transition-colors p-2 rounded-full cursor-pointer" title={t('common.theme') + ` (${theme})`}>
              palette
            </button>
            <button onClick={logout} className="material-symbols-outlined text-error hover:bg-error-container/20 transition-colors p-2 rounded-full cursor-pointer" title={t('common.logout')}>
              logout
            </button>

            <button className="material-symbols-outlined text-primary dark:text-primary-fixed hover:bg-surface-container-low transition-colors p-2 rounded-full cursor-pointer">
              account_circle
            </button>
          </div>
        </div>
      </header>

      <main className="content-canvas pt-24 pb-32 max-w-max-content-width mx-auto">
        {children}
      </main>

      {role === 'learner' && (
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-sm py-xs pb-safe bg-surface dark:bg-inverse-surface border-t border-whisper shadow-[0_-4px_20px_-2px_rgba(28,15,23,0.03)] rounded-t-xl">
          <Link to="/learner" className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-high transition-all active:translate-y-[1px]">
            <span className="material-symbols-outlined">menu_book</span>
            <span className="font-label-sm text-xs">Journal</span>
          </Link>
          <button className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-high transition-all active:translate-y-[1px]">
            <span className="material-symbols-outlined">fitness_center</span>
            <span className="font-label-sm text-xs">Practice</span>
          </button>
          <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-md py-xs transition-all active:translate-y-[1px]">
            <span className="material-symbols-outlined">auto_awesome</span>
            <span className="font-label-sm text-xs">Lumi</span>
          </button>
          <button className="flex flex-col items-center justify-center text-on-surface-variant p-2 hover:bg-surface-container-high transition-all active:translate-y-[1px]">
            <span className="material-symbols-outlined">trending_up</span>
            <span className="font-label-sm text-xs">Growth</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default function App() {
  const role = useAuthStore(state => state.role);

  return (
    <BrowserRouter>
      <ThemeInitializer />
      
      {!role ? (
        <Routes>
          <Route path="*" element={<LoginSimulator />} />
        </Routes>
      ) : (
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to={`/${role}`} replace />} />
            <Route path="/learner" element={<ProtectedRoute role="learner"><LearnerDashboard /></ProtectedRoute>} />
            <Route path="/tutor" element={<ProtectedRoute role="tutor"><TutorDashboard /></ProtectedRoute>} />
            <Route path="/supporter" element={<ProtectedRoute role="supporter"><SupporterDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={`/${role}`} replace />} />
          </Routes>
        </AppLayout>
      )}
    </BrowserRouter>
  );
}
