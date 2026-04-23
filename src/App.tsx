import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, ShieldCheck, GraduationCap } from 'lucide-react';
import './i18n';
import LanguageSwitcher from './components/LanguageSwitcher';
import NewPatientTab from './components/NewPatientTab';
import VentilatedPatientTab from './components/VentilatedPatientTab';
import SBTGuideTab from './components/SBTGuideTab';
import SBTSimulatorModal from './components/SBTSimulatorModal';
import { cn } from './lib/utils';

type Tab = 'new' | 'ventilated' | 'sbt';

export default function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('new');
  const [isSBTModalOpen, setIsSBTModalOpen] = useState(false);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'new', label: t('tabs.newPatient'), icon: <Activity size={18} /> },
    { id: 'ventilated', label: t('tabs.ventilatedPatient'), icon: <ShieldCheck size={18} /> },
    { id: 'sbt', label: t('tabs.sbtGuide'), icon: <GraduationCap size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-header border-b border-slate-100/50">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-8 h-20 sm:h-24 md:h-32 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="bg-secondary/10 p-4 rounded-2xl text-secondary shadow-inner">
              <Activity className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-primary tracking-tight leading-none mb-1">
                Ventilator<span className="text-secondary">Pro</span>
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.1em] sm:tracking-[0.15em] font-bold text-slate-400">
                {t('app.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-8 py-6 md:py-12">
        {/* Hero Section / Welcome */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="bg-gradient-to-br from-primary to-slate-800 rounded-2xl md:rounded-[2rem] p-5 md:p-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Activity size={200} />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-2xl md:text-4xl font-extrabold mb-3 text-balance leading-tight">
                {t('app.title')}
              </h2>
              <p className="text-base text-white/80 font-medium mb-6 leading-relaxed">
                {t('app.subtitle')}
              </p>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex gap-4 items-start">
                <AlertTriangle className="text-amber-400 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-white mb-1">{t('disclaimer.title')}</h4>
                  <p className="text-sm text-white/70" dangerouslySetInnerHTML={{ __html: t('disclaimer.text') }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Segmented Control style) */}
        <div className="bg-slate-200/50 p-1.5 rounded-2xl flex gap-1 mb-8 max-w-2xl mx-auto md:mx-0 overflow-x-auto whitespace-nowrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 cursor-pointer',
                activeTab === tab.id
                  ? 'bg-white text-secondary shadow-md shadow-slate-200 ring-1 ring-slate-100'
                  : 'text-muted hover:text-primary hover:bg-white/50'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="min-h-[600px]">
          {activeTab === 'new' && <NewPatientTab />}
          {activeTab === 'ventilated' && <VentilatedPatientTab onLaunchSimulator={() => setIsSBTModalOpen(true)} />}
          {activeTab === 'sbt' && <SBTGuideTab onLaunchSimulator={() => setIsSBTModalOpen(true)} />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-4">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" />
              <span className="font-bold text-primary text-lg">VentilatorPro</span>
            </div>
            <p className="text-muted max-w-md leading-relaxed" dangerouslySetInnerHTML={{ __html: t('disclaimer.footerText') }} />
          </div>
          <div className="flex flex-col md:items-end justify-end space-y-4">
            <div className="flex gap-6 font-bold text-primary">
              <span>Dr. Feridun Karadağ</span>
            </div>
            <p className="text-slate-400">
              {t('app.copyright')}<br />
              {t('app.sbtReference')}
            </p>
          </div>
        </div>
      </footer>

      <SBTSimulatorModal 
        isOpen={isSBTModalOpen} 
        onClose={() => setIsSBTModalOpen(false)} 
      />
    </div>
  );
}
