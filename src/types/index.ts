export type IssueType = 'road' | 'water' | 'electricity' | 'sanitation' | 'other';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'pending' | 'in-progress' | 'resolved';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Complaint {
  id: string;
  type: IssueType;
  title: string;
  description: string;
  location: string;
  coordinates: Coordinates;
  severity: Severity;
  status: Status;
  createdAt: string;
  department: string;
  summary: string;
}

export interface ComplaintStats {
  total: number;
  byType: Record<IssueType, number>;
  bySeverity: Record<Severity, number>;
  byStatus: Record<Status, number>;
  recentComplaints: Complaint[];
}