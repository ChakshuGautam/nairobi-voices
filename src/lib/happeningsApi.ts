// Mock API for government and community happenings
// Will be replaced with DIGIT MDMS or civic open-data API

import { Happening, ProjectDetails, ProjectComment } from '@/types/happenings';
import { NAIROBI_WARDS } from '@/types/story';

// Helper to generate mock comments
const generateMockComments = (projectId: string): ProjectComment[] => {
  const comments: ProjectComment[] = [
    {
      id: `${projectId}_c1`,
      author: 'Mary Wanjiku',
      authorType: 'citizen',
      text: 'Finally! We have been experiencing frequent outages for months. Hope this will be completed on time.',
      timestamp: '2025-12-08T14:30:00Z',
      affectedAs: 'Resident nearby',
      helpfulCount: 12
    },
    {
      id: `${projectId}_c2`,
      author: 'Nairobi County Project Team',
      authorType: 'official',
      text: 'Thank you for your feedback. The contractor is on schedule and we expect minimal disruptions during the upgrade work.',
      timestamp: '2025-12-07T09:15:00Z',
      helpfulCount: 8
    },
    {
      id: `${projectId}_c3`,
      author: 'John Kamau',
      authorType: 'citizen',
      text: 'My business has lost revenue due to power cuts. Can the county provide compensation or at least ensure this is fast-tracked?',
      timestamp: '2025-12-05T16:45:00Z',
      affectedAs: 'Business owner',
      helpfulCount: 24
    }
  ];
  return comments;
};

// Category to type mapping for projects
const CATEGORY_TYPE_MAP: Record<string, Happening['type']> = {
  traffic: 'INFRASTRUCTURE',
  health: 'SERVICE',
  safety: 'NOTICE',
  water: 'SERVICE',
  waste: 'SERVICE',
  power: 'INFRASTRUCTURE',
};

// Helper to generate project details for infrastructure projects
const generateProjectDetails = (projectId: string, title: string): ProjectDetails => ({
  status: 'WORKS_ONGOING',
  budget: 'KES 15M',
  financialYear: 'FY 2025/26',
  expectedEndDate: '2026-02-28',
  fullDescription: `This project involves comprehensive infrastructure upgrades to improve service delivery in the area. ${title} is part of Nairobi County's commitment to enhancing quality of life for all residents. The works are being carried out by certified contractors under strict supervision to ensure quality and timely completion.`,
  timeline: [
    { stage: 'Project identified in ward planning', status: 'DONE', date: '2025-03-15', note: 'Community consultation completed' },
    { stage: 'Technical design & feasibility completed', status: 'DONE', date: '2025-05-10', note: 'Environmental assessment approved' },
    { stage: 'Budget approved in County Assembly', status: 'DONE', date: '2025-06-30' },
    { stage: 'Procurement and contractor selection', status: 'DONE', date: '2025-09-01', note: 'Contract awarded to ABC Construction Ltd.' },
    { stage: 'Works ongoing on site', status: 'IN_PROGRESS', date: '2025-11-10', note: 'Phase 1 of 3 underway' },
    { stage: 'Testing & commissioning', status: 'PENDING', date: null },
    { stage: 'Project completion & monitoring', status: 'PENDING', date: null }
  ],
  relatedTickets: [
    { id: 'NRB-2024-001234', summary: 'Frequent service interruptions reported' },
    { id: 'NRB-2024-001567', summary: 'Quality concerns from local businesses' }
  ],
  relatedSurveys: [
    { id: 'survey_001', title: 'Street Lighting Improvement Drive' }
  ],
  publicUpdates: [
    { date: '2025-11-20', text: 'Contractor has mobilised and works have started. Residents advised to follow safety signage.' },
    { date: '2025-12-05', text: 'Phase 1 nearing completion. Temporary disruptions expected during final installations.' }
  ],
  comments: generateMockComments(projectId),
  engagement: {
    followers: 132,
    followersThisWeek: 12,
    comments: 24,
    linkedComplaints: 7,
    surveyResponses: 318
  }
});

