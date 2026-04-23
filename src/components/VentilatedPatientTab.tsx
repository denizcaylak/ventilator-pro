import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Wind, CheckCircle2, AlertTriangle, AlertCircle, Activity, ClipboardCheck, Info, Gauge } from 'lucide-react';
import PatientTypeSelector from './PatientTypeSelector';
import type { PatientType, WeaningResult } from '@/lib/calculations';
import { analyzeWeaning } from '@/lib/calculations';
import { cn } from '@/lib/utils';

interface VentilatedPatientTabProps {
  onLaunchSimulator: () => void;
}

export default function VentilatedPatientTab({ onLaunchSimulator }: VentilatedPatientTabProps) {
  const { t } = useTranslation();
  const [patientType, setPatientType] = useState<PatientType>('adult');
  const [result, setResult] = useState<WeaningResult | null>(null);

  const [form, setForm] = useState({
    age: '', weight: '', height: '', gender: 'male',
    ventDay: '', currentMode: 'simv', fio2: '', peep: '', ps: '',
    respRate: '', spontVt: '', rsbi: '',
    weanPh: '', weanPao2: '', weanPaco2: '', weanSao2: '',
  });

  const [criteria, setCriteria] = useState<Record<string, boolean>>({
    stable: false, fever: false, infection: false, secret: false,
    cough: false, gag: false, conscious: false, acidosis: false,
    lactate: false, sedation: false,
  });

  const [complications, setComplications] = useState<Record<string, boolean>>({
    vap: false, barotrauma: false, delirium: false,
    weakness: false, tracheal: false, sepsis: false,
  });

  const updateForm = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const toggleCriteria = (key: string) => setCriteria(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleComplication = (key: string) => setComplications(prev => ({ ...prev, [key]: !prev[key] }));

  const handleAnalyze = () => {
    const age = parseFloat(form.age) || 0;
    const weight = parseFloat(form.weight) || 0;
    if (!age || !weight) { alert(t('validation.requiredAgeWeight')); return; }
    const ventDay = parseInt(form.ventDay) || 0;
    if (!ventDay) { alert(t('validation.requiredVentDay')); return; }

    const activeComplications = Object.entries(complications).filter(([, v]) => v).map(([k]) => k);

    const weanResult = analyzeWeaning({
      patientType, age, weight, ventDay,
      fio2: parseFloat(form.fio2) || 0,
      peep: parseInt(form.peep) || 0,
      ps: parseInt(form.ps) || 0,
      rsbi: parseInt(form.rsbi) || 0,
      spontVt: parseInt(form.spontVt) || 0,
      weanPh: parseFloat(form.weanPh) || 7.4,
      weanPao2: parseFloat(form.weanPao2) || 0,
      weanPaco2: parseFloat(form.weanPaco2) || 0,
      criteria,
      complications: activeComplications,
    });

    setResult(weanResult);
    setTimeout(() => {
      document.getElementById('weaning-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const decisionColors: Record<string, { border: string; bg: string; text: string; lightBg: string }> = {
    ready: { border: 'border-emerald-500', bg: 'bg-emerald-500', text: 'text-emerald-700', lightBg: 'bg-emerald-50' },
    caution: { border: 'border-amber-500', bg: 'bg-amber-500', text: 'text-amber-700', lightBg: 'bg-amber-50' },
    wait: { border: 'border-rose-500', bg: 'bg-rose-500', text: 'text-rose-700', lightBg: 'bg-rose-50' },
  };

  return (
    <div className="animate-fade-in space-y-10">
      <PatientTypeSelector value={patientType} onChange={setPatientType} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Form */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title={t('weaning.paramsTitle')} icon={<Gauge size={20} className="text-secondary" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <InputField label={`${t('weaning.ventDay')} *`} value={form.ventDay} onChange={(v: string) => updateForm('ventDay', v)} placeholder="3" hint={t('weaning.ventDayUnit')} />
                <div className="flex flex-col group">
                  <label className="font-bold text-slate-500 text-[11px] uppercase tracking-wider mb-2 group-focus-within:text-secondary transition-colors">{t('weaning.currentMode')}</label>
                  <select value={form.currentMode} onChange={e => updateForm('currentMode', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-semibold">
                    {Object.entries(t('weaning.modes', { returnObjects: true }) as Record<string, string>).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <InputField label={t('weaning.fio2')} value={form.fio2} onChange={(v: string) => updateForm('fio2', v)} placeholder="0.4" hint={t('weaning.fio2Unit')} />
                <InputField label={t('weaning.peep')} value={form.peep} onChange={(v: string) => updateForm('peep', v)} placeholder="5" hint={t('weaning.peepUnit')} />
                <InputField label={t('weaning.ps')} value={form.ps} onChange={(v: string) => updateForm('ps', v)} placeholder="10" hint={t('weaning.psUnit')} />
                <InputField label={t('weaning.respRate')} value={form.respRate} onChange={(v: string) => updateForm('respRate', v)} placeholder="16" hint={t('weaning.respRateUnit')} />
                <InputField label={t('weaning.spontVt')} value={form.spontVt} onChange={(v: string) => updateForm('spontVt', v)} placeholder="400" hint={t('weaning.spontVtUnit')} />
                <InputField label={t('weaning.rsbi')} value={form.rsbi} onChange={(v: string) => updateForm('rsbi', v)} placeholder="80" hint={patientType === 'pediatric' ? t('weaning.rsbiNormalPediatric') : t('weaning.rsbiNormal')} />
              </div>
            </Card>

            <Card title={t('weaning.akgTitle')} icon={<Activity size={20} className="text-danger" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <InputField label={t('abg.ph')} value={form.weanPh} onChange={(v: string) => updateForm('weanPh', v)} placeholder="7.40" step="0.01" />
                <InputField label={t('abg.pao2')} value={form.weanPao2} onChange={(v: string) => updateForm('weanPao2', v)} placeholder="85" hint="mmHg" />
                <InputField label={t('abg.paco2')} value={form.weanPaco2} onChange={(v: string) => updateForm('weanPaco2', v)} placeholder="42" hint="mmHg" />
                <InputField label={t('abg.sao2')} value={form.weanSao2} onChange={(v: string) => updateForm('weanSao2', v)} placeholder="95" hint="%" />
              </div>
            </Card>
          </div>

          <button onClick={handleAnalyze} className="w-full bg-secondary text-white font-black text-base sm:text-lg py-4 sm:py-6 rounded-2xl hover:bg-secondary-dark transition-all duration-300 shadow-xl shadow-secondary/20 uppercase tracking-widest flex items-center justify-center gap-3 sm:gap-4 cursor-pointer active:scale-[0.98]">
            <Gauge size={24} />
            {t('buttons.analyzeWeaning')}
          </button>
        </div>

        {/* Right: Checklists */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardCheck className="text-primary" size={20} />
              <h3 className="font-black text-primary uppercase tracking-tight text-sm">{t('weaning.criteriaTitle')}</h3>
            </div>
            <div className="space-y-2.5">
              {Object.keys(criteria).map(key => (
                <CheckPill key={key} label={t(`weaning.criteria.${key}`)} checked={criteria[key]} onChange={() => toggleCriteria(key)} />
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-danger" size={20} />
              <h3 className="font-black text-primary uppercase tracking-tight text-sm">{t('weaning.complicationsTitle')}</h3>
            </div>
            <div className="space-y-2.5">
              {Object.keys(complications).map(key => (
                <CheckPill key={key} label={t(`weaning.complications.${key}`)} checked={complications[key]} onChange={() => toggleComplication(key)} variant="danger" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div id="weaning-results" className="animate-fade-in space-y-8 mt-12 pt-12 border-t border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Score Display */}
            <div className="md:col-span-4">
              <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl text-center relative overflow-hidden group">
                <div className="absolute top-0 inset-x-0 h-2 bg-secondary/20" />
                <div className="text-7xl font-black text-primary mb-2 tabular-nums tracking-tighter group-hover:scale-110 transition-transform duration-500">{result.weanScore}</div>
                <div className="text-muted font-bold uppercase tracking-widest text-[11px] mb-6">{t('results.weanScore')}</div>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-sm font-bold bg-slate-50 p-3 rounded-xl">
                    <span className="text-muted">{t('results.criteriaMetLabel')}</span>
                    <span className="text-primary">{result.metCriteria} / {result.totalCriteria}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold bg-slate-50 p-3 rounded-xl">
                    <span className="text-muted">{t('results.ventilatorDay')}</span>
                    <span className="text-primary">{result.ventDay}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decision & Suggestions */}
            <div className="md:col-span-8 space-y-6">
              <div className={cn(
                "rounded-3xl p-8 border-2 flex items-center gap-6 shadow-lg shadow-slate-100",
                decisionColors[result.decisionClass].border,
                decisionColors[result.decisionClass].lightBg
              )}>
                <div className={cn("p-4 rounded-2xl text-white", decisionColors[result.decisionClass].bg)}>
                  {result.decisionClass === 'ready' && <CheckCircle2 size={32} />}
                  {result.decisionClass === 'caution' && <AlertTriangle size={32} />}
                  {result.decisionClass === 'wait' && <AlertCircle size={32} />}
                </div>
                <div>
                  <h3 className={cn("text-2xl font-black tracking-tight", decisionColors[result.decisionClass].text)}>
                    {t(`results.${result.decision}`)}
                  </h3>
                  <p className="text-slate-600 font-medium mt-1">Clinical evaluation complete.</p>
                </div>
              </div>

              <div className="card-clinical p-8">
                <div className="flex items-center gap-3 mb-6">
                  <Info className="text-secondary" size={20} />
                  <h3 className="font-black text-primary uppercase tracking-tight text-sm">{t('results.suggestionsTitle')}</h3>
                </div>
                <ul className="space-y-4">
                  {result.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="text-slate-700 font-semibold text-sm leading-relaxed">{t(`weaningRecommendations.${r.split('_')[0]}`, { defaultValue: r })}</span>
                    </li>
                  ))}
                </ul>

                {result.decisionClass === 'ready' && (
                  <button 
                    onClick={onLaunchSimulator}
                    className="w-full mt-8 bg-secondary hover:bg-secondary-dark text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-4 shadow-xl shadow-secondary/20 cursor-pointer animate-pulse-subtle"
                  >
                    <Wind size={24} /> {t('sbtSimulator.launchButton')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable subcomponents (locally or from shared)
function Card({ title, icon, children }: any) {
  return (
    <div className="card-clinical p-4 sm:p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-slate-50">{icon}</div>
        <h3 className="font-black text-primary uppercase tracking-tight text-sm">{title}</h3>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'number', placeholder, hint, step }: any) {
  return (
    <div className="flex flex-col group">
      <label className="font-bold text-slate-500 text-[11px] uppercase tracking-wider mb-2 group-focus-within:text-secondary transition-colors">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        step={step}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-semibold placeholder:text-slate-300"
      />
      {hint && <span className="text-[10px] text-slate-400 mt-1.5 font-medium">{hint}</span>}
    </div>
  );
}

function CheckPill({ label, checked, onChange, variant = 'primary' }: any) {
  return (
    <button
      onClick={onChange}
      className={cn(
        "w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left group",
        checked 
          ? (variant === 'danger' ? "bg-red-50 border-danger/50 text-danger" : "bg-blue-50 border-secondary/50 text-secondary")
          : "bg-white border-slate-100 text-slate-600 hover:border-slate-200"
      )}
    >
      <span className="text-xs font-bold">{label}</span>
      <div className={cn(
        "w-5 h-5 rounded-md flex items-center justify-center transition-colors border-2",
        checked 
          ? (variant === 'danger' ? "bg-danger border-danger text-white" : "bg-secondary border-secondary text-white")
          : "border-slate-200 group-hover:border-slate-300"
      )}>
        {checked && <CheckCircle2 size={12} />}
      </div>
    </button>
  );
}
