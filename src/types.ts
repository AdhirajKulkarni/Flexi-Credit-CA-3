export type BedType = 'icu' | 'ventilator' | 'oxygen' | 'general' | 'pediatric' | 'isolation';

export type HospitalType = 'government' | 'private' | 'trust' | 'trauma_center';

export type OxygenSupplyStatus = 'adequate' | 'moderate' | 'critical';

export interface BedCategoryInfo {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  lastUpdated: string;
}

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType;
  area: string;
  address: string;
  distanceKm: number;
  etaMinutes: number;
  helpline: string;
  emergencyDesk: string;
  ambulanceContact: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  beds: Record<BedType, BedCategoryInfo>;
  oxygenStatus: OxygenSupplyStatus;
  facilities: string[];
  lastVerified: string;
}

export interface BedReservation {
  reservationId: string;
  hospitalId: string;
  hospitalName: string;
  patientName: string;
  patientAge: number;
  contactNumber: string;
  bedType: BedType;
  urgencyLevel: 'CRITICAL_EMERGENCY' | 'HIGH_PRIORITY' | 'STANDARD_URGENT';
  conditionNotes?: string;
  timestamp: string;
  expiresAt: string;
  status: 'active' | 'admitted' | 'cancelled' | 'expired';
}

export interface TriageAnalysis {
  urgencyLevel: 'CRITICAL_EMERGENCY' | 'HIGH_PRIORITY' | 'STANDARD_URGENT';
  recommendedBedType: BedType;
  clinicalRationale: string;
  immediateActions: string[];
  vitalAlerts: string[];
  suggestedHospitalIds: string[];
}

export interface TelemetryEvent {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bedType: BedType;
  eventType: 'freed' | 'admitted' | 'reserved' | 'critical_alert';
  message: string;
  timestamp: string;
}
