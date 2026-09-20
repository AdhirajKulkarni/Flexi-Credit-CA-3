import React, { useState } from 'react';
import { Sparkles, Send, AlertCircle, ShieldAlert, CheckCircle2, X, ChevronDown, HeartPulse, Stethoscope, Baby } from 'lucide-react';
import { BedType, TriageAnalysis } from '../types.js';

interface TriageAgentBarProps {
  onRunTriage: (query: string, age?: number) => Promise<void>;
  isLoading: boolean;
  triageResult: TriageAnalysis | null;
  onClearTriage: () => void;
  lang: 'en' | 'hi';
}

export const TriageAgentBar: React.FC<TriageAgentBarProps> = ({
  onRunTriage,
  isLoading,
  triageResult,
  onClearTriage,
  lang,
}) => {
  const [inputQuery, setInputQuery] = useState('');
  const [patientAge, setPatientAge] = useState<string>('');

  const quickScenarios = [
    {
      label: lang === 'en' ? 'Critical SPO2 < 88% (Breathless)' : 'कम SPO2 < 88% (सांस फूलना)',
      query: 'Patient SPO2 dropped to 86%, severe dyspnea, gasping for air, elderly patient 68 years',
      age: 68,
      type: 'ventilator' as BedType,
    },
    {
      label: lang === 'en' ? 'Acute Chest Pain / Cardiac' : 'सीने में तेज दर्द / कार्डियक',
      query: 'Acute crushing retrosternal chest pain radiating to left arm, sweating, BP 85/50, urgent ICU required',
      age: 55,
      type: 'icu' as BedType,
    },
    {
      label: lang === 'en' ? 'Pediatric Respiratory Distress' : 'शिशु / बच्चे को सांस में तकलीफ',
      query: '4-year-old child with severe wheezing, retractions, continuous fever, SPO2 90%',
      age: 4,
      type: 'pediatric' as BedType,
    },
    {
      label: lang === 'en' ? 'High Oxygen Support Required' : 'ऑक्सीजन सपोर्ट बेड की जरूरत',
      query: 'Chronic lung condition COPD flare-up, needs continuous high flow oxygen support bed',
      age: 62,
      type: 'oxygen' as BedType,
    },
    {
      label: lang === 'en' ? 'Severe Road Accident / Trauma' : 'सड़क दुर्घटना / गंभीर चोट',
      query: 'Head trauma and multiple fractures from road accident, unconscious, level 1 trauma center needed',
      age: 32,
      type: 'icu' as BedType,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    onRunTriage(inputQuery.trim(), patientAge ? Number(patientAge) : undefined);
  };

  const handleChipClick = (scenario: typeof quickScenarios[0]) => {
    setInputQuery(scenario.query);
    setPatientAge(scenario.age ? String(scenario.age) : '');
    onRunTriage(scenario.query, scenario.age);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              {lang === 'en' ? 'Emergency Bed Allocation Agent' : 'आपातकालीन बेड आवंटन एजेंट'}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Describe patient condition or vitals for instant clinical triage & available bed matching'
                : 'रोगी की स्थिति या SPO2/बीपी दर्ज करें - तुरंत सही बेड और निकटतम अस्पताल प्राप्त करें'}
            </p>
          </div>
        </div>

        {triageResult && (
          <button
            id="btn-clear-triage-filter"
            onClick={onClearTriage}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>{lang === 'en' ? 'Clear Triage Filter' : 'फ़िल्टर हटाएं'}</span>
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <input
              id="input-triage-query"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'e.g. "Elderly 68y, SPO2 84%, severe breathlessness, needs urgent ventilator bed near Bandra"'
                  : 'उदा. "68 वर्ष मरीज, SPO2 84%, सांस लेने में भारी तकलीफ, वेंटिलेटर या ICU बेड चाहिए"'
              }
              className="w-full pl-3.5 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-800 transition-all"
            />
          </div>

          <div className="w-full sm:w-24">
            <input
              id="input-patient-age"
              type="number"
              min="0"
              max="120"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              placeholder={lang === 'en' ? 'Age' : 'उम्र'}
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-800"
            />
          </div>

          <button
            id="btn-submit-triage"
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs shrink-0"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{lang === 'en' ? 'Triaging...' : 'जांच रहे हैं...'}</span>
              </span>
            ) : (
              <>
                <Send className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'en' ? 'Find Matching Beds' : 'बेड खोजें'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Scenario Chips */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            {lang === 'en' ? 'Quick Clinical Scenarios:' : 'त्वरित आपातकालीन स्थितियां:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickScenarios.map((sc, idx) => (
              <button
                key={idx}
                id={`btn-scenario-${idx}`}
                type="button"
                onClick={() => handleChipClick(sc)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Triage Assessment Card */}
        {triageResult && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    triageResult.urgencyLevel === 'CRITICAL_EMERGENCY'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : triageResult.urgencyLevel === 'HIGH_PRIORITY'
                      ? 'bg-amber-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {triageResult.urgencyLevel.replace('_', ' ')}
                </span>

                <span className="text-xs font-semibold text-slate-700">
                  {lang === 'en' ? 'Recommended Bed Type:' : 'अनुशंसित बेड प्रकार:'}{' '}
                  <span className="text-slate-900 font-bold uppercase px-2 py-0.5 rounded bg-white border border-slate-200">
                    {triageResult.recommendedBedType}
                  </span>
                </span>
              </div>

              {triageResult.vitalAlerts.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {triageResult.vitalAlerts.map((va, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium"
                    >
                      {va}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Rationale & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="md:col-span-2">
                <p className="font-semibold text-slate-800 mb-1">
                  {lang === 'en' ? 'Agent Clinical Rationale:' : 'एजेंट नैदानिक मूल्यांकन:'}
                </p>
                <p className="text-slate-600 leading-relaxed">{triageResult.clinicalRationale}</p>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {lang === 'en' ? 'Immediate Transit Actions:' : 'तत्काल आवश्यक कदम:'}
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                  {triageResult.immediateActions.map((act, idx) => (
                    <li key={idx}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
