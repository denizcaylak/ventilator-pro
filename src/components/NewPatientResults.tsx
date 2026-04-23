import { useTranslation } from 'react-i18next';
import type { NewPatientResult } from '@/lib/calculations';
import { Activity, AlertTriangle, ShieldCheck, Info, CheckCircle2, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  data: NewPatientResult;
}

export default function NewPatientResults({ data }: Props) {
  const { t } = useTranslation();

  const riskClass = data.riskScore < 4 ? 'success' : data.riskScore < 8 ? 'warning' : 'danger';
  const riskText = data.riskScore < 4 ? t('results.lowRisk') : data.riskScore < 8 ? t('results.mediumRisk') : t('results.highRisk');
  const riskColor = riskClass === 'success' ? 'text-emerald-600' : riskClass === 'warning' ? 'text-amber-600' : 'text-rose-600';
  const riskBg = riskClass === 'success' ? 'bg-emerald-50' : riskClass === 'warning' ? 'bg-amber-50' : 'bg-rose-50';
  const riskBorder = riskClass === 'success' ? 'border-emerald-200' : riskClass === 'warning' ? 'border-amber-200' : 'border-rose-200';

  const strategyConfig = {
    invasive: { icon: <AlertTriangle size={24} />, title: t('results.invasive'), border: 'border-rose-200', bg: 'bg-rose-50/50', text: 'text-rose-700' },
    niv: { icon: <Activity size={24} />, title: t('results.niv'), border: 'border-amber-200', bg: 'bg-amber-50/50', text: 'text-amber-700' },
    conservative: { icon: <ShieldCheck size={24} />, title: t('results.conservative'), border: 'border-emerald-200', bg: 'bg-emerald-50/50', text: 'text-emerald-700' },
  };

  const strat = strategyConfig[data.strategy];

  return (
    <div className="mt-16 animate-fade-in space-y-10">
      
      {/* Risk & Demographics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-5">
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl text-center relative overflow-hidden group h-full flex flex-col justify-center">
            <div className={cn("absolute top-0 inset-x-0 h-2", riskClass === 'success' ? 'bg-emerald-500' : riskClass === 'warning' ? 'bg-amber-500' : 'bg-rose-500')} />
            
            <div className="flex items-center justify-center gap-2 text-muted mb-4">
              {data.patientType === 'pediatric' ? <TrendingUp size={16} /> : <User size={16} />}
              <span className="font-black uppercase tracking-widest text-[10px]">{data.patientType === 'pediatric' ? 'Pediatric Population' : 'Adult Population'}</span>
            </div>
            
            <div className={cn("text-8xl font-black mb-2 tracking-tighter transition-transform duration-500 group-hover:scale-110", riskColor)}>
              {data.riskScore}
            </div>
            
            <div className={cn("inline-flex items-center gap-2 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mx-auto mb-8 shadow-sm border", riskBg, riskColor, riskBorder)}>
              {riskText}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-muted font-black uppercase tracking-tighter text-[9px] mb-1">{t('results.idealWeight')}</div>
                <div className="text-primary font-bold text-sm">{data.idealWeight} kg</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-muted font-black uppercase tracking-tighter text-[9px] mb-1">{t('results.bmi')}</div>
                <div className="text-primary font-bold text-sm">{data.bmi}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 space-y-6">
          {/* Strategy Card */}
          <div className={cn("rounded-3xl p-8 border-2 flex items-center gap-6 shadow-lg shadow-slate-100 transition-all", strat.border, strat.bg)}>
            <div className={cn("p-4 rounded-2xl text-white shadow-lg", strat.text.replace('text', 'bg'))}>
              {strat.icon}
            </div>
            <div>
              <h3 className={cn("text-2xl font-black tracking-tight", strat.text)}>
                {strat.title}
              </h3>
              {data.abgInterpretation && (
                <p className="text-slate-600 font-bold text-sm mt-1 uppercase tracking-tight">
                  {data.abgInterpretation.split(' + ').map(key => t(`abgInterpretation.${key}`, { defaultValue: key })).join(' + ')}
                </p>
              )}
            </div>
          </div>

          {/* Risk Factors Grid */}
          <div className="card-clinical p-8 h-full">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-rose-500" size={20} />
              <h3 className="font-black text-primary uppercase tracking-tight text-sm">{t('results.riskFactorsTitle')}</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.riskFactors.map((f, i) => (
                <div key={i} className="bg-rose-50 text-rose-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight border border-rose-100 shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  {t(`riskFactors.${f}`, { defaultValue: t(`comorbidities.${f}`, { defaultValue: t(`lung.${f}`, { defaultValue: f }) }) })}
                </div>
              ))}
              {data.riskFactors.length === 0 && (
                <div className="text-slate-400 font-bold italic text-sm">No significant risk factors identified.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Modes Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="text-secondary" size={24} />
          <h3 className="text-2xl font-black text-primary tracking-tight">{t('results.recommendedModes')}</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          {data.modes.map((mode, index) => (
            <div key={index} className={cn(
              "card-clinical p-8 relative overflow-hidden transition-all hover:scale-[1.01]",
              index === 0 ? "ring-2 ring-emerald-500/50 shadow-2xl shadow-emerald-100" : ""
            )}>
              {index === 0 && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg z-10">
                  <CheckCircle2 size={14} /> {t('results.firstChoice')}
                </div>
              )}
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h4 className="text-3xl font-black text-primary tracking-tighter mb-2">
                    {t(`ventModes.${mode.name}`, { defaultValue: mode.name })}
                  </h4>
                  <div className="flex items-center gap-3">
                    <Info size={16} className="text-secondary" />
                    <p className="text-slate-600 font-bold text-sm leading-relaxed">
                      {t(`ventModes.${mode.reason}`, { defaultValue: mode.reason })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(mode.settings).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-lg transition-all duration-300">
                    <div className="text-muted text-[9px] font-black uppercase tracking-widest mb-2 group-hover:text-secondary">{key}</div>
                    <div className="text-primary font-black text-xl tracking-tight leading-none">
                      {t(`ventModes.${val}`, { defaultValue: val })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
