import React, { useState, useEffect, useMemo } from 'react';
import { Hospital, BedType, HospitalType, BedReservation, TriageAnalysis, TelemetryEvent } from './types.js';
import { BED_TYPE_LABELS, INITIAL_HOSPITALS } from './data/initialHospitals.js';
import { Navbar } from './components/Navbar.js';
import { TelemetryStats } from './components/TelemetryStats.js';
import { TriageAgentBar } from './components/TriageAgentBar.js';
import { HospitalCard } from './components/HospitalCard.js';
import { BedReservationModal } from './components/BedReservationModal.js';
import { ActiveReservationsModal } from './components/ActiveReservationsModal.js';
import { LiveTelemetryFeed } from './components/LiveTelemetryFeed.js';
import { Search, Filter, SlidersHorizontal, MapPin, Building, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react';

export default function App() {
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [activeReservations, setActiveReservations] = useState<BedReservation[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSimulating, setIsSimulating] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBedType, setSelectedBedType] = useState<BedType | 'all'>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [selectedHospitalType, setSelectedHospitalType] = useState<HospitalType | 'all'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'distance' | 'available' | 'eta'>('distance');

  // Triage state
  const [isTriaging, setIsTriaging] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageAnalysis | null>(null);

  // Reservation Modals
  const [reserveModalData, setReserveModalData] = useState<{
    hospital: Hospital;
    bedType: BedType;
  } | null>(null);
  const [isOpenHoldsModal, setIsOpenHoldsModal] = useState(false);

  // Fetch live hospitals data from server
  const fetchHospitalData = async () => {
    setIsLoadingData(true);
    try {
      const res = await fetch('/api/hospitals');
      if (res.ok) {
        const data = await res.json();
        if (data.hospitals) setHospitals(data.hospitals);
        if (data.telemetry) setTelemetryEvents(data.telemetry);
        if (data.stats?.lastSyncTime) setLastSyncTime(data.stats.lastSyncTime);
      }
    } catch (err) {
      console.error('Failed to fetch hospital telemetry:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Fetch active user reservations
  const fetchReservations = async () => {
    try {
      const res = await fetch('/api/reservations');
      if (res.ok) {
        const data = await res.json();
        if (data.reservations) setActiveReservations(data.reservations);
      }
    } catch (err) {
      console.error('Failed to fetch reservations:', err);
    }
  };

  useEffect(() => {
    fetchHospitalData();
    fetchReservations();
  }, []);

  // Periodic polling for live bed updates when simulation is active
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      fetchHospitalData();
      fetchReservations();
    }, 12000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Aggregate metrics
  const stats = useMemo(() => {
    let availableTotal = 0;
    let icu = 0;
    let ventilator = 0;
    let oxygen = 0;

    hospitals.forEach((h) => {
      Object.values(h.beds).forEach((b) => {
        availableTotal += b.available;
      });
      icu += h.beds.icu.available;
      ventilator += h.beds.ventilator.available;
      oxygen += h.beds.oxygen.available;
    });

    return { availableTotal, icu, ventilator, oxygen };
  }, [hospitals]);

  // Unique areas for dropdown
  const areas = useMemo(() => {
    const set = new Set<string>();
    hospitals.forEach((h) => set.add(h.area));
    return Array.from(set);
  }, [hospitals]);

  // Filtered & Sorted hospitals
  const filteredHospitals = useMemo(() => {
    return hospitals
      .filter((h) => {
        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = h.name.toLowerCase().includes(q);
          const matchArea = h.area.toLowerCase().includes(q);
          const matchAddress = h.address.toLowerCase().includes(q);
          const matchFacilities = h.facilities.some((f) => f.toLowerCase().includes(q));
          if (!matchName && !matchArea && !matchAddress && !matchFacilities) return false;
        }

        // Area filter
        if (selectedArea !== 'all' && h.area !== selectedArea) return false;

        // Hospital Type filter
        if (selectedHospitalType !== 'all' && h.type !== selectedHospitalType) return false;

        // Selected bed type filter
        if (selectedBedType !== 'all' && h.beds[selectedBedType].available <= 0) {
          if (onlyAvailable) return false;
        }

        // Only Available filter
        if (onlyAvailable) {
          const totalAvailInHosp = Object.values(h.beds).reduce((acc, b) => acc + b.available, 0);
          if (totalAvailInHosp === 0) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // If triage has recommended hospital IDs, float them to top
        if (triageResult?.suggestedHospitalIds) {
          const aIndex = triageResult.suggestedHospitalIds.indexOf(a.id);
          const bIndex = triageResult.suggestedHospitalIds.indexOf(b.id);
          if (aIndex !== -1 && bIndex === -1) return -1;
          if (bIndex !== -1 && aIndex === -1) return 1;
        }

        if (sortBy === 'distance') {
          return a.distanceKm - b.distanceKm;
        }
        if (sortBy === 'eta') {
          return a.etaMinutes - b.etaMinutes;
        }
        if (sortBy === 'available') {
          const totalA = selectedBedType === 'all'
            ? Object.values(a.beds).reduce((sum, b) => sum + b.available, 0)
            : a.beds[selectedBedType].available;
          const totalB = selectedBedType === 'all'
            ? Object.values(b.beds).reduce((sum, b) => sum + b.available, 0)
            : b.beds[selectedBedType].available;
          return totalB - totalA;
        }
        return 0;
      });
  }, [hospitals, searchQuery, selectedArea, selectedHospitalType, selectedBedType, onlyAvailable, sortBy, triageResult]);

  // Execute Triage Agent
  const handleRunTriage = async (query: string, age?: number) => {
    setIsTriaging(true);
    try {
      const res = await fetch('/api/triage-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, patientAge: age }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          setTriageResult(data.analysis);
          setSelectedBedType(data.analysis.recommendedBedType);
        }
      }
    } catch (err) {
      console.error('Triage agent error:', err);
    } finally {
      setIsTriaging(false);
    }
  };

  const handleClearTriage = () => {
    setTriageResult(null);
    setSelectedBedType('all');
  };

  // Open Bed Reservation Modal
  const handleOpenReserve = (hospital: Hospital, bedType: BedType) => {
    setReserveModalData({ hospital, bedType });
  };

  // Confirm Reservation API Call
  const handleConfirmReservation = async (reservationData: {
    hospitalId: string;
    bedType: BedType;
    patientName: string;
    patientAge: number;
    contactNumber: string;
    conditionNotes?: string;
  }): Promise<BedReservation | null> => {
    const res = await fetch('/api/reserve-bed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...reservationData,
        urgencyLevel: triageResult?.urgencyLevel || 'CRITICAL_EMERGENCY',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to hold bed');
    }

    const data = await res.json();
    if (data.reservation) {
      setActiveReservations((prev) => [data.reservation, ...prev]);
      // Update local hospital bed count immediately
      setHospitals((prev) =>
        prev.map((h) => (h.id === data.hospital.id ? data.hospital : h))
      );
      return data.reservation;
    }
    return null;
  };

  // Cancel / Release Bed Reservation
  const handleCancelHold = async (reservationId: string) => {
    try {
      const res = await fetch('/api/cancel-reservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId }),
      });
      if (res.ok) {
        setActiveReservations((prev) =>
          prev.map((r) => (r.reservationId === reservationId ? { ...r, status: 'cancelled' } : r))
        );
        fetchHospitalData();
      }
    } catch (err) {
      console.error('Failed to cancel hold:', err);
    }
  };

  const activeHoldCount = activeReservations.filter((r) => r.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-200">
      {/* Navbar */}
      <Navbar
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        onRefresh={fetchHospitalData}
        isRefreshing={isLoadingData}
        activeHoldCount={activeHoldCount}
        onOpenHolds={() => setIsOpenHoldsModal(true)}
        lang={lang}
        onToggleLang={() => setLang(lang === 'en' ? 'hi' : 'en')}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* City-Wide Telemetry Stats */}
        <TelemetryStats
          totalAvailable={stats.availableTotal}
          totalIcu={stats.icu}
          totalVentilator={stats.ventilator}
          totalOxygen={stats.oxygen}
          selectedBedType={selectedBedType}
          onSelectBedType={setSelectedBedType}
          lang={lang}
        />

        {/* Emergency Triage & Bed Allocation Agent */}
        <TriageAgentBar
          onRunTriage={handleRunTriage}
          isLoading={isTriaging}
          triageResult={triageResult}
          onClearTriage={handleClearTriage}
          lang={lang}
        />

        {/* Live Activity & Telemetry Feed */}
        <LiveTelemetryFeed events={telemetryEvents} lang={lang} />

        {/* Search & Control Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-hospitals"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Search hospital name, location, or facility (e.g. Cath Lab, Bandra, Apex)...'
                    : 'अस्पताल का नाम, स्थान या सुविधा खोजें...'
                }
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-800"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Area Selector */}
              <div className="relative">
                <select
                  id="select-area-filter"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  aria-label={lang === 'en' ? 'Filter by Area' : 'क्षेत्र चुनें'}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-7 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                >
                  <option value="all">{lang === 'en' ? 'All Areas' : 'सभी क्षेत्र'}</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hospital Type Selector */}
              <div className="relative">
                <select
                  id="select-type-filter"
                  value={selectedHospitalType}
                  onChange={(e) => setSelectedHospitalType(e.target.value as HospitalType | 'all')}
                  aria-label={lang === 'en' ? 'Filter by Hospital Type' : 'अस्पताल प्रकार'}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-7 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                >
                  <option value="all">{lang === 'en' ? 'All Facility Types' : 'सभी अस्पताल प्रकार'}</option>
                  <option value="trauma_center">{lang === 'en' ? 'Trauma Center' : 'ट्रॉमा सेंटर'}</option>
                  <option value="government">{lang === 'en' ? 'Government' : 'सरकारी अस्पताल'}</option>
                  <option value="trust">{lang === 'en' ? 'Charitable Trust' : 'चैरिटेबल ट्रस्ट'}</option>
                  <option value="private">{lang === 'en' ? 'Private Super-Specialty' : 'प्राइवेट'}</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="relative">
                <select
                  id="select-sort-filter"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label={lang === 'en' ? 'Sort Hospitals' : 'क्रमबद्ध करें'}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-7 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                >
                  <option value="distance">{lang === 'en' ? 'Sort: Nearest Distance' : 'निकटतम दूरी'}</option>
                  <option value="eta">{lang === 'en' ? 'Sort: Fastest ETA' : 'न्यूनतम समय (ETA)'}</option>
                  <option value="available">{lang === 'en' ? 'Sort: Most Available Beds' : 'सर्वाधिक उपलब्ध बेड'}</option>
                </select>
              </div>

              {/* Only Available Toggle */}
              <button
                id="btn-toggle-only-available"
                type="button"
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  onlyAvailable
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {lang === 'en' ? 'Only With Vacant Beds' : 'केवल उपलब्ध बेड वाले'}
              </button>
            </div>
          </div>

          {/* Quick Bed Category Pill Filter */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 uppercase">
              {lang === 'en' ? 'Bed Type:' : 'बेड प्रकार:'}
            </span>
            <button
              id="pill-bed-all"
              onClick={() => setSelectedBedType('all')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                selectedBedType === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'en' ? 'All Beds' : 'सभी'}
            </button>
            {(['icu', 'ventilator', 'oxygen', 'general', 'pediatric', 'isolation'] as BedType[]).map((bt) => (
              <button
                key={bt}
                id={`pill-bed-${bt}`}
                onClick={() => setSelectedBedType(selectedBedType === bt ? 'all' : bt)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  selectedBedType === bt
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {BED_TYPE_LABELS[bt].label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {lang === 'en' ? 'Showing' : 'दिखा रहे हैं'}{' '}
            <strong className="text-slate-800">{filteredHospitals.length}</strong>{' '}
            {lang === 'en' ? 'verified hospital facilities' : 'सत्यापित अस्पताल'}
          </span>
          {triageResult && (
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {lang === 'en' ? 'Triage Priority Match Active' : 'ट्रायज प्राथमिकता सक्रिय'}
            </span>
          )}
        </div>

        {/* Hospitals List */}
        {filteredHospitals.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">
              {lang === 'en' ? 'No Matching Hospitals Found' : 'कोई अस्पताल नहीं मिला'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {lang === 'en'
                ? 'Try broadening your filters, choosing "All Areas", or de-selecting "Only With Vacant Beds".'
                : 'फ़िल्टर बदलें या "सभी क्षेत्र" चुनें।'}
            </p>
            <button
              id="btn-reset-filters"
              onClick={() => {
                setSearchQuery('');
                setSelectedArea('all');
                setSelectedHospitalType('all');
                setSelectedBedType('all');
                setOnlyAvailable(false);
                setTriageResult(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Reset All Filters' : 'सभी फ़िल्टर रीसेट करें'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHospitals.map((hospital) => (
              <HospitalCard
                key={hospital.id}
                hospital={hospital}
                onReserve={handleOpenReserve}
                highlightBedType={selectedBedType}
                isSuggested={triageResult?.suggestedHospitalIds?.includes(hospital.id)}
                lang={lang}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-700">
            {lang === 'en'
              ? 'Hospital Bed Availability Monitoring Agent'
              : 'अस्पताल बेड उपलब्धता निगरानी प्रणाली'}
          </p>
          <p className="text-slate-400 text-[11px]">
            {lang === 'en'
              ? 'Real-time telemetry and clinical allocation assistance for patients in emergency transit. For life-threatening crises, immediately dial 108.'
              : 'आपातकालीन परिस्थितियों में तत्काल सहायता के लिए 108 डायल करें।'}
          </p>
        </div>
      </footer>

      {/* Bed Reservation Modal */}
      {reserveModalData && (
        <BedReservationModal
          hospital={reserveModalData.hospital}
          bedType={reserveModalData.bedType}
          onClose={() => setReserveModalData(null)}
          onConfirmReservation={handleConfirmReservation}
          initialCondition={triageResult?.clinicalRationale || ''}
          lang={lang}
        />
      )}

      {/* Active Holds Drawer / Modal */}
      <ActiveReservationsModal
        isOpen={isOpenHoldsModal}
        onClose={() => setIsOpenHoldsModal(false)}
        reservations={activeReservations}
        onCancelHold={handleCancelHold}
        lang={lang}
      />
    </div>
  );
}
