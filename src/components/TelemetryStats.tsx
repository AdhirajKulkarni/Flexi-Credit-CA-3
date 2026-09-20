import React from 'react';
import { BedType } from '../types.js';
import { HeartPulse, Wind, Stethoscope, Bed, AlertTriangle } from 'lucide-react';

interface TelemetryStatsProps {
  totalAvailable: number;
  totalIcu: number;
  totalVentilator: number;
  totalOxygen: number;
  selectedBedType: BedType | 'all';
  onSelectBedType: (type: BedType | 'all') => void;
  lang: 'en' | 'hi';
}

export const TelemetryStats: React.FC<TelemetryStatsProps> = ({
  totalAvailable,
  totalIcu,
  totalVentilator,
  totalOxygen,
  selectedBedType,
  onSelectBedType,
  lang,
}) => {
  const cards = [
    {
      id: 'stat-all',
      type: 'all' as const,
      label: lang === 'en' ? 'Total Available Beds' : 'कुल उपलब्ध बेड',
      sublabel: lang === 'en' ? 'Across all verified hospitals' : 'सभी अस्पतालों में',
      count: totalAvailable,
      icon: Bed,
      color: 'slate',
    },
    {
      id: 'stat-icu',
      type: 'icu' as const,
      label: lang === 'en' ? 'ICU Beds Available' : 'उपलब्ध ICU बेड',
      sublabel: lang === 'en' ? 'Intensive care units' : 'गंभीर देखभाल यूनिट',
      count: totalIcu,
      icon: HeartPulse,
      color: totalIcu > 5 ? 'emerald' : 'amber',
    },
    {
      id: 'stat-ventilator',
      type: 'ventilator' as const,
      label: lang === 'en' ? 'Ventilators Available' : 'उपलब्ध वेंटिलेटर',
      sublabel: lang === 'en' ? 'Critical respiratory care' : 'श्वसन सहायता बेड',
      count: totalVentilator,
      icon: Wind,
      color: totalVentilator > 3 ? 'emerald' : 'rose',
    },
    {
      id: 'stat-oxygen',
      type: 'oxygen' as const,
      label: lang === 'en' ? 'Oxygen (O₂) Beds' : 'ऑक्सीजन युक्त बेड',
      sublabel: lang === 'en' ? 'Continuous O₂ delivery' : 'उच्च-प्रवाह ऑक्सीजन',
      count: totalOxygen,
      icon: Stethoscope,
      color: totalOxygen > 15 ? 'emerald' : 'amber',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((item) => {
        const Icon = item.icon;
        const isSelected = selectedBedType === item.type;
        return (
          <button
            key={item.id}
            id={item.id}
            onClick={() => onSelectBedType(isSelected && item.type !== 'all' ? 'all' : item.type)}
            className={`text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
              isSelected
                ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                : 'bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-xs font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                {item.label}
              </span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isSelected
                    ? 'bg-white/10 text-emerald-400'
                    : item.color === 'emerald'
                    ? 'bg-emerald-50 text-emerald-700'
                    : item.color === 'rose'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight">
                {item.count}
              </span>
              {item.count < 3 && item.type !== 'all' && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${
                  isSelected ? 'bg-rose-500/30 text-rose-300' : 'bg-rose-100 text-rose-700'
                }`}>
                  {lang === 'en' ? 'Critical Supply' : 'अति सीमित'}
                </span>
              )}
            </div>

            <p className={`text-[11px] mt-1 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
              {item.sublabel}
            </p>
          </button>
        );
      })}
    </div>
  );
};
