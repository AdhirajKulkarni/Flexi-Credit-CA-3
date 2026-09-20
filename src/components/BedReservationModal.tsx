import React, { useState, useEffect } from 'react';
import { Hospital, BedType, BedReservation } from '../types.js';
import { BED_TYPE_LABELS } from '../data/initialHospitals.js';
import { X, Clock, ShieldCheck, Phone, CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';

interface BedReservationModalProps {
  hospital: Hospital | null;
  bedType: BedType;
  onClose: () => void;
  onConfirmReservation: (data: {
    hospitalId: string;
    bedType: BedType;
    patientName: string;
    patientAge: number;
    contactNumber: string;
    conditionNotes?: string;
  }) => Promise<BedReservation | null>;
  initialCondition?: string;
  lang: 'en' | 'hi';
}

export const BedReservationModal: React.FC<BedReservationModalProps> = ({
  hospital,
  bedType,
  onClose,
  onConfirmReservation,
  initialCondition = '',
  lang,
}) => {
  const [selectedBed, setSelectedBed] = useState<BedType>(bedType);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [notes, setNotes] = useState(initialCondition);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedHold, setConfirmedHold] = useState<BedReservation | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setSelectedBed(bedType);
  }, [bedType]);

  if (!hospital) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !contactNumber.trim()) {
      setErrorMsg(lang === 'en' ? 'Please enter patient name and contact number.' : 'कृपया मरीज का नाम और मोबाइल नंबर दर्ज करें।');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await onConfirmReservation({
        hospitalId: hospital.id,
        bedType: selectedBed,
        patientName: patientName.trim(),
        patientAge: patientAge ? Number(patientAge) : 45,
        contactNumber: contactNumber.trim(),
        conditionNotes: notes.trim(),
      });
      if (result) {
        setConfirmedHold(result);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to hold bed. Please try again or call emergency desk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySlip = () => {
    if (!confirmedHold) return;
    const text = `EMERGENCY BED HOLD VERIFICATION
Token: ${confirmedHold.reservationId}
Hospital: ${confirmedHold.hospitalName}
Bed Type: ${confirmedHold.bedType.toUpperCase()}
Patient: ${confirmedHold.patientName} (Age: ${confirmedHold.patientAge})
Emergency Contact: ${confirmedHold.contactNumber}
Emergency Desk: ${hospital.emergencyDesk}
Status: Confirmed Active 30-Min Transit Hold`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {confirmedHold
                  ? lang === 'en' ? 'Emergency Bed Hold Confirmed' : 'आपातकालीन बेड होल्ड पुष्ट'
                  : lang === 'en' ? 'Request 30-Min Emergency Hold' : '30-मिनट आपातकालीन बेड होल्ड'}
              </h3>
              <p className="text-xs text-slate-500">{hospital.name}</p>
            </div>
          </div>
          <button
            id="btn-close-reservation-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {confirmedHold ? (
            /* Confirmation Receipt View */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-emerald-900 text-sm">
                    {lang === 'en' ? 'Bed Reserved & Locked for 30 Minutes' : 'बेड 30 मिनट के लिए लॉक कर दिया गया है'}
                  </p>
                  <p className="text-emerald-700">
                    {lang === 'en'
                      ? 'The hospital emergency triage team has been electronically notified. Show this token upon arrival at the casualty triage desk.'
                      : 'अस्पताल के आपातकालीन डेस्क को सूचित कर दिया गया है। पहुंचते ही यह टोकन दिखाएं।'}
                  </p>
                </div>
              </div>

              {/* Verification Details Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                  <span className="text-slate-500">{lang === 'en' ? 'Reservation Token:' : 'आरक्षण टोकन:'}</span>
                  <span className="font-mono text-sm font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {confirmedHold.reservationId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{lang === 'en' ? 'Allocated Bed Category:' : 'बेड प्रकार:'}</span>
                  <span className="font-bold text-slate-800 uppercase">{confirmedHold.bedType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{lang === 'en' ? 'Patient Name:' : 'रोगी का नाम:'}</span>
                  <span className="font-semibold text-slate-800">
                    {confirmedHold.patientName} ({confirmedHold.patientAge}y)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{lang === 'en' ? 'Hospital Helpline:' : 'अस्पताल हेल्पलाइन:'}</span>
                  <span className="font-semibold text-slate-800">{hospital.emergencyDesk}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">{lang === 'en' ? 'Hold Expiration:' : 'होल्ड वैधता:'}</span>
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(confirmedHold.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  id="btn-copy-slip"
                  onClick={handleCopySlip}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{copied ? (lang === 'en' ? 'Copied Slip!' : 'कॉपी हो गया!') : (lang === 'en' ? 'Copy Token Slip' : 'स्लिप कॉपी करें')}</span>
                </button>

                <a
                  id="btn-direct-call-hospital"
                  href={`tel:${hospital.emergencyDesk.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'en' ? 'Call Admissions Desk' : 'एडमिशन डेस्क कॉल'}</span>
                </a>
              </div>
            </div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Bed Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {lang === 'en' ? 'Select Bed Type to Hold:' : 'होल्ड के लिए बेड प्रकार:'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['icu', 'ventilator', 'oxygen', 'general', 'pediatric', 'isolation'] as BedType[]).map((type) => {
                    const count = hospital.beds[type].available;
                    const isSelected = selectedBed === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        id={`btn-select-modal-bed-${type}`}
                        disabled={count <= 0}
                        onClick={() => setSelectedBed(type)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : count > 0
                            ? 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                            : 'border-slate-100 bg-slate-50 text-slate-400 opacity-60 cursor-not-allowed'
                        }`}
                      >
                        <div className="text-[11px] font-bold uppercase">{BED_TYPE_LABELS[type].short}</div>
                        <div className={`text-[10px] ${isSelected ? 'text-emerald-300' : count > 0 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                          {count > 0 ? `${count} avail` : 'Full'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Patient Name & Age */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'en' ? 'Patient Full Name *' : 'रोगी का पूरा नाम *'}
                  </label>
                  <input
                    id="input-reserve-patient-name"
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Rajesh Sharma' : 'उदा. राजेश शर्मा'}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {lang === 'en' ? 'Age' : 'उम्र'}
                  </label>
                  <input
                    id="input-reserve-patient-age"
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    placeholder="45"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-800"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'en' ? 'Primary Attendant Phone Number *' : 'संपर्क मोबाइल नंबर *'}
                </label>
                <input
                  id="input-reserve-contact"
                  type="tel"
                  required
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="+91 98200 XXXXX"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-800"
                />
              </div>

              {/* Symptoms / Condition Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {lang === 'en' ? 'Patient Condition / Vitals (Optional)' : 'रोगी की स्थिति / लक्षण (वैकल्पिक)'}
                </label>
                <textarea
                  id="input-reserve-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'e.g. SPO2 84%, in ambulance en route, arriving in 15 mins'
                      : 'उदा. SPO2 84%, एम्बुलेंस में रास्ते में हैं, 15 मिनट में आगमन'
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-800"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {lang === 'en'
                    ? 'Bed hold remains active for 30 minutes to facilitate ambulance transit. If admission is not processed within 30 minutes, the bed automatically re-enters emergency pool for others.'
                    : 'यह बेड 30 मिनट तक सुरक्षित रहेगा ताकि आप समय पर अस्पताल पहुंच सकें। 30 मिनट बाद बेड स्वतः अन्य जरूरतमंदों के लिए मुक्त हो जाएगा।'}
                </span>
              </div>

              {/* Submit button */}
              <div className="flex gap-2 pt-1">
                <button
                  id="btn-cancel-reservation-modal"
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  {lang === 'en' ? 'Cancel' : 'रद्द करें'}
                </button>
                <button
                  id="btn-confirm-reservation-submit"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
                >
                  {isSubmitting
                    ? lang === 'en' ? 'Securing Bed...' : 'बेड सुरक्षित कर रहे हैं...'
                    : lang === 'en' ? 'Confirm 30-Min Bed Hold' : 'बेड होल्ड की पुष्टि करें'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
