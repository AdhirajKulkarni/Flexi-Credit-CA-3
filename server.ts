import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_HOSPITALS } from './src/data/initialHospitals.js';
import { BedReservation, BedType, Hospital, TelemetryEvent, TriageAnalysis } from './src/types.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory data store
let hospitals: Hospital[] = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
let reservations: BedReservation[] = [];
let telemetryEvents: TelemetryEvent[] = [
  {
    id: 'evt-init-1',
    hospitalId: 'hosp-1',
    hospitalName: 'City Apex Multi-Speciality & Trauma Centre',
    bedType: 'icu',
    eventType: 'freed',
    message: '2 ICU beds verified available following patient discharge',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 'evt-init-2',
    hospitalId: 'hosp-4',
    hospitalName: 'Lifeline Super-Specialty Heart & Lung Institute',
    bedType: 'ventilator',
    eventType: 'admitted',
    message: 'Emergency trauma admission allocated to Ventilator Bed 04',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  }
];

// Server-side Gemini AI client initialization with telemetry headers
let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Background simulation for real-time bed movements (every 18 seconds)
setInterval(() => {
  if (hospitals.length === 0) return;
  const randomHospital = hospitals[Math.floor(Math.random() * hospitals.length)];
  const bedTypes: BedType[] = ['icu', 'ventilator', 'oxygen', 'general', 'pediatric', 'isolation'];
  const randomBedType = bedTypes[Math.floor(Math.random() * bedTypes.length)];
  const bedInfo = randomHospital.beds[randomBedType];

  const isFreeing = Math.random() > 0.45; // slightly higher chance of freeing to keep availability realistic

  if (isFreeing && bedInfo.occupied > 1) {
    bedInfo.occupied -= 1;
    bedInfo.available += 1;
    bedInfo.lastUpdated = 'Just now';
    randomHospital.lastVerified = new Date().toISOString();

    const newEvt: TelemetryEvent = {
      id: `evt-${Date.now()}`,
      hospitalId: randomHospital.id,
      hospitalName: randomHospital.name,
      bedType: randomBedType,
      eventType: 'freed',
      message: `1 ${randomBedType.toUpperCase()} bed released and sterilized at ${randomHospital.name}`,
      timestamp: new Date().toISOString(),
    };
    telemetryEvents.unshift(newEvt);
    if (telemetryEvents.length > 25) telemetryEvents.pop();
  } else if (!isFreeing && bedInfo.available > 1) {
    bedInfo.available -= 1;
    bedInfo.occupied += 1;
    bedInfo.lastUpdated = 'Just now';
    randomHospital.lastVerified = new Date().toISOString();

    const newEvt: TelemetryEvent = {
      id: `evt-${Date.now()}`,
      hospitalId: randomHospital.id,
      hospitalName: randomHospital.name,
      bedType: randomBedType,
      eventType: 'admitted',
      message: `Direct emergency patient admitted into ${randomBedType.toUpperCase()} at ${randomHospital.name}`,
      timestamp: new Date().toISOString(),
    };
    telemetryEvents.unshift(newEvt);
    if (telemetryEvents.length > 25) telemetryEvents.pop();
  }
}, 18000);

// API: Get hospitals and real-time telemetry
app.get('/api/hospitals', (req, res) => {
  // Clean up expired reservations
  const now = new Date().getTime();
  reservations = reservations.map(r => {
    if (r.status === 'active' && new Date(r.expiresAt).getTime() < now) {
      // release hold
      const hosp = hospitals.find(h => h.id === r.hospitalId);
      if (hosp && hosp.beds[r.bedType].reserved > 0) {
        hosp.beds[r.bedType].reserved -= 1;
        hosp.beds[r.bedType].available += 1;
      }
      return { ...r, status: 'expired' as const };
    }
    return r;
  });

  // Calculate totals
  let totalAvailable = 0;
  let totalIcu = 0;
  let totalVentilator = 0;
  let totalOxygen = 0;

  hospitals.forEach(h => {
    Object.values(h.beds).forEach(b => {
      totalAvailable += b.available;
    });
    totalIcu += h.beds.icu.available;
    totalVentilator += h.beds.ventilator.available;
    totalOxygen += h.beds.oxygen.available;
  });

  res.json({
    hospitals,
    telemetry: telemetryEvents.slice(0, 15),
    stats: {
      totalAvailable,
      totalIcu,
      totalVentilator,
      totalOxygen,
      totalHospitals: hospitals.length,
      lastSyncTime: new Date().toISOString(),
    }
  });
});

