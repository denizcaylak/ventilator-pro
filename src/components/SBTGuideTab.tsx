import { useTranslation } from 'react-i18next';
import { Wind, CheckCircle2, AlertTriangle, ChevronRight, Info, BookOpen, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SBTGuideTab({ onLaunchSimulator }: { onLaunchSimulator: () => void }) {
  const { t } = useTranslation();

  const methods = ['ttube', 'ps', 'cpap', 'atc'] as const;
  const difficultyColors: Record<string, string> = {
    'Yüksek': 'bg-rose-100 text-rose-700',
    'High': 'bg-rose-100 text-rose-700',
    'Düşük': 'bg-emerald-100 text-emerald-700',
    'Low': 'bg-emerald-100 text-emerald-700',
    'Orta': 'bg-amber-100 text-amber-700',
    'Medium': 'bg-amber-100 text-amber-700',
  };

  const flowSteps = (t('sbtGuide.flowSteps', { returnObjects: true }) as any) || [];
  const adultCriteria = (t('sbtGuide.adultCriteria', { returnObjects: true }) as any) || [];
  const pediatricCriteria = (t('sbtGuide.pediatricCriteria', { returnObjects: true }) as any) || [];
  const immediateStopCriteria = (t('sbtGuide.immediateStopCriteria', { returnObjects: true }) as any) || [];
  const afterFailureCriteria = (t('sbtGuide.afterFailureCriteria', { returnObjects: true }) as any) || [];

  return (
    <div className="animate-fade-in space-y-12 pb-12">
      
      {/* Premium Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-secondary" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2 text-secondary">
            <BookOpen size={20} />
            <span className="font-black uppercase tracking-widest text-[11px]">{t('sbtGuide.title').split('(')[0]}</span>
          </div>
          <h3 className="text-3xl font-black text-primary tracking-tight mb-2">{t('sbtGuide.title')}</h3>
          <p className="text-muted font-medium text-sm max-w-2xl">{t('sbtGuide.subtitle')}</p>
        </div>
        <button 
          onClick={onLaunchSimulator}
          className="bg-primary text-white px-8 py-5 rounded-2xl font-black text-sm transition-all flex items-center gap-3 shadow-2xl shadow-primary/30 cursor-pointer hover:scale-[1.03] active:scale-[0.97]"
        >
          <Wind size={20} className="animate-pulse" /> {t('sbtSimulator.launchButton')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        
        {/* Comparison Table Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Layers className="text-secondary" size={24} />
            <h3 className="text-2xl font-black text-primary tracking-tight">{t('sbtGuide.comparisonTitle')}</h3>
          </div>
          <div className="card-clinical overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="p-5 text-left font-black uppercase tracking-wider text-[10px]">{t('sbtGuide.comparisonHeaders.method')}</th>
                    <th className="p-5 text-left font-black uppercase tracking-wider text-[10px]">{t('sbtGuide.comparisonHeaders.description')}</th>
                    <th className="p-5 text-left font-black uppercase tracking-wider text-[10px]">{t('sbtGuide.comparisonHeaders.adultParams')}</th>
                    <th className="p-5 text-left font-black uppercase tracking-wider text-[10px]">{t('sbtGuide.comparisonHeaders.pediatricParams')}</th>
                    <th className="p-5 text-center font-black uppercase tracking-wider text-[10px]">{t('sbtGuide.comparisonHeaders.difficulty')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {methods.map((method) => {
                    const difficulty = t(`sbtGuide.methods.${method}.difficulty`);
                    return (
                      <tr key={method} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-5 font-extrabold text-primary">{t(`sbtGuide.methods.${method}.name`)}</td>
                        <td className="p-5 text-slate-600 font-medium">{t(`sbtGuide.methods.${method}.description`)}</td>
                        <td className="p-5 text-slate-700 font-semibold italic whitespace-pre-line leading-relaxed">{t(`sbtGuide.methods.${method}.adultParams`)}</td>
                        <td className="p-5 text-slate-700 font-semibold italic whitespace-pre-line leading-relaxed">{t(`sbtGuide.methods.${method}.pediatricParams`)}</td>
                        <td className="p-5 text-center">
                          <span className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter", difficultyColors[difficulty] || 'bg-slate-100 text-slate-600')}>
                            {difficulty}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="bg-secondary/5 p-6 flex gap-4 items-center">
              <div className="bg-white p-2 rounded-lg shadow-sm text-secondary">
                <Info size={20} />
              </div>
              <p className="text-xs font-bold text-secondary/80 leading-relaxed italic">{t('sbtGuide.evidenceNote')}</p>
            </div>
          </div>
        </section>

        {/* Criteria Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Success Criteria */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={24} />
              <h3 className="text-2xl font-black text-primary tracking-tight">{t('sbtGuide.successTitle')}</h3>
            </div>
            <div className="card-clinical p-8 space-y-8">
              <div>
                <h5 className="font-black text-primary uppercase tracking-widest text-[11px] mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  {t('sbtGuide.adultCriteriaTitle')}
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  {Array.isArray(adultCriteria) && adultCriteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-50 transition-colors">
                      <div className="bg-emerald-500 text-white p-1 rounded-md">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-slate-700 font-bold text-xs">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-8 border-t border-slate-100">
                <h5 className="font-black text-pediatric uppercase tracking-widest text-[11px] mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pediatric" />
                  {t('sbtGuide.pediatricCriteriaTitle')}
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  {Array.isArray(pediatricCriteria) && pediatricCriteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 hover:bg-purple-50 transition-colors">
                      <div className="bg-pediatric text-white p-1 rounded-md">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-slate-700 font-bold text-xs">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Failure Criteria */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-rose-500" size={24} />
              <h3 className="text-2xl font-black text-primary tracking-tight">{t('sbtGuide.failureTitle')}</h3>
            </div>
            <div className="space-y-8">
              <div className="card-clinical p-8 bg-rose-50/30 border-rose-100">
                <h5 className="font-black text-rose-700 uppercase tracking-widest text-[11px] mb-4 flex items-center gap-2">
                  <AlertTriangle size={14} />
                  {t('sbtGuide.immediateStopTitle')}
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  {Array.isArray(immediateStopCriteria) && immediateStopCriteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-rose-100 text-rose-700 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span className="font-bold text-xs">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-clinical p-8 bg-amber-50/30 border-amber-100">
                <h5 className="font-black text-amber-700 uppercase tracking-widest text-[11px] mb-4 flex items-center gap-2">
                  <Info size={14} />
                  {t('sbtGuide.afterFailureTitle')}
                </h5>
                <div className="grid grid-cols-1 gap-3">
                  {Array.isArray(afterFailureCriteria) && afterFailureCriteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-amber-100 text-amber-700 shadow-sm">
                      <ChevronRight size={14} className="text-amber-500" />
                      <span className="font-bold text-xs">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Flow Chart */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Layers className="text-primary" size={24} />
            <h3 className="text-2xl font-black text-primary tracking-tight">{t('sbtGuide.flowTitle')}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {Array.isArray(flowSteps) && flowSteps.map((step: any, i: number) => (
              <div key={i} className="group relative">
                <div className="card-clinical p-6 h-full flex flex-col items-center text-center group-hover:border-secondary transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-primary flex items-center justify-center font-black text-xl mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                    {i + 1}
                  </div>
                  <h5 className="font-black text-primary text-sm mb-2">{step.title}</h5>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed whitespace-pre-line">{step.description}</p>
                </div>
                {i < flowSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-slate-300">
                    <ChevronRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