// Convert map projects to happenings format with full project details
const projectsAsHappenings: Happening[] = [
  // Traffic projects
  { 
    id: 'proj_t1', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Mbagathi Way Traffic Lights', 
    summary: 'New traffic signal installation at Mbagathi Way intersection. Expect improved traffic flow once complete.', 
    source: 'Nairobi County Roads', date: '2025-12-01', type: 'INFRASTRUCTURE', 
    lat: -1.2985, lng: 36.8150, isActive: true,
    projectDetails: generateProjectDetails('proj_t1', 'Mbagathi Way Traffic Lights')
  },
  { 
    id: 'proj_t2', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Hospital Road Expansion', 
    summary: 'Road widening project to ease congestion near Kenyatta National Hospital.', 
    source: 'Nairobi County Roads', date: '2025-12-05', type: 'INFRASTRUCTURE', 
    lat: -1.2890, lng: 36.8180, isActive: true,
    projectDetails: generateProjectDetails('proj_t2', 'Hospital Road Expansion')
  },
  { 
    id: 'proj_t3', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Kenyatta Hospital Junction', 
    summary: 'Roundabout construction to improve traffic management at the busy hospital junction.', 
    source: 'Nairobi County Roads', date: '2025-11-28', type: 'INFRASTRUCTURE', 
    lat: -1.3010, lng: 36.8090, isActive: true,
    projectDetails: generateProjectDetails('proj_t3', 'Kenyatta Hospital Junction')
  },
  
  // Health projects
  { 
    id: 'proj_h1', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Upper Hill Clinic Upgrade', 
    summary: 'Medical facility renovation to expand services and improve patient care capacity.', 
    source: 'Nairobi County Health', date: '2025-12-02', type: 'SERVICE', 
    lat: -1.2930, lng: 36.8250, isActive: true,
    projectDetails: generateProjectDetails('proj_h1', 'Upper Hill Clinic Upgrade')
  },
  { 
    id: 'proj_h2', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Community Health Center', 
    summary: 'New primary care facility planned to serve Upper Hill residents.', 
    source: 'Nairobi County Health', date: '2025-12-10', type: 'SERVICE', 
    lat: -1.2870, lng: 36.8300, isActive: true,
    projectDetails: { ...generateProjectDetails('proj_h2', 'Community Health Center'), status: 'FUNDED' }
  },
  { 
    id: 'proj_h3', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Mobile Clinic Station', 
    summary: 'Weekly mobile health services now available every Tuesday and Thursday.', 
    source: 'Nairobi County Health', date: '2025-11-25', type: 'SERVICE', 
    lat: -1.2960, lng: 36.8120, isActive: true,
    projectDetails: { ...generateProjectDetails('proj_h3', 'Mobile Clinic Station'), status: 'COMPLETED' }
  },
  
  // Safety projects
  { 
    id: 'proj_s1', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'CCTV Installation Phase 2', 
    summary: 'Security camera network expansion covering major streets and junctions in Upper Hill.', 
    source: 'Nairobi County Security', date: '2025-12-03', type: 'NOTICE', 
    lat: -1.2900, lng: 36.8200, isActive: true,
    projectDetails: generateProjectDetails('proj_s1', 'CCTV Installation Phase 2')
  },
  { 
    id: 'proj_s2', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Street Lighting Upgrade', 
    summary: 'LED streetlight installation to improve night-time visibility and safety.', 
    source: 'Nairobi County Energy', date: '2025-12-01', type: 'INFRASTRUCTURE', 
    lat: -1.2950, lng: 36.8280, isActive: true,
    projectDetails: generateProjectDetails('proj_s2', 'Street Lighting Upgrade')
  },
  { 
    id: 'proj_s3', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Police Patrol Post', 
    summary: 'New community police booth established for faster emergency response.', 
    source: 'Kenya Police Service', date: '2025-11-20', type: 'NOTICE', 
    lat: -1.2880, lng: 36.8150, isActive: true,
    projectDetails: { ...generateProjectDetails('proj_s3', 'Police Patrol Post'), status: 'COMPLETED' }
  },
  
  // Water projects
  { 
    id: 'proj_w1', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Water Pipeline Repair', 
    summary: 'Main pipe replacement to address frequent water supply interruptions in the area.', 
    source: 'Nairobi Water Company', date: '2025-12-04', type: 'SERVICE', 
    lat: -1.2940, lng: 36.8170, isActive: true,
    projectDetails: generateProjectDetails('proj_w1', 'Water Pipeline Repair')
  },
  { 
    id: 'proj_w2', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Community Borehole', 
    summary: 'New borehole drilling to provide alternative water source during shortages.', 
    source: 'Nairobi Water Company', date: '2025-12-08', type: 'SERVICE', 
    lat: -1.2910, lng: 36.8260, isActive: true,
    projectDetails: { ...generateProjectDetails('proj_w2', 'Community Borehole'), status: 'PROCUREMENT' }
  },
  { 
    id: 'proj_w3', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Rainwater Harvesting', 
    summary: 'Public water collection tanks installed for community use during dry season.', 
    source: 'Nairobi County Environment', date: '2025-11-22', type: 'SERVICE', 
    lat: -1.2970, lng: 36.8230, isActive: true,
    projectDetails: { ...generateProjectDetails('proj_w3', 'Rainwater Harvesting'), status: 'COMPLETED' }
  },
  
  // Waste projects
  { 
    id: 'proj_g1', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Garbage Collection Point', 
    summary: 'New designated waste disposal area with scheduled collection twice weekly.', 
    source: 'Nairobi County Environment', date: '2025-12-02', type: 'SERVICE', 
    lat: -1.2925, lng: 36.8190, isActive: true,
    projectDetails: generateProjectDetails('proj_g1', 'Garbage Collection Point')
  },
  { 
    id: 'proj_g2', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Recycling Center', 
    summary: 'Community recycling facility planned to promote waste separation and recycling.', 
    source: 'Nairobi County Environment', date: '2025-12-12', type: 'SERVICE', 
    lat: -1.2895, lng: 36.8240, isActive: true,
    projectDetails: { ...generateProjectDetails('proj_g2', 'Recycling Center'), status: 'PLANNED' }
  },
  { 
    id: 'proj_g3', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Street Cleaning Initiative', 
    summary: 'Regular cleanup program with daily sweeping of major streets and walkways.', 
    source: 'Nairobi County Environment', date: '2025-12-01', type: 'SERVICE', 
    lat: -1.2955, lng: 36.8160, isActive: true,
    projectDetails: generateProjectDetails('proj_g3', 'Street Cleaning Initiative')
  },
  
  // Power projects
  { 
    id: 'proj_p1', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Transformer Upgrade', 
    summary: 'Power capacity increase to reduce outages and improve supply reliability.', 
    source: 'Kenya Power', date: '2025-12-03', type: 'INFRASTRUCTURE', 
    lat: -1.2915, lng: 36.8210, isActive: true,
    projectDetails: {
      status: 'WORKS_ONGOING',
      budget: 'KES 15M',
      financialYear: 'FY 2025/26',
      expectedEndDate: '2026-02-28',
      fullDescription: 'Upgrade of distribution transformers and lines to reduce frequent outages and improve power reliability in Kilimani Ward. This project addresses long-standing power quality issues affecting both residential and commercial areas. The work includes installation of new high-capacity transformers, replacement of aging power lines, and modernization of the distribution network.',
      timeline: [
        { stage: 'Project identified in ward planning', status: 'DONE', date: '2025-03-15', note: 'Community feedback highlighted frequent outages' },
        { stage: 'Technical design & feasibility completed', status: 'DONE', date: '2025-05-10', note: 'Load analysis and equipment specifications finalized' },
        { stage: 'Budget approved in County Assembly', status: 'DONE', date: '2025-06-30' },
        { stage: 'Procurement and contractor selection', status: 'DONE', date: '2025-09-01', note: 'Contract signed with XYZ Electrical Ltd.' },
        { stage: 'Works ongoing on site', status: 'IN_PROGRESS', date: '2025-11-10', note: 'Transformer installation at 3 of 5 sites complete' },
        { stage: 'Testing & commissioning', status: 'PENDING', date: null },
        { stage: 'Project completion & monitoring', status: 'PENDING', date: null }
      ],
      relatedTickets: [
        { id: 'NRB-2024-001234', summary: 'Frequent power outages in Kilimani' },
        { id: 'NRB-2024-001567', summary: 'Voltage fluctuations affecting businesses' }
      ],
      relatedSurveys: [
        { id: 'survey_001', title: 'Street Lighting Improvement Drive' }
      ],
      publicUpdates: [
        { date: '2025-11-20', text: 'Contractor has mobilised and works have started on Argwings Kodhek Road.' },
        { date: '2025-12-05', text: 'Planned outage notice shared with affected estates for transformer replacement.' }
      ],
      comments: [
        {
          id: 'proj_p1_c1',
          author: 'Mary Wanjiku',
          authorType: 'citizen',
          text: 'Finally! We have been experiencing frequent outages for months. My fridge keeps getting damaged due to power surges. Hope this will be completed on time.',
          timestamp: '2025-12-08T14:30:00Z',
          affectedAs: 'Resident nearby',
          helpfulCount: 12
        },
        {
          id: 'proj_p1_c2',
          author: 'Kenya Power Project Team',
          authorType: 'official',
          text: 'Thank you for your patience. The contractor is on schedule and we expect minimal disruptions during the upgrade work. Affected residents will receive SMS notices before any planned outages.',
          timestamp: '2025-12-07T09:15:00Z',
          helpfulCount: 8
        },
        {
          id: 'proj_p1_c3',
          author: 'John Kamau',
          authorType: 'citizen',
          text: 'My business has lost significant revenue due to power cuts. The generator costs are eating into my profits. Can the county ensure this is fast-tracked?',
          timestamp: '2025-12-05T16:45:00Z',
          affectedAs: 'Business owner',
          helpfulCount: 24
        }
      ],
      engagement: {
        followers: 132,
        followersThisWeek: 12,
        comments: 24,
        linkedComplaints: 7,
        surveyResponses: 318
      }
    }
  },
  { 
    id: 'proj_p2', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Solar Streetlights', 
    summary: 'Renewable energy lighting installed along major walkways and parks.', 
    source: 'Nairobi County Energy', date: '2025-11-18', type: 'INFRASTRUCTURE', 
    lat: -1.2945, lng: 36.8140, isActive: true,
    projectDetails: { ...generateProjectDetails('proj_p2', 'Solar Streetlights'), status: 'COMPLETED' }
  },
  { 
    id: 'proj_p3', wardCode: 'kilimani', wardName: 'Kilimani', 
    title: 'Underground Cabling', 
    summary: 'Power line undergrounding project to reduce outages from weather and accidents.', 
    source: 'Kenya Power', date: '2025-12-15', type: 'INFRASTRUCTURE', 
    lat: -1.2875, lng: 36.8270, isActive: true,
    projectDetails: { ...generateProjectDetails('proj_p3', 'Underground Cabling'), status: 'PROCUREMENT' }
  },
];

