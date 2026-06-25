export type FacilityType = 'Hospital' | 'Clinic' | 'Health Post' | 'Pharmacy';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  province: string;
  district: string;
  city: string;
  lat: number;
  lng: number;
  services: string;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  linkedin: string | null;
  source: 'osm' | 'manual';
  osmId: string | null;
  updatedAt: Date;
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface SubmissionFields {
  phone?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

export interface Submission {
  id: string;
  facilityId: string;
  facilityName: string;
  fields: SubmissionFields;
  submitterName: string | null;
  status: SubmissionStatus;
  createdAt: Date;
  reviewedAt: Date | null;
}

export const FACILITY_TYPES: FacilityType[] = [
  'Hospital',
  'Clinic',
  'Health Post',
  'Pharmacy',
];

export const FACILITY_TYPE_COLORS: Record<FacilityType, string> = {
  Hospital: '#E2861B',
  Clinic: '#6B7F3A',
  'Health Post': '#3A5A78',
  Pharmacy: '#B5533C',
};

export const SOCIAL_COLORS = {
  phone: '#3A5A78',
  website: '#5B5B54',
  facebook: '#1877F2',
  instagram: '#C13584',
  twitter: '#111111',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
} as const;

export const CONTACT_FIELDS = [
  'phone',
  'website',
  'facebook',
  'instagram',
  'twitter',
  'youtube',
  'linkedin',
] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];
