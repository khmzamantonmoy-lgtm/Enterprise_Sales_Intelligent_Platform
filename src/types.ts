/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'executive' | 'compliance_officer' | 'risk_officer' | 'procurement_specialist' | 'admin';

export type DocumentType = 'Contract' | 'RFP' | 'Proposal' | 'Policy' | 'Other';

export interface Document {
  id: string;
  name: string;
  content: string;
  type: DocumentType;
  wordsCount: number;
  uploadDate: string;
  status: 'Pending' | 'Processing' | 'Analyzed' | 'Error';
  summary?: string;
  error?: string;
}

export interface RiskItem {
  id: string;
  clause: string;
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
  targetDocName: string;
}

export interface ComplianceItem {
  id: string;
  clauseName: string;
  status: 'Passed' | 'Warning' | 'Failed' | 'Missing';
  standardName: string;
  description: string;
  sourceText: string;
  redlineRecommendation: string;
}

export interface ProcurementMetric {
  id: string;
  category: string;
  score: number; // 0 - 100
  description: string;
  weight: number; // percentage
  comments: string;
}

export interface SpecialistReport {
  overallScore: number;
  summary: string;
  timestamp: string;
  isCustomGenerated?: boolean;
}

export interface SpecialistAnalysis {
  executiveAssistant?: SpecialistReport & {
    briefing: string;
    confidenceScore: number; // 0 - 100
  };
  riskOfficer?: SpecialistReport & {
    risks: RiskItem[];
  };
  complianceOfficer?: SpecialistReport & {
    checklists: ComplianceItem[];
  };
  procurementSpecialist?: SpecialistReport & {
    metrics: ProcurementMetric[];
  };
}

export interface CompareMatrixRow {
  id: string;
  feature: string;
  criteria: string;
  evaluations: {
    [docId: string]: {
      score: number; // 0 - 10
      comment: string;
      sourceText?: string;
    };
  };
}

export interface CompareReport {
  targetDocIds: string[];
  matrix: CompareMatrixRow[];
  redlines: {
    docId: string;
    originalText: string;
    suggestedText: string;
    reason: string;
  }[];
  summary: string;
  winningDocId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  documents: Document[];
  overallRiskLevel: 'High' | 'Medium' | 'Low';
  overallComplianceScore: number; // 0-100
  overallCommercialScore: number; // 0-100
  status: 'Empty' | 'Draft' | 'Analyzed' | 'Collaborating';
  createdAt: string;
  updatedAt: string;
  executiveSummary?: string;
  recommendation?: string;
  analysis?: SpecialistAnalysis;
  compareReport?: CompareReport;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  role: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Citation {
  docId: string;
  docName: string;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  agentType?: 'Executive Assistant' | 'Risk Officer' | 'Compliance Officer' | 'Procurement Specialist' | 'Collaborative Hub';
}

export interface SecuritySettings {
  dataResidency: 'US-East (Iowa)' | 'EU-West (Frankfurt)' | 'APAC-East (Tokyo)';
  documentRetentionDays: number; // 0 means indefinitely
  encryptionType: 'AES-256 (Cloud-Managed)' | 'AES-256 (Customer-Managed Key)' | 'HSM Double-Layer';
  accessLogsEnabled: boolean;
  mfaEnforced: boolean;
}