// Original mock happenings data for Nairobi
const mockHappenings: Happening[] = [
  {
    id: 'nairobi_001',
    wardCode: 'nairobi_central',
    wardName: 'Nairobi Central',
    title: 'Road repair on Kenyatta Avenue',
    summary: 'Repairs ongoing near KICC. Expect traffic diversions until Friday. Please use alternative routes.',
    source: 'Nairobi County Roads Department',
    date: '2025-12-01',
    endDate: '2025-12-08',
    type: 'INFRASTRUCTURE',
    lat: -1.2864,
    lng: 36.8172,
    isActive: true,
  },
  {
    id: 'nairobi_002',
    wardCode: 'westlands',
    wardName: 'Westlands',
    title: 'Community cleanup drive this Saturday',
    summary: 'Join the community clean-up starting at 9 AM at Westlands Park. Gloves and bags will be provided.',
    source: 'Nairobi County Environment',
    date: '2025-12-07',
    type: 'EVENT',
    lat: -1.2673,
    lng: 36.8058,
    isActive: true,
  },
  {
    id: 'nairobi_003',
    wardCode: 'kilimani',
    wardName: 'Kilimani',
    title: 'Water supply maintenance',
    summary: 'Scheduled maintenance on Wednesday 8 AM - 4 PM. Kilimani and Hurlingham areas affected. Please store water.',
    source: 'Nairobi Water Company',
    date: '2025-12-04',
    type: 'NOTICE',
    lat: -1.2892,
    lng: 36.7865,
    isActive: true,
  },
  {
    id: 'nairobi_004',
    wardCode: 'kasarani',
    wardName: 'Kasarani',
    title: 'New streetlights installation',
    summary: 'Solar-powered LED streetlights being installed along Thika Road service lane. Work continues for 2 weeks.',
    source: 'Nairobi County Energy',
    date: '2025-11-28',
    endDate: '2025-12-12',
    type: 'INFRASTRUCTURE',
    lat: -1.2208,
    lng: 36.8956,
    isActive: true,
  },
  {
    id: 'nairobi_005',
    wardCode: 'langata',
    wardName: "Lang'ata",
    title: 'Free health screening camp',
    summary: 'Free blood pressure, diabetes, and HIV screening at Lang\'ata Health Center. All residents welcome. Bring ID.',
    source: 'Nairobi County Health',
    date: '2025-12-10',
    type: 'EVENT',
    lat: -1.3550,
    lng: 36.7600,
    isActive: true,
  },
  {
    id: 'nairobi_006',
    wardCode: 'embakasi_central',
    wardName: 'Embakasi Central',
    title: 'Garbage collection schedule change',
    summary: 'Garbage collection in Embakasi Central moved to Monday and Thursday. Please have bins ready by 6 AM.',
    source: 'Nairobi County Environment',
    date: '2025-12-02',
    type: 'SERVICE',
    lat: -1.3100,
    lng: 36.8900,
    isActive: true,
  },
  {
    id: 'nairobi_007',
    wardCode: 'starehe',
    wardName: 'Starehe',
    title: 'Huduma Centre extended hours',
    summary: 'GPO Huduma Centre will operate until 6 PM (instead of 4 PM) this week for ID and certificate collection.',
    source: 'Huduma Kenya',
    date: '2025-12-02',
    endDate: '2025-12-06',
    type: 'SERVICE',
    lat: -1.2833,
    lng: 36.8333,
    link: 'https://hudumakenya.go.ke',
    isActive: true,
  },
];

