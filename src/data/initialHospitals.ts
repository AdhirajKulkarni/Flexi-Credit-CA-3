import { Hospital, BedType } from '../types.js';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'City Apex Multi-Speciality & Trauma Centre',
    type: 'trauma_center',
    area: 'Central District',
    address: '42 Medical Enclave, Central Ave, Near Metro Gate 3',
    distanceKm: 2.4,
    etaMinutes: 8,
    helpline: '+91 22 2450 1100',
    emergencyDesk: '+91 22 2450 1199',
    ambulanceContact: '108',
    coordinates: { lat: 19.076, lng: 72.8777 },
    oxygenStatus: 'adequate',
    facilities: ['24/7 Level-1 Trauma', 'Cardiac Cath Lab', 'CT/MRI Emergency', 'Blood Bank', 'Dedicated Stroke Unit'],
    lastVerified: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    beds: {
      icu: { total: 40, available: 6, occupied: 32, reserved: 2, lastUpdated: '3 mins ago' },
      ventilator: { total: 24, available: 3, occupied: 20, reserved: 1, lastUpdated: '2 mins ago' },
      oxygen: { total: 80, available: 18, occupied: 60, reserved: 2, lastUpdated: '5 mins ago' },
      general: { total: 160, available: 42, occupied: 114, reserved: 4, lastUpdated: '1 min ago' },
      pediatric: { total: 25, available: 4, occupied: 20, reserved: 1, lastUpdated: '8 mins ago' },
      isolation: { total: 20, available: 5, occupied: 15, reserved: 0, lastUpdated: '4 mins ago' }
    }
  },
  {
    id: 'hosp-2',
    name: 'Metropolitan Government General Hospital',
    type: 'government',
    area: 'South District',
    address: '88 Civil Hospital Road, South Hub',
    distanceKm: 4.1,
    etaMinutes: 14,
    helpline: '+91 22 2261 4000',
    emergencyDesk: '+91 22 2261 4108',
    ambulanceContact: '102 / 108',
    coordinates: { lat: 18.940, lng: 72.835 },
    oxygenStatus: 'adequate',
    facilities: ['Free Government Scheme (Ayushman Bharat)', '24/7 Emergency Wing', 'Central Oxygen Grid', 'High-Risk Delivery', 'Burn Unit'],
    lastVerified: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    beds: {
      icu: { total: 60, available: 2, occupied: 56, reserved: 2, lastUpdated: '4 mins ago' },
      ventilator: { total: 35, available: 1, occupied: 33, reserved: 1, lastUpdated: '3 mins ago' },
      oxygen: { total: 150, available: 29, occupied: 118, reserved: 3, lastUpdated: '6 mins ago' },
      general: { total: 320, available: 84, occupied: 230, reserved: 6, lastUpdated: '2 mins ago' },
      pediatric: { total: 40, available: 8, occupied: 31, reserved: 1, lastUpdated: '12 mins ago' },
      isolation: { total: 30, available: 11, occupied: 18, reserved: 1, lastUpdated: '9 mins ago' }
    }
  },
  {
    id: 'hosp-3',
    name: 'St. Jude Memorial Charitable Trust Hospital',
    type: 'trust',
    area: 'Western Suburbs',
    address: '15 Hill Road, Bandra West',
    distanceKm: 5.8,
    etaMinutes: 18,
    helpline: '+91 22 2640 5500',
    emergencyDesk: '+91 22 2640 5524',
    ambulanceContact: '+91 22 2640 5599',
    coordinates: { lat: 19.054, lng: 72.840 },
    oxygenStatus: 'adequate',
    facilities: ['Subsidized Emergency Care', 'NICU & PICU Specialist', 'Advanced Critical Care', 'Dialysis Unit'],
    lastVerified: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    beds: {
      icu: { total: 28, available: 5, occupied: 22, reserved: 1, lastUpdated: '1 min ago' },
      ventilator: { total: 16, available: 4, occupied: 11, reserved: 1, lastUpdated: '1 min ago' },
      oxygen: { total: 65, available: 14, occupied: 49, reserved: 2, lastUpdated: '4 mins ago' },
      general: { total: 110, available: 26, occupied: 82, reserved: 2, lastUpdated: '3 mins ago' },
      pediatric: { total: 30, available: 7, occupied: 22, reserved: 1, lastUpdated: '5 mins ago' },
      isolation: { total: 15, available: 4, occupied: 11, reserved: 0, lastUpdated: '7 mins ago' }
    }
  },
  {
    id: 'hosp-4',
    name: 'Lifeline Super-Specialty Heart & Lung Institute',
    type: 'private',
    area: 'Eastern Corridor',
    address: 'Plot 7B, Eastern Express Highway, Chembur',
    distanceKm: 7.2,
    etaMinutes: 22,
    helpline: '+91 22 2520 9000',
    emergencyDesk: '+91 22 2520 9100',
    ambulanceContact: '+91 22 2520 9999',
    coordinates: { lat: 19.062, lng: 72.899 },
    oxygenStatus: 'adequate',
    facilities: ['ECMO Facility', 'Emergency Cardiac Catheterization', 'Dedicated Pulmonology ICU', 'Rapid Airway Response Team'],
    lastVerified: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    beds: {
      icu: { total: 35, available: 8, occupied: 26, reserved: 1, lastUpdated: 'Just now' },
      ventilator: { total: 20, available: 5, occupied: 14, reserved: 1, lastUpdated: 'Just now' },
      oxygen: { total: 55, available: 16, occupied: 38, reserved: 1, lastUpdated: '2 mins ago' },
      general: { total: 90, available: 31, occupied: 57, reserved: 2, lastUpdated: '2 mins ago' },
      pediatric: { total: 15, available: 3, occupied: 12, reserved: 0, lastUpdated: '10 mins ago' },
      isolation: { total: 12, available: 3, occupied: 9, reserved: 0, lastUpdated: '5 mins ago' }
    }
  },
  {
    id: 'hosp-5',
    name: 'Northgate District Trauma & Pediatric Center',
    type: 'trauma_center',
    area: 'Northern Suburbs',
    address: '104 Link Road, Borivali West',
    distanceKm: 11.5,
    etaMinutes: 28,
    helpline: '+91 22 2890 3300',
    emergencyDesk: '+91 22 2890 3399',
    ambulanceContact: '108',
    coordinates: { lat: 19.230, lng: 72.856 },
    oxygenStatus: 'moderate',
    facilities: ['Level-1 Pediatric Trauma', 'Neonatal Intensive Care (NICU)', '24/7 Surgical Theatre', 'Blood Bank'],
    lastVerified: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    beds: {
      icu: { total: 30, available: 3, occupied: 26, reserved: 1, lastUpdated: '3 mins ago' },
      ventilator: { total: 18, available: 2, occupied: 15, reserved: 1, lastUpdated: '3 mins ago' },
      oxygen: { total: 70, available: 12, occupied: 56, reserved: 2, lastUpdated: '7 mins ago' },
      general: { total: 130, available: 38, occupied: 90, reserved: 2, lastUpdated: '4 mins ago' },
      pediatric: { total: 35, available: 11, occupied: 23, reserved: 1, lastUpdated: '2 mins ago' },
      isolation: { total: 18, available: 6, occupied: 12, reserved: 0, lastUpdated: '6 mins ago' }
    }
  },
  {
    id: 'hosp-6',
    name: 'National Medical College & Research Hospital',
    type: 'government',
    area: 'Central District',
    address: 'Dr. AL Nair Road, Mumbai Central',
    distanceKm: 3.5,
    etaMinutes: 11,
    helpline: '+91 22 2302 7000',
    emergencyDesk: '+91 22 2302 7100',
    ambulanceContact: '108',
    coordinates: { lat: 18.972, lng: 72.822 },
    oxygenStatus: 'adequate',
    facilities: ['Apex Government Referral Hospital', 'Comprehensive Trauma Unit', 'Neuro ICU', 'Oncology Ward'],
    lastVerified: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    beds: {
      icu: { total: 50, available: 4, occupied: 44, reserved: 2, lastUpdated: '5 mins ago' },
      ventilator: { total: 30, available: 2, occupied: 27, reserved: 1, lastUpdated: '5 mins ago' },
      oxygen: { total: 140, available: 24, occupied: 112, reserved: 4, lastUpdated: '8 mins ago' },
      general: { total: 280, available: 65, occupied: 210, reserved: 5, lastUpdated: '3 mins ago' },
      pediatric: { total: 45, available: 9, occupied: 35, reserved: 1, lastUpdated: '11 mins ago' },
      isolation: { total: 25, available: 7, occupied: 18, reserved: 0, lastUpdated: '7 mins ago' }
    }
  }
];

export const BED_TYPE_LABELS: Record<BedType, { label: string; short: string; desc: string }> = {
  icu: { label: 'Intensive Care Unit (ICU)', short: 'ICU', desc: 'Critical monitoring, multiorgan support' },
  ventilator: { label: 'ICU with Ventilator', short: 'Ventilator', desc: 'Invasive/non-invasive mechanical ventilation' },
  oxygen: { label: 'Oxygen Supported Bed', short: 'Oxygen (O₂)', desc: 'High-flow nasal cannula or mask oxygen' },
  general: { label: 'General / Step-Down Ward', short: 'General Ward', desc: 'Standard medical admission & observation' },
  pediatric: { label: 'Pediatric / Neonatal ICU', short: 'PICU / NICU', desc: 'Specialized infant and child critical care' },
  isolation: { label: 'Isolation / Infectious Ward', short: 'Isolation', desc: 'Negative pressure & infectious disease containment' },
};
