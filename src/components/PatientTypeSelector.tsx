import { useTranslation } from 'react-i18next';
import type { PatientType } from '@/lib/calculations';
import { cn } from '@/lib/utils';
import { User, Baby, CheckCircle2 } from 'lucide-react';

interface PatientTypeSelectorProps {
  value: PatientType;
  onChange: (type: PatientType) => void;
}

export default function PatientTypeSelector({ value, onChange }: PatientTypeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-slate-100/50 p-2 rounded-3xl mb-10 max-w-2xl mx-auto border border-slate-200/60 shadow-inner">
      <div className="flex gap-2">
        <button
          onClick={() => onChange('adult')}
          className={cn(
            'flex-1 flex flex-col items-center gap-2 py-4 px-6 rounded-2xl transition-all duration-300 relative cursor-pointer overflow-hidden',
            value === 'adult'
              ? 'bg-white text-primary shadow-xl shadow-slate-200 ring-1 ring-slate-100'
              : 'text-muted hover:bg-white/50'
          )}
        >
          <div className={cn(
            "p-3 rounded-xl transition-colors",
            value === 'adult' ? "bg-primary/10 text-primary" : "bg-slate-200/50 text-muted"
          )}>
            <User size={28} />
          </div>
          <span className="font-extrabold text-sm tracking-tight">{t('patientType.adult')}</span>
          {value === 'adult' && <CheckCircle2 className="absolute top-3 right-3 text-success" size={16} />}
        </button>

        <button
          onClick={() => onChange('pediatric')}
          className={cn(
            'flex-1 flex flex-col items-center gap-2 py-4 px-6 rounded-2xl transition-all duration-300 relative cursor-pointer overflow-hidden',
            value === 'pediatric'
              ? 'bg-white text-pediatric shadow-xl shadow-purple-100 ring-1 ring-purple-50'
              : 'text-muted hover:bg-white/50'
          )}
        >
          <div className={cn(
            "p-3 rounded-xl transition-colors",
            value === 'pediatric' ? "bg-pediatric/10 text-pediatric" : "bg-slate-200/50 text-muted"
          )}>
            <Baby size={28} />
          </div>
          <span className="font-extrabold text-sm tracking-tight">{t('patientType.pediatric')}</span>
          {value === 'pediatric' && <CheckCircle2 className="absolute top-3 right-3 text-pediatric" size={16} />}
        </button>
      </div>

      {value === 'pediatric' && (
        <div className="mt-2 p-4 bg-pediatric/5 rounded-2xl border border-pediatric/10 animate-fade-in mx-2">
          <div className="flex gap-3 items-start">
            <Baby className="text-pediatric shrink-0 mt-0.5" size={18} />
            <div>
              <h4 className="text-pediatric font-bold text-sm mb-1">{t('patientType.pediatricActive')}</h4>
              <p className="text-pediatric/70 text-[11px] font-medium leading-relaxed italic">{t('patientType.pediatricDescription')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