// Combine all happenings
const allHappenings: Happening[] = [...projectsAsHappenings, ...mockHappenings];

// Calculate distance between two coordinates (in km)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find ward by coordinates
export function findWardByCoords(lat: number, lng: number): { code: string; name: string } | null {
  let nearestWard = null;
  let minDistance = Infinity;
  
  for (const ward of NAIROBI_WARDS) {
    const distance = getDistance(lat, lng, ward.center.lat, ward.center.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestWard = { code: ward.code, name: ward.name };
    }
  }
  
  return nearestWard;
}

// Mock reverse geocoding for nearby landmarks
export async function getNearbyLandmarks(lat: number, lng: number): Promise<string[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const landmarks = [
    'Near KICC',
    'Close to Kenyatta Avenue',
    'Near Uhuru Park',
    'Close to City Market',
    'Near GPO',
    'Westlands area',
    'Near Sarit Centre',
    'Close to Junction Mall',
  ];
  
  const shuffled = landmarks.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.random() > 0.5 ? 2 : 1);
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const happeningsApi = {
  async getHappenings(filters?: {
    wardCode?: string;
    lat?: number;
    lng?: number;
    radiusKm?: number;
    type?: string;
  }): Promise<Happening[]> {
    await delay(400);
    
    let result = [...allHappenings].filter(h => h.isActive);
    
    // If we have lat/lng, prioritize proximity over ward filtering
    if (filters?.lat && filters?.lng) {
      const radius = filters.radiusKm || 5;
      result = result.filter(h => {
        const distance = getDistance(filters.lat!, filters.lng!, h.lat, h.lng);
        return distance <= radius;
      });
      
      result.sort((a, b) => {
        const distA = getDistance(filters.lat!, filters.lng!, a.lat, a.lng);
        const distB = getDistance(filters.lat!, filters.lng!, b.lat, b.lng);
        return distA - distB;
      });
    } else if (filters?.wardCode) {
      // Only filter by ward if no coordinates provided
      result = result.filter(h => h.wardCode === filters.wardCode);
    }
    
    if (filters?.type) {
      result = result.filter(h => h.type === filters.type);
    }
    
    return result;
  },

  async getHappening(id: string): Promise<Happening | null> {
    await delay(200);
    return allHappenings.find(h => h.id === id) || null;
  },

  async getAllHappeningsForMap(): Promise<Happening[]> {
    await delay(300);
    return allHappenings.filter(h => h.isActive);
  },
};
