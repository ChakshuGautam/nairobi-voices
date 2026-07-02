import { describe, it, expect } from 'vitest';
import {
  mapStatus,
  STATUS_MAP,
  prettifyBoundaryCode,
  mapServiceCodeToIssueCategory,
  pgrToStory,
  storySubmissionToPgr,
  ServiceWrapper,
} from './digitMappers';
import { normalizeKeMobile, isValidKeMobile } from './auth';
import type { StorySubmission } from '@/types/story';

describe('mapStatus', () => {
  it('maps PGR application statuses to the 5 UI buckets', () => {
    expect(mapStatus('PENDINGFORASSIGNMENT')).toBe('new');
    expect(mapStatus('PENDINGATLME')).toBe('assigned');
    expect(mapStatus('RESOLVED')).toBe('resolved');
    expect(mapStatus('CLOSEDAFTERRESOLUTION')).toBe('resolved');
  });
  it('is case-insensitive and defaults unknown/empty to new', () => {
    expect(mapStatus('resolved')).toBe('resolved');
    expect(mapStatus('SOMETHING_NEW')).toBe('new');
    expect(mapStatus(undefined)).toBe('new');
  });
  it('every STATUS_MAP value is a valid bucket', () => {
    const buckets = new Set(['new', 'assigned', 'in_progress', 'resolved', 'escalated']);
    for (const v of Object.values(STATUS_MAP)) expect(buckets.has(v)).toBe(true);
  });
});

describe('prettifyBoundaryCode', () => {
  it('drops the county prefix and title-cases', () => {
    expect(prettifyBoundaryCode('BOMET_BOMET_CENTRAL')).toBe('Bomet Central');
    expect(prettifyBoundaryCode('BOMET_CHEPALUNGU_KONGASIS')).toBe('Chepalungu Kongasis');
  });
  it('handles empty/undefined', () => {
    expect(prettifyBoundaryCode(undefined)).toBe('');
    expect(prettifyBoundaryCode('')).toBe('');
  });
});

describe('mapServiceCodeToIssueCategory', () => {
  it('classifies by keyword and falls back to other', () => {
    expect(mapServiceCodeToIssueCategory('ROAD_MAINTENANCE', 'Pothole')).toBe('roads');
    expect(mapServiceCodeToIssueCategory('WATER_SUPPLY')).toBe('water');
    expect(mapServiceCodeToIssueCategory('ServicePostponed', 'Service postponed')).toBe('other');
  });
});

describe('normalizeKeMobile / isValidKeMobile', () => {
  it('normalizes 0-prefixed, +254 and spaced forms to 9 digits', () => {
    expect(normalizeKeMobile('0712 345 678')).toBe('712345678');
    expect(normalizeKeMobile('+254712345678')).toBe('712345678');
    expect(normalizeKeMobile('712345678')).toBe('712345678');
  });
  it('validates the Kenyan 9-digit format', () => {
    expect(isValidKeMobile('0712345678')).toBe(true);
    expect(isValidKeMobile('712345678')).toBe(true);
    expect(isValidKeMobile('312345678')).toBe(false); // must start 1 or 7
    expect(isValidKeMobile('71234')).toBe(false);
  });
});

describe('pgrToStory', () => {
  const wrapper: ServiceWrapper = {
    service: {
      serviceRequestId: 'PG-PGR-2026-07-02-000001',
      tenantId: 'ke.bomet',
      serviceCode: 'ServicePostponed',
      applicationStatus: 'RESOLVED',
      description: 'Appointment postponed\n\nMy clinic visit was moved twice.',
      rating: 4,
      additionalDetail: { department: 'Medical Services', serviceName: 'Service postponed' },
      citizen: { id: 891, uuid: 'u-1', name: 'Test Citizen', mobileNumber: '712345678' },
      address: {
        tenantId: 'ke.bomet',
        locality: { code: 'BOMET_BOMET_CENTRAL', name: 'Bomet Central' },
        geoLocation: { latitude: -0.78, longitude: 35.34 },
      },
      auditDetails: { createdTime: 1_780_000_000_000, lastModifiedTime: 1_780_100_000_000 },
    },
  };

  it('surfaces the real category name from additionalDetail.serviceName', () => {
    const s = pgrToStory(wrapper);
    expect(s.serviceName).toBe('Service postponed');
  });

  it('maps status, ward, geo, rating and splits the title/body', () => {
    const s = pgrToStory(wrapper);
    expect(s.status).toBe('resolved');
    expect(s.ticketId).toBe('PG-PGR-2026-07-02-000001');
    expect(s.wardCode).toBe('BOMET_BOMET_CENTRAL');
    expect(s.lat).toBeCloseTo(-0.78);
    expect(s.lng).toBeCloseTo(35.34);
    expect(s.title).toBe('Appointment postponed');
    expect(s.description).toContain('moved twice');
    expect(s.serviceRating).toBe(4);
  });
});

describe('storySubmissionToPgr', () => {
  const submission: StorySubmission = {
    category: 'complaint',
    serviceCode: 'ServicePostponed',
    title: 'Appointment postponed',
    description: 'Moved twice with no notice.',
    lat: -0.78,
    lng: 35.34,
    locationDescription: 'Near the district hospital gate',
    wardCode: 'BOMET_BOMET_CENTRAL',
    wardName: 'Bomet Central',
    reporterPhone: '712345678',
    beneficiary: { isOnBehalf: true, name: 'Jane', phone: '711111111', relationship: 'Family member' },
  } as StorySubmission;

  it('builds a PGR service with the live serviceCode and an object geoLocation', () => {
    const svc = storySubmissionToPgr(submission);
    expect(svc.serviceCode).toBe('ServicePostponed');
    expect(svc.tenantId).toBe('ke.bomet');
    expect(svc.address?.geoLocation).toBeTypeOf('object');
    expect(svc.address?.geoLocation?.latitude).toBeCloseTo(-0.78);
    expect(svc.address?.locality?.code).toBe('BOMET_BOMET_CENTRAL');
  });

  it('appends location description and beneficiary into the PGR description (no dropped fields)', () => {
    const svc = storySubmissionToPgr(submission);
    expect(svc.description).toContain('Appointment postponed');
    expect(svc.description).toContain('district hospital gate');
    expect(svc.description).toMatch(/Jane/);
  });
});
