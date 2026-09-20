import React, { useState } from 'react';
import { Hospital, BedType } from '../types.js';
import { BED_TYPE_LABELS } from '../data/initialHospitals.js';
import { Phone, Navigation, Clock, ShieldCheck, Check, ChevronDown, ChevronUp, AlertCircle, Building2, Wind } from 'lucide-react';

interface HospitalCardProps {
  hospital: Hospital;
  onReserve: (hospital: Hospital, bedType: BedType) => void;
  highlightBedType?: BedType | 'all';
  isSuggested?: boolean;
  lang: 'en' | 'hi';
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  hospital,
  onReserve,
  highlightBedType,
  isSuggested,
  lang,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const typeLabels: Record<Hospital['type'], { text: string; hi: string; color: string }> = {
    trauma_center: { text: 'Level-1 Trauma Center', hi: 'लेवल-1 ट्रॉमा सेंटर', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    government: { text: 'Government Hospital', hi: 'सरकारी अस्पताल', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    trust: { text: 'Charitable Trust', hi: 'चैरिटेबल ट्रस्ट', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    private: { text: 'Super-Specialty Private', hi: 'सुपर-स्पेशियलिटी प्राइवेट', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  const bedKeys: BedType[] = ['icu', 'ventilator', 'oxygen', 'general', 'pediatric', 'isolation'];

  return (
    <div
      id={`hospital-card-${hospital.id}`}
      className={`bg-white rounded-2xl border transition-all ${
        isSuggested
          ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'border-slate-200/90 shadow-xs hover:shadow-sm'
      }`}
    >
      <div className="p-4 sm:p-6 space-y-4">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                {hospital.name}
              </h3>
              {isSuggested && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {lang === 'en' ? 'Triage Top Match' : 'शीर्ष सुझाई गई सुविधा'}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className={`px-2 py-0.5 rounded border font-medium ${typeLabels[hospital.type].color}`}>
                {lang === 'en' ? typeLabels[hospital.type].text : typeLabels[hospital.type].hi}
              </span>
              <span>•</span>
              <span className="font-medium text-slate-700">{hospital.area}</span>
              <span>•</span>
              <span className="text-slate-500">{hospital.address}</span>
            </div>
          </div>

          {/* Distance & ETA */}
          <div className="flex items-center gap-2 shrink-0 self-start bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Navigation className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-bold text-slate-800">{hospital.distanceKm} km</span>
            <span className="text-slate-400">|</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-600">~{hospital.etaMinutes} mins</span>
          </div>
        </div>

        {/* Oxygen & Verification Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-medium text-slate-600">
              <Wind className="w-3.5 h-3.5 text-slate-500" />
              {lang === 'en' ? 'Oxygen Supply:' : 'ऑक्सीजन आपूर्ति:'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                hospital.oxygenStatus === 'adequate'
                  ? 'bg-emerald-50 text-emerald-700'
                  : hospital.oxygenStatus === 'moderate'
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {hospital.oxygenStatus === 'adequate'
                ? lang === 'en' ? 'Normal / Adequate' : 'पर्याप्त'
                : hospital.oxygenStatus === 'moderate'
                ? lang === 'en' ? 'Moderate Supply' : 'सीमित'
                : lang === 'en' ? 'Critical Shortage' : 'अति संकट'}
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            {lang === 'en' ? 'Bed telemetry synced:' : 'अंतिम सत्यापन:'}{' '}
            {new Date(hospital.lastVerified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Bed Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {bedKeys.map((key) => {
            const bed = hospital.beds[key];
            const isHighlighted = highlightBedType === key;
            const hasBeds = bed.available > 0;
            const isLow = bed.available > 0 && bed.available <= 2;

            return (
              <div
                key={key}
                className={`p-2.5 rounded-xl border flex flex-col justify-between transition-all ${
                  isHighlighted
                    ? 'ring-2 ring-emerald-500/60 bg-emerald-50/40 border-emerald-300'
                    : 'bg-slate-50/80 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 truncate" title={BED_TYPE_LABELS[key].label}>
                    {BED_TYPE_LABELS[key].short}
                  </span>
                  {bed.reserved > 0 && (
                    <span className="text-[9px] px-1 rounded bg-slate-200 text-slate-700 font-medium" title="Active emergency holds">
                      {bed.reserved} held
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <span
                    className={`text-xl font-bold tracking-tight ${
                      !hasBeds
                        ? 'text-slate-300'
                        : isLow
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {bed.available}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    / {bed.total}
                  </span>
                </div>

                {/* Status indicator bar */}
                <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-1.5">
                  <div
                    className={`h-full rounded-full ${
                      !hasBeds
                        ? 'bg-slate-300'
                        : isLow
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((bed.available / bed.total) * 100))}%`,
                    }}
                  />
                </div>

                {/* Fast Bed Hold Button */}
                <button
                  id={`btn-hold-${hospital.id}-${key}`}
                  disabled={!hasBeds}
                  onClick={() => onReserve(hospital, key)}
                  className={`mt-2 w-full py-1 text-[11px] font-medium rounded-lg transition-colors text-center ${
                    hasBeds
                      ? 'bg-white hover:bg-slate-900 hover:text-white text-slate-700 border border-slate-300 shadow-2xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {hasBeds ? (lang === 'en' ? 'Hold Bed' : 'होल्ड करें') : (lang === 'en' ? 'Full' : 'उपलब्ध नहीं')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Card Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Facilities dropdown button */}
          <button
            id={`btn-toggle-facilities-${hospital.id}`}
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Hospital Facilities & Capabilities' : 'सुविधाएं और उपकरण'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            {/* Call Emergency Desk */}
            <a
              id={`btn-call-desk-${hospital.id}`}
              href={`tel:${hospital.emergencyDesk.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium text-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-slate-600" />
              <span>{lang === 'en' ? 'Call Emergency Desk' : 'इमर्जेंसी कॉल'}</span>
            </a>

            {/* Hold Highest Need Available Bed */}
            <button
              id={`btn-primary-reserve-${hospital.id}`}
              onClick={() => {
                // select highlighted bed or first available ICU/ventilator
                const preferred: BedType = (highlightBedType && highlightBedType !== 'all') ? highlightBedType : 'icu';
                const chosen = hospital.beds[preferred].available > 0 ? preferred : 'general';
                onReserve(hospital, chosen);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium text-xs transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'en' ? 'Reserve 30-Min Hold' : '30-मिनट बेड होल्ड'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Facilities details */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-100 animate-in fade-in duration-150 space-y-2">
            <p className="text-xs font-semibold text-slate-700">
              {lang === 'en' ? 'Certified Capabilities:' : 'विशेष सुविधाएं:'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hospital.facilities.map((fac, idx) => (
                <span
                  key={idx}
                  className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {fac}
                </span>
              ))}
            </div>

            <div className="text-xs text-slate-500 pt-1 flex flex-wrap gap-4">
              <span>
                <strong>{lang === 'en' ? 'General Helpline:' : 'हेल्पलाइन:'}</strong> {hospital.helpline}
              </span>
              <span>
                <strong>{lang === 'en' ? 'Ambulance:' : 'एम्बुलेंस:'}</strong> {hospital.ambulanceContact}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
