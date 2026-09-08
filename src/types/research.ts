export type SourceType = 'primary' | 'secondary' | 'tertiary';
export type SourceReliability = 'high' | 'medium' | 'low' | 'unverified';
export type ClaimStatus = 'unverified' | 'verified' | 'disputed' | 'debunked';

export interface ResearchNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  dateAdded: string;
  dateModified: string;
}

export interface HistoricalClaim {
  id: string;
  title: string;
  description: string;
  sourceIds: string[];
  status: ClaimStatus;
  dateAdded: string;
  dateModified: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  author: string;
  type: SourceType;
  reliability: SourceReliability;
  year: string;
  url?: string;
  notes: string;
  dateAdded: string;
}

export interface ResearchData {
  notes: ResearchNote[];
  claims: HistoricalClaim[];
  sources: ResearchSource[];
}
