import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  X, Play, Pause, RotateCcw, CheckCircle2, AlertCircle, 
  ChevronRight, Info, Timer, Beaker, Users, BarChart3, Wind, Activity, Zap,
  ClipboardCheck
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/utils';

interface SBTSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SBTMethod = 'ttube' | 'ps' | 'cpap' | 'atc';

export default function SBTSimulatorModal({ isOpen, onClose }: SBTSimulatorModalProps) {
  const { t } = useTranslation();
  const [patientType, setPatientType] = useState<'adult' | 'pediatric'>('adult');
  const [selectedMethod, setSelectedMethod] = useState<SBTMethod | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    stable: false, fio2: false, peep: false, cough: false, 
    gag: false, conscious: false, secret: false, acidosis: false
  });
  
  const [params, setParams] = useState({
    age: '', weight: '', spo2Start: '97', respRate: '16'
  });

  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  const [result, setResult] = useState<{ success: boolean; score: number } | null>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleCheck = (key: string) => setChecklist(prev => ({ ...prev, [key]: !prev[key] }));

  const handleEvaluate = () => {
    const checkedCount = Object.values(checklist).filter(v => v).length;
    const isSuccess = checkedCount >= 7 && timer >= 1800; // 30 min min
    setResult({ success: isSuccess, score: checkedCount });
  };

  const resetSimulator = () => {
    setTimer(0);
    setIsTimerRunning(false);
    setSelectedMethod(null);
    setResult(null);
    setChecklist({
      stable: false, fio2: false, peep: false, cough: false, 
      gag: false, conscious: false, secret: false, acidosis: false
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-primary/40 backdrop-blur-sm z-[100] animate-fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-5xl h-[90vh] bg-white rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] z-[101] overflow-y-auto flex flex-col border border-white/20">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-slate-800 p-4 sm:p-6 text-white flex items-center justify-between relative overflow-hidden shrink-0">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Wind size={200} />
            </div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/20 hidden sm:block">
                <Activity className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <Dialog.Title className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                  {t('sbtSimulator.title')}
                </Dialog.Title>
                <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mt-1">
                  Spontaneous Breathing Trial Simulator V2.0
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              type="button"
              className="relative z-10 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 sm:p-8 space-y-8 sm:space-y-12">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              
              {/* Left Column: Selection & Params */}
              <div className="lg:col-span-7 space-y-12">
                
                {/* Method Selection */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Zap className="text-secondary" size={20} />
                    <h3 className="font-black text-primary uppercase tracking-tight text-sm">{t('sbtSimulator.methodSelectTitle')}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {(['ttube', 'ps', 'cpap', 'atc'] as SBTMethod[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedMethod(m)}
                        type="button"
                        className={cn(
                          "flex flex-col items-start p-4 sm:p-5 rounded-xl border-2 transition-all text-left group relative overflow-hidden h-full cursor-pointer",
                          selectedMethod === m 
                            ? "bg-secondary/5 border-secondary shadow-md shadow-secondary/5" 
                            : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className="flex justify-between items-center w-full mb-3">
                          <span className={cn(
                            "font-black text-xs px-3 py-1 rounded-full uppercase tracking-tighter",
                            m === 'ttube' ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"
                          )}>
                            {t(`sbtSimulator.difficultyLabels.${m === 'ttube' ? 'hard' : m === 'cpap' ? 'medium' : 'easy'}`)}
                          </span>
                          {selectedMethod === m && <CheckCircle2 className="text-secondary" size={18} />}
                        </div>
                        <h4 className="font-black text-primary text-sm mb-1">{t(`sbtGuide.methods.${m}.name`)}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none italic">{t(`sbtGuide.methods.${m}.shortDesc`).replace('\n', ' ')}</p>
                        
                        {selectedMethod === m && <div className="absolute bottom-0 right-0 p-1 text-secondary/10"><Wind size={60} /></div>}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Parameters */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="text-secondary" size={20} />
                    <h3 className="font-black text-primary uppercase tracking-tight text-sm">{t('sbtSimulator.paramsTitle')}</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <InputField label={t('sbtSimulator.age')} value={params.age} onChange={(v: string) => setParams(p => ({...p, age: v}))} />
                    <InputField label={t('sbtSimulator.weight')} value={params.weight} onChange={(v: string) => setParams(p => ({...p, weight: v}))} />
                    <InputField label={t('sbtSimulator.spo2Start')} value={params.spo2Start} onChange={(v: string) => setParams(p => ({...p, spo2Start: v}))} />
                    <InputField label={t('sbtSimulator.respRate')} value={params.respRate} onChange={(v: string) => setParams(p => ({...p, respRate: v}))} />
                  </div>
                </section>

                {/* Checklist */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <ClipboardCheck className="text-primary" size={20} />
                    <h3 className="font-black text-primary uppercase tracking-tight text-sm">{t('sbtSimulator.checklistTitle')}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.keys(checklist).map(key => (
                      <CheckPill key={key} label={t(`sbtSimulator.checklist.${key}`)} checked={checklist[key]} onChange={() => toggleCheck(key)} />
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Timer & Controls */}
              <div className="lg:col-span-5">
                <div className="space-y-6 sm:space-y-8">
                  {/* Timer Card */}
                  <div className="bg-primary rounded-xl p-6 sm:p-8 text-white shadow-xl shadow-primary/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                      <Timer size={100} />
                    </div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="font-black text-white/50 uppercase tracking-[0.15em] text-[10px] mb-4">
                        {t('sbtSimulator.timerTitle')}
                      </div>
                      <div className="text-6xl sm:text-7xl font-black tabular-nums tracking-tighter mb-6 group-hover:scale-105 transition-transform duration-500">
                        {formatTime(timer)}
                      </div>
                      
                      <div className="flex gap-4 w-full">
                        <button 
                          onClick={() => setIsTimerRunning(!isTimerRunning)}
                          type="button"
                          className={cn(
                            "flex-1 py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95 text-sm sm:text-base",
                            isTimerRunning 
                              ? "bg-rose-500 hover:bg-rose-600 shadow-rose-900/30" 
                              : "bg-secondary hover:bg-secondary-dark shadow-secondary-dark/30"
                          )}
                        >
                          {isTimerRunning ? <Pause size={20} /> : <Play size={20} />}
                          {isTimerRunning ? t('sbtSimulator.timerPause') : t('sbtSimulator.timerStart')}
                        </button>
                        <button 
                          onClick={() => { setTimer(0); setIsTimerRunning(false); }}
                          type="button"
                          className="bg-white/10 hover:bg-white/20 p-4 rounded-xl transition-all cursor-pointer border border-white/10 active:scale-95"
                        >
                          <RotateCcw size={20} />
                        </button>
                      </div>

                      <div className="mt-8 pt-8 border-t border-white/10 w-full text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">
                          {t('sbtSimulator.recommendedDurationLabel')}
                        </p>
                        <p className="text-sm font-bold text-secondary">
                          {patientType === 'adult' ? t('sbtSimulator.recommendedDurationAdult') : t('sbtSimulator.recommendedDurationPediatric')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Evaluate Button */}
                  <button
                    onClick={handleEvaluate}
                    type="button"
                    className="w-full bg-white text-primary border-2 border-primary font-black py-4 sm:py-5 rounded-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-3 text-base sm:text-lg shadow-md shadow-slate-200 cursor-pointer active:scale-[0.98]"
                  >
                    <BarChart3 size={20} className="shrink-0" /> 
                    <span>{t('buttons.evaluateSBT')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Result Display Overlay */}
            {result && (
              <div className="animate-fade-in pt-8 border-t border-slate-200">
                <div className={cn(
                  "rounded-2xl p-6 sm:p-10 border-2 flex flex-col md:flex-row items-center gap-6 shadow-xl",
                  result.success ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
                )}>
                  <div className={cn(
                    "p-6 rounded-xl text-white shadow-md",
                    result.success ? "bg-emerald-500" : "bg-rose-500"
                  )}>
                    {result.success ? <CheckCircle2 size={48} /> : <AlertCircle size={48} />}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className={cn("text-4xl font-black tracking-tight mb-4", result.success ? "text-emerald-800" : "text-rose-800")}>
                      {t(`results.${result.success ? 'sbtSuccess' : 'sbtFail'}`)}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                      <div>
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                          <Info size={16} className="text-secondary" />
                          {t('results.sbtRecommendationsTitle')}
                        </h4>
                        <ul className="space-y-3">
                          {((result.success 
                              ? t('results.sbtSuccessRecommendations', { returnObjects: true }) 
                              : t('results.sbtFailRecommendations', { returnObjects: true })
                            ) as any || []).map((text: string, i: number) => (
                            <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-white/80 font-bold text-xs text-slate-600">
                              <ChevronRight size={14} className="text-secondary shrink-0 mt-0.5" />
                              {text}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/40 rounded-3xl p-6 border border-white/60">
                        <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs mb-4">{t('results.sbtActionsTitle')}</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between font-bold text-sm">
                            <span className="text-slate-500">{t('results.methodUsed')}</span>
                            <span className="text-primary">{selectedMethod ? t(`sbtGuide.methods.${selectedMethod}.name`) : '---'}</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm">
                            <span className="text-slate-500">{t('results.duration')}</span>
                            <span className="text-primary">{formatTime(timer)}</span>
                          </div>
                          <div className="flex justify-between font-bold text-sm">
                            <span className="text-slate-500">{t('results.population')}</span>
                            <span className="text-primary uppercase">{patientType}</span>
                          </div>
                        </div>
                        <button 
                          onClick={resetSimulator}
                          type="button"
                          className="w-full mt-6 py-4 rounded-xl border-2 border-slate-200 text-slate-400 font-black text-xs hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          {t('sbtSimulator.timerReset')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Internal components
function InputField({ label, value, onChange }: any) {
  return (
    <div className="flex flex-col group">
      <label className="font-black text-slate-500 text-[10px] uppercase tracking-[0.15em] mb-2 group-focus-within:text-secondary transition-colors">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
      />
    </div>
  );
}

function CheckPill({ label, checked, onChange }: any) {
  return (
    <button
      onClick={onChange}
      type="button"
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer text-left group",
        checked ? "bg-emerald-50 border-emerald-500/50 text-emerald-800" : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
      )}
    >
      <span className="text-xs font-black uppercase tracking-tight">{label}</span>
      <div className={cn(
        "w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all",
        checked ? "bg-emerald-500 border-emerald-500 text-white shadow-lg" : "border-slate-200 group-hover:border-slate-300"
      )}>
        {checked && <CheckCircle2 size={14} />}
      </div>
    </button>
  );
}
