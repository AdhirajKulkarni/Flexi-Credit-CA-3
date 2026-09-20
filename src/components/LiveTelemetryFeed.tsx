import React from 'react';
import { TelemetryEvent } from '../types.js';
import { Radio, ArrowUpRight, ArrowDownLeft, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LiveTelemetryFeedProps {
  events: TelemetryEvent[];
  lang: 'en' | 'hi';
}

export const LiveTelemetryFeed: React.FC<LiveTelemetryFeedProps> = ({ events, lang }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-800">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {lang === 'en' ? 'Live Telemetry & Bed Status Activity' : 'लाइव बेड गतिविधि एवं अपडेट्स'}
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">
          {lang === 'en' ? 'Auto-refreshes every 15s' : 'स्वतः अपडेट'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {events.slice(0, 3).map((evt) => {
          const isFreed = evt.eventType === 'freed';
          const isReserved = evt.eventType === 'reserved';

          return (
            <div
              key={evt.id}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-start gap-2.5 text-xs"
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  isFreed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isReserved
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isFreed ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : isReserved ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                )}
              </div>

              <div className="space-y-0.5 min-w-0">
                <p className="font-semibold text-slate-100 truncate">{evt.hospitalName}</p>
                <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">{evt.message}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