// API: Emergency 30-minute Bed Reservation Hold
app.post('/api/reserve-bed', (req, res) => {
  const { hospitalId, bedType, patientName, patientAge, contactNumber, conditionNotes, urgencyLevel } = req.body;

  if (!hospitalId || !bedType || !patientName || !contactNumber) {
    return res.status(400).json({ error: 'Missing required reservation fields' });
  }

  const hospital = hospitals.find(h => h.id === hospitalId);
  if (!hospital) {
    return res.status(404).json({ error: 'Hospital not found' });
  }

  const bedInfo = hospital.beds[bedType as BedType];
  if (!bedInfo || bedInfo.available <= 0) {
    return res.status(409).json({ error: 'No beds currently available in this category' });
  }

  // Hold bed
  bedInfo.available -= 1;
  bedInfo.reserved += 1;
  bedInfo.lastUpdated = 'Just now';

  const reservationId = `HOLD-${Math.floor(1000 + Math.random() * 9000)}-${bedType.toUpperCase().slice(0, 3)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 mins

  const reservation: BedReservation = {
    reservationId,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    patientName,
    patientAge: Number(patientAge) || 45,
    contactNumber,
    bedType: bedType as BedType,
    urgencyLevel: urgencyLevel || 'CRITICAL_EMERGENCY',
    conditionNotes: conditionNotes || 'Emergency Bed Hold via Monitoring Agent',
    timestamp: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active',
  };

  reservations.unshift(reservation);

  const event: TelemetryEvent = {
    id: `evt-${Date.now()}`,
    hospitalId: hospital.id,
    hospitalName: hospital.name,
    bedType: bedType as BedType,
    eventType: 'reserved',
    message: `30-Min Emergency Hold active [${reservationId}] for ${patientName} (${bedType.toUpperCase()}) at ${hospital.name}`,
    timestamp: now.toISOString(),
  };
  telemetryEvents.unshift(event);

  res.json({
    success: true,
    reservation,
    hospital,
  });
});

// API: Cancel active bed reservation
app.post('/api/cancel-reservation', (req, res) => {
  const { reservationId } = req.body;
  const resIndex = reservations.findIndex(r => r.reservationId === reservationId);

  if (resIndex === -1) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  const reservation = reservations[resIndex];
  if (reservation.status === 'active') {
    const hosp = hospitals.find(h => h.id === reservation.hospitalId);
    if (hosp) {
      hosp.beds[reservation.bedType].reserved = Math.max(0, hosp.beds[reservation.bedType].reserved - 1);
      hosp.beds[reservation.bedType].available += 1;
      hosp.beds[reservation.bedType].lastUpdated = 'Just now';
    }
    reservation.status = 'cancelled';
  }

  res.json({ success: true, reservation });
});

// API: Get user reservations
app.get('/api/reservations', (req, res) => {
  res.json({ reservations });
});

// API: Intelligent Emergency Triage & Bed Allocation Agent
app.post('/api/triage-agent', async (req, res) => {
  const { query, patientAge, currentVitals } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Patient query or clinical description is required' });
  }

  // Pre-filter available hospitals data for the AI context
  const hospitalsSummary = hospitals.map(h => ({
    id: h.id,
    name: h.name,
    area: h.area,
    distanceKm: h.distanceKm,
    etaMinutes: h.etaMinutes,
    helpline: h.helpline,
    emergencyDesk: h.emergencyDesk,
    availableBeds: {
      icu: h.beds.icu.available,
      ventilator: h.beds.ventilator.available,
      oxygen: h.beds.oxygen.available,
      general: h.beds.general.available,
      pediatric: h.beds.pediatric.available,
      isolation: h.beds.isolation.available,
    },
    oxygenStatus: h.oxygenStatus,
    facilities: h.facilities,
  }));

  let analysis: TriageAnalysis | null = null;

  if (genAI) {
    try {
      const prompt = `You are the Emergency Hospital Bed Allocation & Triage Agent.
A frantic patient attendant or paramedic has entered this clinical situation:
"${query}"
Patient Age context: ${patientAge ? patientAge : 'Not specified'}
Reported vitals context: ${currentVitals ? JSON.stringify(currentVitals) : 'None explicit'}

Hospital Live Capacities:
${JSON.stringify(hospitalsSummary, null, 2)}

TASK:
1. Determine Urgency Level: ("CRITICAL_EMERGENCY" if SPO2 < 90, unconscious, cardiac arrest, respiratory failure, stroke, polytrauma; "HIGH_PRIORITY" if high fever with breathlessness, severe pain, pediatric crisis; "STANDARD_URGENT" otherwise).
2. Recommend Bed Type: one of ("icu", "ventilator", "oxygen", "general", "pediatric", "isolation").
3. Provide a calm, clinical rationale (in 2 clear sentences).
4. Give 2-3 immediate, life-saving transit actions (e.g., "Keep patient seated upright", "Call ambulance 108 immediately", "Do not give oral fluids if unconscious").
5. Provide vital alerts if detected (e.g., "Severe Hypoxia (SPO2 < 88%)", "Elderly Patient High Risk").
6. Pick the best matching hospital IDs from the provided list based on needed bed availability, proximity, and facility capability. Prioritize hospitals that actually have available beds in that category!

Return ONLY valid JSON matching this schema:
{
  "urgencyLevel": "CRITICAL_EMERGENCY" | "HIGH_PRIORITY" | "STANDARD_URGENT",
  "recommendedBedType": "icu" | "ventilator" | "oxygen" | "general" | "pediatric" | "isolation",
  "clinicalRationale": string,
  "immediateActions": string[],
  "vitalAlerts": string[],
  "suggestedHospitalIds": string[]
}`;

      const response = await genAI.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              urgencyLevel: { type: Type.STRING },
              recommendedBedType: { type: Type.STRING },
              clinicalRationale: { type: Type.STRING },
              immediateActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              vitalAlerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              suggestedHospitalIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ['urgencyLevel', 'recommendedBedType', 'clinicalRationale', 'immediateActions', 'suggestedHospitalIds']
          }
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      analysis = {
        urgencyLevel: parsed.urgencyLevel || 'CRITICAL_EMERGENCY',
        recommendedBedType: (parsed.recommendedBedType || 'icu') as BedType,
        clinicalRationale: parsed.clinicalRationale || 'Immediate critical care bed required based on symptom profile.',
        immediateActions: Array.isArray(parsed.immediateActions) ? parsed.immediateActions : ['Dispatch emergency ambulance', 'Keep patient stabilized'],
        vitalAlerts: Array.isArray(parsed.vitalAlerts) ? parsed.vitalAlerts : [],
        suggestedHospitalIds: Array.isArray(parsed.suggestedHospitalIds) ? parsed.suggestedHospitalIds : [hospitals[0].id],
      };
    } catch (aiErr) {
      console.error('Gemini triage agent error, falling back to deterministic clinical engine:', aiErr);
    }
  }

  // Deterministic Clinical Heuristic Fallback if AI not configured or timed out
  if (!analysis) {
    const text = query.toLowerCase();
    let bedType: BedType = 'general';
    let urgency: 'CRITICAL_EMERGENCY' | 'HIGH_PRIORITY' | 'STANDARD_URGENT' = 'STANDARD_URGENT';
    const alerts: string[] = [];

    if (text.includes('ventilator') || text.includes('cannot breathe') || text.includes('gasping') || text.includes('unconscious') || text.includes('spo2 < 85') || text.includes('spo2 8') || text.includes('intubat')) {
      bedType = 'ventilator';
      urgency = 'CRITICAL_EMERGENCY';
      alerts.push('Critical Airway / Respiratory Distress');
    } else if (text.includes('icu') || text.includes('heart attack') || text.includes('chest pain') || text.includes('stroke') || text.includes('cardiac') || text.includes('trauma') || text.includes('accident') || text.includes('hemorrhage')) {
      bedType = 'icu';
      urgency = 'CRITICAL_EMERGENCY';
      alerts.push('Hemodynamic / Trauma Instability Alert');
    } else if (text.includes('child') || text.includes('baby') || text.includes('infant') || text.includes('pediatric') || text.includes('newborn') || (patientAge && Number(patientAge) < 12)) {
      bedType = 'pediatric';
      urgency = 'HIGH_PRIORITY';
      alerts.push('Pediatric Patient Emergency');
    } else if (text.includes('oxygen') || text.includes('breathless') || text.includes('spo2') || text.includes('shortness of breath') || text.includes('copd') || text.includes('asthma')) {
      bedType = 'oxygen';
      urgency = 'HIGH_PRIORITY';
      alerts.push('Oxygen Desaturation Risk');
    } else if (text.includes('covid') || text.includes('infection') || text.includes('contagious') || text.includes('isolation') || text.includes('tuberculosis')) {
      bedType = 'isolation';
      urgency = 'HIGH_PRIORITY';
    }

    // Rank hospitals by bed availability and proximity
    const rankedHospitals = [...hospitals]
      .filter(h => h.beds[bedType].available > 0)
      .sort((a, b) => {
        // prefer available beds then closer distance
        return a.distanceKm - b.distanceKm;
      });

    const fallbackIds = rankedHospitals.length > 0 
      ? rankedHospitals.slice(0, 3).map(h => h.id)
      : hospitals.slice(0, 3).map(h => h.id);

    analysis = {
      urgencyLevel: urgency,
      recommendedBedType: bedType,
      clinicalRationale: `Assessment indicates urgent requirement for ${bedType.toUpperCase()} care due to acute symptom markers. Prioritizing nearest facility with verified capacity.`,
      immediateActions: [
        'Place patient in comfortable 45-degree seated upright position',
        'Call 108 Ambulance immediately or notify hospital emergency desk',
        'Keep medical records, ID, and ongoing medications ready for triage admission'
      ],
      vitalAlerts: alerts,
      suggestedHospitalIds: fallbackIds,
    };
  }

  res.json({
    analysis,
    query,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hospital Bed Availability Monitoring Agent running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
