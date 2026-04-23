import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PatientTypeSelector from './PatientTypeSelector';
import NewPatientResults from './NewPatientResults';
import type { PatientType, NewPatientResult } from '@/lib/calculations';
import { analyzeNewPatient, getAgeCategory, calculateIBW, calculateBSA } from '@/lib/calculations';
import { User, Activity, Beaker, ClipboardList, Wind, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NewPatientTab() {
  const { t } = useTranslation();
  const [patientType, setPatientType] = useState<PatientType>('adult');
  const [result, setResult] = useState<NewPatientResult | null>(null);

  // Form state
  const [form, setForm] = useState({
    age: '', weight: '', height: '', gender: 'male',
    ph: '', paco2: '', pao2: '', hco3: '', sao2: '', be: '',
    hb: '', hct: '', creatinine: '', bun: '', ast: '', alt: '', albumin: '', lactate: '',
    pfRatio: '', peepCurrent: '', allergy: '',
  });

  const [comorbidities, setComorbidities] = useState<Record<string, boolean>>({
    copd: false, asthma: false, ards: false, chf: false, ckd: false,
    cirrhosis: false, diabetes: false, immunosuppression: false,
    neuromuscular: false, obesity: false, pregnancy: false, smoking: false,
  });

  const [lungIssues, setLungIssues] = useState<Record<string, boolean>>({
    pneumonia: false, pulmonaryEdema: false, pneumothorax: false,
    pleuralEffusion: false, atelectasis: false,
  });

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleComorbidity = (key: string) => {
    setComorbidities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleLungIssue = (key: string) => {
    setLungIssues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAnalyze = () => {
    const age = parseFloat(form.age) || 0;
    const weight = parseFloat(form.weight) || 0;
    const height = parseFloat(form.height) || 0;

    if (!age || !weight || !height) {
      alert(t('validation.requiredFields'));
      return;
    }

    const ph = parseFloat(form.ph) || 0;
    const paco2 = parseFloat(form.paco2) || 0;
    const pao2 = parseFloat(form.pao2) || 0;

    if (!ph || !paco2 || !pao2) {
      alert(t('validation.requiredABG'));
      return;
    }

    const activeComorbidities = Object.entries(comorbidities).filter(([, v]) => v).map(([k]) => k);
    const activeLungIssues = Object.entries(lungIssues).filter(([, v]) => v).map(([k]) => k);

    const analysisResult = analyzeNewPatient({
      patientType, age, weight, height, gender: form.gender,
      ph, paco2, pao2,
      hco3: parseFloat(form.hco3) || 0,
      sao2: parseFloat(form.sao2) || 0,
      be: parseFloat(form.be) || 0,
      hb: parseFloat(form.hb) || 0,
      creatinine: parseFloat(form.creatinine) || 0,
      bun: parseFloat(form.bun) || 0,
      ast: parseFloat(form.ast) || 0,
      alt: parseFloat(form.alt) || 0,
      albumin: parseFloat(form.albumin) || 0,
      lactate: parseFloat(form.lactate) || 0,
      pfRatio: parseFloat(form.pfRatio) || 0,
      comorbidities: activeComorbidities,
      lungIssues: activeLungIssues,
    });

    setResult(analysisResult);
    setTimeout(() => {
      document.getElementById('new-patient-results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Pediatric info display
  const age = parseFloat(form.age) || 0;
  const weight = parseFloat(form.weight) || 0;
  const height = parseFloat(form.height) || 0;
  const ibw = patientType === 'pediatric' && age > 0 ? calculateIBW(age, weight, form.gender, patientType, height) : 0;
  const bsa = height > 0 && weight > 0 ? calculateBSA(height, weight) : 0;
  const ageCategory = patientType === 'pediatric' && age > 0 ? getAgeCategory(age) : '';

  return (
    <div className="animate-fade-in space-y-10">
      <PatientTypeSelector value={patientType} onChange={setPatientType} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Parameters */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Demographics Card */}
            <Card title={t('demographics.title')} icon={<User size={20} className="text-secondary" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <InputField label={t('demographics.age')} value={form.age} onChange={(v: string) => updateForm('age', v)} type="number" placeholder="65" hint={t('demographics.ageUnit')} />
                <InputField label={t('demographics.weight')} value={form.weight} onChange={(v: string) => updateForm('weight', v)} type="number" placeholder="70" hint={t('demographics.weightUnit')} />
                <InputField label={t('demographics.height')} value={form.height} onChange={(v: string) => updateForm('height', v)} type="number" placeholder="170" hint={t('demographics.heightUnit')} />
                <div className="flex flex-col">
                  <label className="font-bold text-slate-500 text-[11px] uppercase tracking-wider mb-2">{t('demographics.gender')}</label>
                  <select value={form.gender} onChange={e => updateForm('gender', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-semibold">
                    <option value="male">{t('demographics.male')}</option>
                    <option value="female">{t('demographics.female')}</option>
                  </select>
                </div>
              </div>
              {patientType === 'pediatric' && age > 0 && (
                <div className="mt-6 p-4 bg-secondary/5 rounded-2xl border border-secondary/10 text-xs font-semibold text-secondary flex items-center gap-3 animate-fade-in">
                  <Info size={16} />
                  <span>{t('demographics.ibw')}: {ibw.toFixed(1)} kg | {t('demographics.bsa')}: {bsa.toFixed(2)} m² | {t(`ageCategories.${ageCategory}`)}</span>
                </div>
              )}
            </Card>

            {/* ABG Card */}
            <Card title={t('abg.title')} icon={<Activity size={20} className="text-danger" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <InputField label={t('abg.ph')} value={form.ph} onChange={(v: string) => updateForm('ph', v)} type="number" placeholder="7.40" hint={patientType === 'pediatric' ? t('abg.phNormalPediatric') : t('abg.phNormal')} step="0.01" />
                <InputField label={t('abg.paco2')} value={form.paco2} onChange={(v: string) => updateForm('paco2', v)} type="number" placeholder="40" hint={patientType === 'pediatric' ? t('abg.paco2NormalPediatric') : t('abg.paco2Normal')} />
                <InputField label={t('abg.pao2')} value={form.pao2} onChange={(v: string) => updateForm('pao2', v)} type="number" placeholder="90" hint={patientType === 'pediatric' ? t('abg.pao2NormalPediatric') : t('abg.pao2Normal')} />
                <InputField label={t('abg.hco3')} value={form.hco3} onChange={(v: string) => updateForm('hco3', v)} type="number" placeholder="24" hint={patientType === 'pediatric' ? t('abg.hco3NormalPediatric') : t('abg.hco3Normal')} />
                <InputField label={t('abg.sao2')} value={form.sao2} onChange={(v: string) => updateForm('sao2', v)} type="number" placeholder="97" hint={t('abg.sao2Normal')} />
                <InputField label={t('abg.be')} value={form.be} onChange={(v: string) => updateForm('be', v)} type="number" placeholder="0" hint={t('abg.beNormal')} />
              </div>
            </Card>

            {/* Lab Card */}
            <Card title={t('lab.title')} icon={<Beaker size={20} className="text-info" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <InputField label={t('lab.hemoglobin')} value={form.hb} onChange={(v: string) => updateForm('hb', v)} type="number" placeholder="12" hint={t('lab.hbNormal')} />
                <InputField label={t('lab.creatinine')} value={form.creatinine} onChange={(v: string) => updateForm('creatinine', v)} type="number" placeholder="1.0" hint={t('lab.creatinineUnit')} />
                <InputField label={t('lab.albumin')} value={form.albumin} onChange={(v: string) => updateForm('albumin', v)} type="number" placeholder="3.5" hint={t('lab.albuminNormal')} />
                <InputField label={t('lab.lactate')} value={form.lactate} onChange={(v: string) => updateForm('lactate', v)} type="number" placeholder="1.2" hint={t('lab.lactateNormal')} />
              </div>
            </Card>

            {/* Pulmonary Card */}
            <Card title={t('lung.title')} icon={<Wind size={20} className="text-secondary" />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <InputField label={t('lung.pfRatio')} value={form.pfRatio} onChange={(v: string) => updateForm('pfRatio', v)} type="number" placeholder="300" hint={t('lung.pfRatioUnit')} />
                <InputField label={t('lung.peep')} value={form.peepCurrent} onChange={(v: string) => updateForm('peepCurrent', v)} type="number" placeholder="5" hint={t('lung.peepUnit')} />
              </div>
            </Card>
          </div>

          <button
            onClick={handleAnalyze}
            className="w-full bg-secondary text-white font-black text-base sm:text-lg py-4 sm:py-6 rounded-2xl hover:bg-secondary-dark transition-all duration-300 shadow-xl shadow-secondary/20 uppercase tracking-widest flex items-center justify-center gap-3 sm:gap-4 cursor-pointer active:scale-[0.98]"
          >
            <Activity size={24} />
            {t('buttons.analyzeNew')}
          </button>
        </div>

        {/* Right Side: Checklists */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="text-primary" size={20} />
              <h3 className="font-black text-primary uppercase tracking-tight text-sm">{t('comorbidities.title')}</h3>
            </div>
            <div className="space-y-2.5">
              {Object.keys(comorbidities).map(key => (
                <CheckPill key={key} label={t(`comorbidities.${key}`)} checked={comorbidities[key]} onChange={() => toggleComorbidity(key)} />
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="text-danger" size={20} />
              <h3 className="font-black text-primary uppercase tracking-tight text-sm">{t('lung.title')}</h3>
            </div>
            <div className="space-y-2.5">
              {Object.keys(lungIssues).map(key => (
                <CheckPill key={key} label={t(`lung.${key}`)} checked={lungIssues[key]} onChange={() => toggleLungIssue(key)} variant="danger" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {result && <div id="new-patient-results"><NewPatientResults data={result} /></div>}
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card-clinical p-4 sm:p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-slate-50">
          {icon}
        </div>
        <h3 className="font-black text-primary uppercase tracking-tight text-sm">{title}</h3>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type, placeholder, hint, step }: any) {
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
