import React, { useState, useEffect } from 'react';
import { BedReservation } from '../types.js';
import { X, Clock, ShieldCheck, Phone, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ActiveReservationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservations: BedReservation[];
  onCancelHold: (reservationId: string) => Promise<void>;
  lang: 'en' | 'hi';
}

export const ActiveReservationsModal: React.FC<ActiveReservationsModalProps> = ({
  isOpen,
  onClose,
  reservations,
  onCancelHold,
  lang,
}) => {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen) return null;

  const activeReservations = reservations.filter(r => r.status === 'active');

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - nowTime;
    if (diff <= 0) return 'Expired';
    const mins = Math.floor(diff / (60 * 1000));
    const secs = Math.floor((diff % (60 * 1000)) / 1000);
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await onCancelHold(id);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'en' ? 'My Active Bed Holds' : 'मेरे सक्रिय बेड होल्ड'}
            </h3>
          </div>
          <button
            id="btn-close-active-holds-modal"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-3">
          {activeReservations.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {lang === 'en' ? 'No Active Emergency Bed Holds' : 'कोई सक्रिय बेड होल्ड नहीं है'}
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {lang === 'en'
                  ? 'When you reserve a bed at any hospital, your 30-minute guaranteed transit lock slip will appear here.'
                  : 'किसी भी अस्पताल में बेड होल्ड करने पर आपका 30 मिनट का टोकन यहां दिखाई देगा।'}
              </p>
            </div>
          ) : (
            activeReservations.map((res) => {
              const remaining = getRemainingTime(res.expiresAt);
              const isExpiringSoon = remaining !== 'Expired' && remaining.startsWith('0m') || remaining.startsWith('1m') || remaining.startsWith('2m');

              return (
                <div
                  key={res.reservationId}
                  id={`reservation-card-${res.reservationId}`}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {res.reservationId}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{res.hospitalName}</h4>
                      <p className="text-xs text-slate-500">
                        {lang === 'en' ? 'Bed Type:' : 'बेड प्रकार:'}{' '}
                        <strong className="uppercase text-slate-700">{res.bedType}</strong> • {res.patientName} ({res.patientAge}y)
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${
                          isExpiringSoon
                            ? 'bg-rose-100 text-rose-700 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {remaining}
                      </span>
                    </div>
                  </div>

                  {res.conditionNotes && (
                    <p className="text-xs text-slate-600 bg-white p-2 rounded border border-slate-200/80 italic">
                      "{res.conditionNotes}"
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
                    <span className="text-slate-500">
                      {lang === 'en' ? 'Attendant Contact:' : 'संपर्क:'} {res.contactNumber}
                    </span>

                    <button
                      id={`btn-release-hold-${res.reservationId}`}
                      type="button"
                      disabled={cancellingId === res.reservationId}
                      onClick={() => handleCancel(res.reservationId)}
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 font-semibold text-xs transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{cancellingId === res.reservationId ? 'Releasing...' : (lang === 'en' ? 'Release Bed' : 'बेड मुक्त करें')}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
