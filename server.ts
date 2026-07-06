/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  Project, 
  Document, 
  AuditLog, 
  UserRole, 
  SpecialistAnalysis, 
  CompareReport, 
  ChatMessage, 
  SecuritySettings,
  RiskItem,
  ComplianceItem,
  ProcurementMetric,
  CompareMatrixRow
} from './src/types';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: '50mb' }));
const PORT = 3000;

// Lazy initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
      console.log('Gemini AI Client initialized successfully.');
    } else {
      console.log('No GEMINI_API_KEY found or using placeholder. Running in simulation mode.');
    }
  }
  return aiClient;
}

// Global In-Memory Database
const projects: Project[] = [];
const auditLogs: AuditLog[] = [];
let securitySettings: SecuritySettings = {
  dataResidency: 'US-East (Iowa)',
  documentRetentionDays: 0,
  encryptionType: 'AES-256 (Cloud-Managed)',
  accessLogsEnabled: true,
  mfaEnforced: false,
};

// Seed initial Audit Logs
function addAuditLog(userEmail: string, role: UserRole, action: string, details: string, severity: 'info' | 'warning' | 'critical' = 'info') {
  const log: AuditLog = {
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    userEmail,
    role,
    action,
    details,
    ipAddress: '192.168.1.104',
    severity,
  };
  auditLogs.unshift(log);
}

// -------------------------------------------------------------
// Seed Data: Enterprise Case Studies
// -------------------------------------------------------------
const seedProjects: Project[] = [
  {
    id: 'proj-core-banking',
    name: 'Core Banking Cloud Modernization',
    description: 'Procurement and risk evaluation for migrating the legacy core transaction ledger to a cloud architecture, evaluating RFP requirements against prime vendors.',
    overallRiskLevel: 'Medium',
    overallComplianceScore: 88,
    overallCommercialScore: 92,
    status: 'Collaborating',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    executiveSummary: 'This evaluation covers the cloud migration of our Tier-1 Core Banking transactional engine. We are evaluating Vendor Alpha and Vendor Beta against our core RFP requirements. While Vendor Beta offers a flawless SLA and native European data residency, Vendor Alpha presents a 30% lower total cost of ownership (TCO) but introduces potential compliance and SLA gap risks.',
    recommendation: 'We recommend proceeding with Vendor Beta subject to a 10% pricing negotiation, or alternatively, contractually upgrading Vendor Alpha SLA clauses to include a 99.999% availability commitment backed by double service credits. Beta is the safer compliance and operational choice, but Alpha represents superior short-term capital efficiency.',
    documents: [
      {
        id: 'doc-rfp-banking',
        name: 'RFP-2026-CORE: Core Banking Specifications',
        type: 'RFP',
        wordsCount: 1850,
        uploadDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        status: 'Analyzed',
        summary: 'Official Request for Proposal detailing technical and regulatory requirements for the core ledger migration. Demands 99.999% uptime, GDPR and PCI-DSS compliance, US or EU local data residency, and real-time ledger sync.',
        content: `RFP-2026-CORE: TRANSACTION LEDGER RE-PLATFORMING
SECTION 1: MISSION CRITICAL AVAILABILITY
The platform must guarantee 99.999% transaction engine availability (Service Level Agreement - SLA), calculated monthly.
Any downtime exceeding 26 seconds per month must trigger service credits of 5% of monthly fees per hour of downtime.

SECTION 2: SECURITY & DATA RESIDENCY
All personal identifiable information (PII) and transactional records must reside exclusively within the European Union (EU) or United States (US) boundaries to maintain compliance with sovereign banking regulations.
Security standards: SOC 2 Type II certification, ISO 27001 compliance, and full PCI-DSS Level 1 compliance.

SECTION 3: SCALE AND RETENTION
Ledger transaction capacity must exceed 20,000 writes per second at sub-10ms latency.
Data retention period: 7 years minimum of historical transaction ledgers, immediately queryable.`
      },
      {
        id: 'doc-vendor-alpha',
        name: 'Vendor Alpha: CloudLedger Proposal',
        type: 'Proposal',
        wordsCount: 2200,
        uploadDate: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
        status: 'Analyzed',
        summary: 'Commercial proposal from Vendor Alpha. Proposes AWS-based deployment with a lower pricing bracket. Commits to 99.99% SLA (introducing a gap against RFP requirements) and hosts data in Frankfurt with backup in London (introducing UK residency compliance flags post-Brexit).',
        content: `VENDOR PROPOSAL: CloudLedger Enterprise by Alpha Solutions
SYSTEM SLA COMMITMENT:
We guarantee a high-availability cloud architecture with a 99.99% monthly availability service level. 
Service credits are capped at 15% maximum of monthly subscription fees.

DATA RESIDENCY AND BACKUP:
Our primary region is AWS Frankfurt (EU). To guarantee disaster recovery, snapshots are replicated to AWS London (UK) in real-time.

PRICING & COMMERCIAL TERMS:
- Year 1 License Fee: $450,000 USD flat.
- Yearly Maintenance & Support: $50,000 USD.
- Total 3-Year TCO: $1,500,000 USD.`
      },
      {
        id: 'doc-vendor-beta',
        name: 'Vendor Beta: NexLedger Premium Proposal',
        type: 'Proposal',
        wordsCount: 2450,
        uploadDate: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(),
        status: 'Analyzed',
        summary: 'Commercial proposal from Vendor Beta. Fully matches the 99.999% SLA and offers local EU hosting (Frankfurt and Paris) with zero non-EU transfers. Pricing is 40% premium compared to Alpha.',
        content: `VENDOR PROPOSAL: NexLedger Premium by Beta Corp
REGULATORY & COMPLIANCE STATEMENTS:
NexLedger offers full PCI-DSS, GDPR, and ISO 27001 alignments. 
All customer transactional databases and backups reside exclusively in the EU (Paris primary, Frankfurt secondary). No data transfers outside the European Economic Area.

SLA GUARANTEES:
We commit to a 99.999% transaction engine availability. Downtime below this target triggers an aggressive 10% credit multiplier per hour of disruption, capped at 50% of monthly fees.

PRICING MODEL:
- Year 1 Premium License Fee: $750,000 USD.
- Yearly Maintenance & Support: $75,000 USD.
- Total 3-Year TCO: $2,400,000 USD.`
      }
    ],
    analysis: {
      executiveAssistant: {
        overallScore: 90,
        summary: 'Collaborative analysis indicates that Vendor Beta complies flawlessly with operational and regulatory requirements, but presents a heavy 40% premium. Vendor Alpha is budget-friendly but introduces operational SLA gaps (99.99% instead of 99.999%) and a post-Brexit data backup residency risk in London.',
        timestamp: new Date().toISOString(),
        briefing: 'Enterprise core re-platforming requires strict trade-offs. The Risk and Compliance specialist reviews indicate that Vendor Beta aligns with all parameters of the bank\'s sovereignty policies. However, the Procurement specialist highlights a massive $900,000 savings potential over 3 years with Alpha.',
        confidenceScore: 95
      },
      riskOfficer: {
        overallScore: 80,
        summary: 'Identified moderate operational risks in SLA coverage and localized DR failovers.',
        timestamp: new Date().toISOString(),
        risks: [
          {
            id: 'risk-1',
            clause: 'SLA Commitment (99.99%)',
            category: 'Operational Risk',
            severity: 'Medium',
            description: 'Vendor Alpha offers 99.99% availability, which permits 4.3 minutes of downtime per month. Our RFP mandates 99.999% uptime, which permits only 26 seconds of downtime per month.',
            recommendation: 'Negotiate custom SLA addendum with Alpha to match 99.999% or require dedicated private cloud tenancy.',
            targetDocName: 'Vendor Alpha: CloudLedger Proposal'
          },
          {
            id: 'risk-2',
            clause: 'Disaster Recovery London Backup',
            category: 'Regulatory/Privacy Risk',
            severity: 'High',
            description: 'Vendor Alpha replicates backup transactional data to London (UK). Under GDPR sovereign rules and banking guidelines, UK data replication requires custom safeguards since Brexit.',
            recommendation: 'Prohibit replication to UK; demand replication to Paris, Warsaw, or Dublin instead.',
            targetDocName: 'Vendor Alpha: CloudLedger Proposal'
          }
        ]
      },
      complianceOfficer: {
        overallScore: 85,
        summary: 'Regulatory audit confirms that Vendor Beta is fully aligned. Vendor Alpha has secondary UK data residency gaps.',
        timestamp: new Date().toISOString(),
        checklists: [
          {
            id: 'comp-1',
            clauseName: 'Sovereign EU Data Residency',
            status: 'Passed',
            standardName: 'GDPR Article 44',
            description: 'Verification that all transactional and PII data resides within sovereign EU borders.',
            sourceText: 'All customer transactional databases and backups reside exclusively in the EU (Paris primary, Frankfurt secondary).',
            redlineRecommendation: 'None required for Beta.'
          },
          {
            id: 'comp-2',
            clauseName: 'Sovereign EU Data Residency (Alpha Backup)',
            status: 'Failed',
            standardName: 'GDPR Article 44',
            description: 'Verification that all transactional and PII data resides within sovereign EU borders.',
            sourceText: 'snapshots are replicated to AWS London (UK) in real-time.',
            redlineRecommendation: 'REPLACE "AWS London (UK)" with "AWS Paris (France) or AWS Dublin (Ireland)" to avoid sovereign transfer complications.'
          },
          {
            id: 'comp-3',
            clauseName: 'SOC 2 Type II / PCI-DSS Alignments',
            status: 'Passed',
            standardName: 'PCI-DSS v4.0',
            description: 'Strict banking compliance requirements for core ledgers.',
            sourceText: 'NexLedger offers full PCI-DSS, GDPR, and ISO 27001 alignments.',
            redlineRecommendation: 'None. Perfect alignment.'
          }
        ]
      },
      procurementSpecialist: {
        overallScore: 95,
        summary: 'Commercial comparison highlights Vendor Alpha as the highly capital-efficient options, with Vendor Beta operating at a heavy premium.',
        timestamp: new Date().toISOString(),
        metrics: [
          {
            id: 'proc-1',
            category: 'Capital Efficiency (TCO)',
            score: 95,
            description: 'Three-year software licenses and operations costs comparison.',
            weight: 40,
            comments: 'Vendor Alpha: $1.5M. Vendor Beta: $2.4M. Selecting Alpha nets $900,000 USD in pure capital savings.'
          },
          {
            id: 'proc-2',
            category: 'SLA Credit Robustness',
            score: 60,
            description: 'Assess penalty compensation during failure events.',
            weight: 30,
            comments: 'Alpha limits claims to 15% monthly subscription. Beta allows up to 50% monthly subscription refunds.'
          },
          {
            id: 'proc-3',
            category: 'Implementation Speed',
            score: 85,
            description: 'Timeline and technical resource commitment from the vendor.',
            weight: 30,
            comments: 'Alpha promises active deployment in 12 months. Beta estimates 18 months due to custom security integrations.'
          }
        ]
      }
    },
    compareReport: {
      targetDocIds: ['doc-rfp-banking', 'doc-vendor-alpha', 'doc-vendor-beta'],
      matrix: [
        {
          id: 'cmp-row-1',
          feature: 'Availability SLA',
          criteria: 'Requires 99.999% availability with credit backing.',
          evaluations: {
            'doc-rfp-banking': { score: 10, comment: 'Base standard.' },
            'doc-vendor-alpha': { score: 5, comment: '99.99% guaranteed (Gap: 4.3 hours allowed downtime annually instead of 5 minutes). SLA refund capped at 15%.', sourceText: 'We guarantee a high-availability cloud architecture with a 99.99% monthly availability service level.' },
            'doc-vendor-beta': { score: 10, comment: '99.999% guaranteed, backed by 50% capped credit scheme.', sourceText: 'We commit to a 99.999% transaction engine availability.' }
          }
        },
        {
          id: 'cmp-row-2',
          feature: 'Data Residency Sovereignty',
          criteria: 'Exclusively within EU/US borders.',
          evaluations: {
            'doc-rfp-banking': { score: 10, comment: 'Base standard.' },
            'doc-vendor-alpha': { score: 6, comment: 'Primary in Frankfurt but backs up in London (UK) post-Brexit.', sourceText: 'snapshots are replicated to AWS London (UK) in real-time.' },
            'doc-vendor-beta': { score: 10, comment: 'Fully compliant, Paris and Frankfurt zones only.', sourceText: 'All customer transactional databases and backups reside exclusively in the EU.' }
          }
        },
        {
          id: 'cmp-row-3',
          feature: 'Commercial Pricing (3-Yr TCO)',
          criteria: 'Maximize cost efficiency.',
          evaluations: {
            'doc-rfp-banking': { score: 10, comment: 'Base requirements.' },
            'doc-vendor-alpha': { score: 10, comment: '$1.5M total cost, highly economical.', sourceText: 'Total 3-Year TCO: $1,500,000 USD.' },
            'doc-vendor-beta': { score: 6, comment: '$2.4M total cost, representing a 60% markup.', sourceText: 'Total 3-Year TCO: $2,400,000 USD.' }
          }
        }
      ],
      redlines: [
        {
          docId: 'doc-vendor-alpha',
          originalText: 'snapshots are replicated to AWS London (UK) in real-time.',
          suggestedText: 'snapshots are replicated to AWS Paris (France) or AWS Dublin (Ireland) in real-time.',
          reason: 'Ensures absolute compliance with our strict EU Data Sovereignty charter and avoids cross-border legal liabilities.'
        }
      ],
      summary: 'Vendor Beta represents perfect compliance and technical performance, while Vendor Alpha offers outstanding economic efficiency but requires contract negotiations to address SLA and UK backup replication risks.',
      winningDocId: 'doc-vendor-beta'
    }
  },
  {
    id: 'proj-telecom-sla',
    name: '5G Core Telecom SLA Evaluation',
    description: 'Contractual risk analysis of the core network deployment SLA and indemnity clauses with primary network providers.',
    overallRiskLevel: 'High',
    overallComplianceScore: 72,
    overallCommercialScore: 85,
    status: 'Analyzed',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    executiveSummary: 'This evaluation audits the 5G Core Network deployment agreement. The primary compliance and financial concern centers around the Liability Caps. The vendor has capped general liability at 100% of contract value, which fails to protect the telecom against systemic consumer lawsuits or network-wide outages.',
    recommendation: 'Reject the liability limit as proposed. Demand an exclusion (carve-out) from the general liability cap for (1) GDPR breach liabilities, (2) gross negligence, and (3) performance outages exceeding 12 consecutive hours.',
    documents: [
      {
        id: 'doc-telecom-sla-draft',
        name: 'SLA-Draft-v1.2: Core Network Terms',
        type: 'Contract',
        wordsCount: 1540,
        uploadDate: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        status: 'Analyzed',
        summary: 'Draft terms of the 5G infrastructure contract, including service levels, liability limits, and default penalties.',
        content: `SECTION 9.1: LIMITATION OF LIABILITY
Neither party shall be liable to the other for indirect, incidental, or consequential damages.
Except for breaches of intellectual property indemnification, each party's maximum aggregate liability under this Agreement shall be strictly capped at 100% of the fees paid by Customer during the 12-month period preceding the claim.

SECTION 10.4: DATA BREACH INDEMNITY
Vendor agrees to deploy standard cyber defense controls. In the event of a customer data breach originating from Vendor hardware failure, Vendor liability for regulatory fines is capped at $500,000.`
      }
    ],
    analysis: {
      executiveAssistant: {
        overallScore: 75,
        summary: 'This contract contains high risk elements regarding liability caps. GDPR fines can exceed $20M or 4% of global turnover; a $500k cap leaves our company massively exposed.',
        timestamp: new Date().toISOString(),
        briefing: 'Legal review shows critical risk in Section 9.1 and Section 10.4. Procurement advises the supplier is sole-source for this 5G technology, reducing negotiating leverage.',
        confidenceScore: 88
      },
      riskOfficer: {
        overallScore: 50,
        summary: 'Unacceptable liability caps for operational risk.',
        timestamp: new Date().toISOString(),
        risks: [
          {
            id: 'risk-tel-1',
            clause: 'Limitation of Liability Section 9.1',
            category: 'Legal Risk',
            severity: 'High',
            description: 'General liability is capped at 12 months fees. If a major core network crash causes a country-wide outage, customer lawsuits could easily exceed this contract value by 20x.',
            recommendation: 'Negotiate general liability cap of at least 300% of contract value, and carve out total service outages entirely.',
            targetDocName: 'SLA-Draft-v1.2: Core Network Terms'
          },
          {
            id: 'risk-tel-2',
            clause: 'Data Breach Indemnity Cap of $500,000',
            category: 'Financial Risk',
            severity: 'High',
            description: 'Regulatory fines and breach remediation costs are capped at $500,000. In banking or telecom, a systemic data leak typically costs $5M - $25M.',
            recommendation: 'Carve out data protection, privacy, and cyber security breaches from the liability cap entirely (uncapped or super-capped at $20M).',
            targetDocName: 'SLA-Draft-v1.2: Core Network Terms'
          }
        ]
      }
    }
  }
];

// Initialize global project arrays with seed data
projects.push(...seedProjects);

// -------------------------------------------------------------
// Core Gemini Prompt Execution Engine
// -------------------------------------------------------------
async function runGeminiAnalysis(project: Project, forceSimulate: boolean = false): Promise<SpecialistAnalysis> {
  const client = getGeminiClient();
  const useSim = forceSimulate || !client;

  if (useSim) {
    // Return high-fidelity mock/simulated analysis
    console.log('Running simulated AI agent synthesis...');
    const nowStr = new Date().toISOString();
    return {
      executiveAssistant: {
        overallScore: 85,
        summary: `Analysis of the project "${project.name}" completed successfully via simulation mode. The documents highlight critical areas in contract alignment, liability limits, and operational standards.`,
        timestamp: nowStr,
        briefing: `This represents a unified decision briefing. Our specialist agents have reviewed the uploaded documents (${project.documents.map(d => d.name).join(', ')}). The system identifies key gaps in operational and commercial terms.`,
        confidenceScore: 82,
        isCustomGenerated: true
      },
      riskOfficer: {
        overallScore: 78,
        summary: 'Simulated Risk Officer identifies potential gaps in operational liability, data privacy clauses, and performance SLA metrics.',
        timestamp: nowStr,
        risks: project.documents.map((doc, idx) => ({
          id: `sim-risk-${idx}`,
          clause: 'General Liability & Indemnity',
          category: 'Legal & Regulatory',
          severity: idx % 2 === 0 ? 'High' : 'Medium',
          description: `Simulated analysis of "${doc.name}" indicates that the standard terms contain boilerplate limitations of liability which may over-expose the enterprise.`,
          recommendation: 'Conduct a thorough legal audit and suggest specific carve-outs for confidentiality and security breaches.',
          targetDocName: doc.name
        })),
        isCustomGenerated: true
      },
      complianceOfficer: {
        overallScore: 80,
        summary: 'Simulated Compliance Officer confirms partial alignment with general industry standards, flagging minor compliance gaps.',
        timestamp: nowStr,
        checklists: project.documents.map((doc, idx) => ({
          id: `sim-comp-${idx}`,
          clauseName: 'Data Deletion & Retention Security',
          status: idx % 2 === 0 ? 'Warning' : 'Passed',
          standardName: 'ISO 27001 / GDPR',
          description: 'Audits the document for clear procedures regarding data deletion upon contract termination.',
          sourceText: doc.content.substring(0, 150) + '...',
          redlineRecommendation: `Amend the termination clauses in "${doc.name}" to guarantee data destruction within 30 business days.`
        })),
        isCustomGenerated: true
      },
      procurementSpecialist: {
        overallScore: 88,
        summary: 'Simulated Procurement Specialist identifies solid commercial structures but suggests closer audit on hidden hosting or implementation fees.',
        timestamp: nowStr,
        metrics: [
          {
            id: 'sim-proc-1',
            category: 'Commercial Alignment',
            score: 85,
            description: 'Evaluates pricing clarity and license structures.',
            weight: 50,
            comments: 'The terms reflect competitive market rates but lack specific price-protection guards against year-over-year renewals.'
          },
          {
            id: 'sim-proc-2',
            category: 'Operational Uptime Requirements',
            score: 90,
            description: 'Evaluates the SLA commitments.',
            weight: 50,
            comments: 'Service credits are outlined, but the default credit multipliers should be structured more aggressively.'
          }
        ],
        isCustomGenerated: true
      }
    };
  }

  // Real Gemini Flow!
  console.log('Invoking actual Gemini 3.5-flash model...');
  try {
    const combinedDocumentsContent = project.documents.map(d => `--- DOCUMENT NAME: ${d.name} (Type: ${d.type}) ---\n${d.content}`).join('\n\n');

    const prompt = `You are a group of elite enterprise specialists (Executive Assistant, Risk Officer, Compliance Officer, Procurement Specialist) collaborating on a Project named "${project.name}" (Description: "${project.description}").
Below are the core documents associated with the project:

${combinedDocumentsContent}

Please perform an in-depth joint analysis and return a JSON object that strictly adheres to the following JSON structure. Do NOT wrap it in any markdown backticks except standard raw JSON, or return it as clean JSON output:

{
  "executiveAssistant": {
    "overallScore": 90,
    "summary": "Unified collaborative executive summary of findings across all documents.",
    "briefing": "Executive briefings outlining the strategic decision context, trade-offs, and recommended path forward.",
    "confidenceScore": 85
  },
  "riskOfficer": {
    "overallScore": 75,
    "summary": "High-level review of primary risks found in the text.",
    "risks": [
      {
        "clause": "Name of the clause or section",
        "category": "Operational Risk / Regulatory Risk / Financial Risk / Legal Risk",
        "severity": "High / Medium / Low",
        "description": "Specific description of the risk and vulnerability identified.",
        "recommendation": "Contractual or operational action plan to mitigate the risk.",
        "targetDocName": "The exact document name where this risk was found"
      }
    ]
  },
  "complianceOfficer": {
    "overallScore": 82,
    "summary": "Compliance summary of audits and regulatory checks.",
    "checklists": [
      {
        "clauseName": "Clause Name analyzed",
        "status": "Passed / Warning / Failed / Missing",
        "standardName": "GDPR / ISO 27001 / SOC 2 / HIPAA / PCI-DSS / Sovereign Laws",
        "description": "The audit standard requirement description.",
        "sourceText": "The actual text extracted from the document supporting this check (up to 150 characters)",
        "redlineRecommendation": "Exact legal redline suggestion to modify this clause or add a missing clause."
      }
    ]
  },
  "procurementSpecialist": {
    "overallScore": 88,
    "summary": "Commercial metrics analysis summary.",
    "metrics": [
      {
        "category": "Capital Efficiency / Pricing Risk / SLA Metrics / Timeline Feasibility",
        "score": 85,
        "description": "Brief description of this commercial metric.",
        "weight": 40,
        "comments": "Analysis of how well the document performs under this metric, including exact numbers and SLA credits if visible."
      }
    ]
  }
}`;

    const response = await client!.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    const textOutput = response.text || '';
    const parsed = JSON.parse(textOutput.trim());
    
    // Inject timestamps and IDs
    const nowStr = new Date().toISOString();
    const result: SpecialistAnalysis = {
      executiveAssistant: {
        overallScore: parsed.executiveAssistant?.overallScore ?? 85,
        summary: parsed.executiveAssistant?.summary ?? 'Analysis completed.',
        timestamp: nowStr,
        briefing: parsed.executiveAssistant?.briefing ?? '',
        confidenceScore: parsed.executiveAssistant?.confidenceScore ?? 85,
      },
      riskOfficer: {
        overallScore: parsed.riskOfficer?.overallScore ?? 75,
        summary: parsed.riskOfficer?.summary ?? 'Risk audit complete.',
        timestamp: nowStr,
        risks: (parsed.riskOfficer?.risks ?? []).map((r: any, idx: number) => ({
          id: `risk-gen-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          clause: r.clause ?? 'Clause',
          category: r.category ?? 'General Risk',
          severity: (r.severity === 'High' || r.severity === 'Medium' || r.severity === 'Low') ? r.severity : 'Medium',
          description: r.description ?? '',
          recommendation: r.recommendation ?? '',
          targetDocName: r.targetDocName ?? (project.documents[0]?.name || 'Document')
        }))
      },
      complianceOfficer: {
        overallScore: parsed.complianceOfficer?.overallScore ?? 80,
        summary: parsed.complianceOfficer?.summary ?? 'Compliance review complete.',
        timestamp: nowStr,
        checklists: (parsed.complianceOfficer?.checklists ?? []).map((c: any, idx: number) => ({
          id: `comp-gen-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          clauseName: c.clauseName ?? 'Audit Check',
          status: (c.status === 'Passed' || c.status === 'Warning' || c.status === 'Failed' || c.status === 'Missing') ? c.status : 'Warning',
          standardName: c.standardName ?? 'ISO 27001',
          description: c.description ?? '',
          sourceText: c.sourceText ?? '',
          redlineRecommendation: c.redlineRecommendation ?? ''
        }))
      },
      procurementSpecialist: {
        overallScore: parsed.procurementSpecialist?.overallScore ?? 80,
        summary: parsed.procurementSpecialist?.summary ?? 'Commercial evaluation complete.',
        timestamp: nowStr,
        metrics: (parsed.procurementSpecialist?.metrics ?? []).map((m: any, idx: number) => ({
          id: `proc-gen-${idx}-${Math.random().toString(36).substr(2, 5)}`,
          category: m.category ?? 'Metric',
          score: m.score ?? 80,
          description: m.description ?? '',
          weight: m.weight ?? 33,
          comments: m.comments ?? ''
        }))
      }
    };

    return result;

  } catch (error) {
    console.error('Error in real Gemini analysis, falling back to simulated output: ', error);
    addAuditLog('system@docugraph.ai', 'admin', 'Gemini analysis fallback triggered', `Live Gemini call failed. Falling back to simulated AI analysis. Error: ${error instanceof Error ? error.message : String(error)}`, 'warning');
    return runGeminiAnalysis(project, true);
  }
}

// -------------------------------------------------------------
// REST API Endpoint Routes
// -------------------------------------------------------------

// API status check
app.get('/api/status', (req, res) => {
  const isLive = getGeminiClient() !== null;
  res.json({ 
    status: 'ok', 
    engine: isLive ? 'Gemini 3.5-flash Live' : 'AI Agent Local Simulation',
    apiKeyConfigured: isLive
  });
});

// GET all projects
app.get('/api/projects', (req, res) => {
  res.json(projects);
});

// GET audit logs
app.get('/api/audit-logs', (req, res) => {
  res.json(auditLogs);
});

// POST create project
app.post('/api/projects', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Project Name is required.' });
  }

  const newProject: Project = {
    id: `proj-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description: description || 'No description provided.',
    documents: [],
    overallRiskLevel: 'Low',
    overallComplianceScore: 100,
    overallCommercialScore: 100,
    status: 'Empty',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  projects.push(newProject);
  addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Project Created', `Workspace "${name}" initialized successfully.`, 'info');
  res.status(201).json(newProject);
});

// POST add document to a project
app.post('/api/projects/:id/documents', async (req, res) => {
  const { id } = req.params;
  const { name, content, type } = req.body;

  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (!name || !content) {
    return res.status(400).json({ error: 'Document name and content are required.' });
  }

  const docId = `doc-${Math.random().toString(36).substr(2, 9)}`;
  const wordsCount = content.split(/\s+/).filter(Boolean).length;

  const newDoc: Document = {
    id: docId,
    name,
    content,
    type: type || 'Other',
    wordsCount,
    uploadDate: new Date().toISOString(),
    status: 'Processing'
  };

  project.documents.push(newDoc);
  project.updatedAt = new Date().toISOString();
  project.status = 'Draft';

  addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Document Uploaded', `Document "${name}" (${wordsCount} words) added to project "${project.name}".`, 'info');

  // Async document summarization via Gemini (or simulated)
  try {
    const client = getGeminiClient();
    if (client) {
      const summaryPrompt = `Summarize the following document titled "${name}" of type "${type}" in a single short paragraph. Output only the plain summary text: \n\n${content}`;
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: summaryPrompt,
      });
      newDoc.summary = response.text?.trim() || 'No summary generated.';
    } else {
      newDoc.summary = `This is an auto-generated simulated summary for "${name}". The text contains around ${wordsCount} words and appears to focus on sovereign policy requirements and operational delivery milestones.`;
    }
    newDoc.status = 'Analyzed';
  } catch (error) {
    console.error('Error generating summary:', error);
    newDoc.summary = `Document uploaded. Live Gemini summary failed, but document remains available for full project analysis.`;
    newDoc.status = 'Analyzed';
  }

  res.status(201).json(project);
});

// DELETE a document
app.delete('/api/projects/:id/documents/:docId', (req, res) => {
  const { id, docId } = req.params;
  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const docIndex = project.documents.findIndex(d => d.id === docId);
  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found in project.' });
  }

  const docName = project.documents[docIndex].name;
  project.documents.splice(docIndex, 1);
  project.updatedAt = new Date().toISOString();
  if (project.documents.length === 0) {
    project.status = 'Empty';
  }

  addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Document Deleted', `Document "${docName}" removed from project "${project.name}".`, 'warning');
  res.json(project);
});

// POST trigger multi-agent analysis on a project
app.post('/api/projects/:id/analyze', async (req, res) => {
  const { id } = req.params;
  const { forceSimulate } = req.body;

  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (project.documents.length === 0) {
    return res.status(400).json({ error: 'Cannot run analysis on an empty project. Please upload documents first.' });
  }

  project.status = 'Processing' as any;
  addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Multi-Agent Evaluation Started', `Triggered decision intelligence synthesis across ${project.documents.length} docs for project "${project.name}".`, 'info');

  try {
    const analysisResult = await runGeminiAnalysis(project, !!forceSimulate);
    project.analysis = analysisResult;
    
    // Update top level summary scores based on agent evaluations
    project.overallComplianceScore = analysisResult.complianceOfficer?.overallScore ?? 80;
    project.overallCommercialScore = analysisResult.procurementSpecialist?.overallScore ?? 80;
    
    const riskScore = analysisResult.riskOfficer?.overallScore ?? 80;
    if (riskScore < 60) {
      project.overallRiskLevel = 'High';
    } else if (riskScore < 85) {
      project.overallRiskLevel = 'Medium';
    } else {
      project.overallRiskLevel = 'Low';
    }

    project.executiveSummary = analysisResult.executiveAssistant?.summary;
    project.recommendation = analysisResult.executiveAssistant?.briefing;
    project.status = 'Analyzed';
    project.updatedAt = new Date().toISOString();

    addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Multi-Agent Evaluation Completed', `Executive, Risk, Compliance, and Procurement specialists synthesized recommendations for project "${project.name}".`, 'info');
    res.json(project);
  } catch (error) {
    console.error('Project analysis failure: ', error);
    project.status = 'Draft';
    res.status(500).json({ error: 'Analysis engine failed to process the document bundle.' });
  }
});

// POST compare documents inside a project
app.post('/api/projects/:id/compare', async (req, res) => {
  const { id } = req.params;
  const { docIds } = req.body; // Array of document IDs to compare

  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (!docIds || docIds.length < 2) {
    return res.status(400).json({ error: 'Comparison requires selecting at least 2 documents.' });
  }

  const selectedDocs = project.documents.filter(d => docIds.includes(d.id));
  if (selectedDocs.length < 2) {
    return res.status(400).json({ error: 'Selected documents do not exist in this project.' });
  }

  addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Document Comparison Triggered', `Comparing side-by-side documents: ${selectedDocs.map(d=>d.name).join(', ')}`, 'info');

  const client = getGeminiClient();
  if (!client) {
    // Return mock comparison matrix
    console.log('Running simulated document compare...');
    const matrix: CompareMatrixRow[] = [
      {
        id: 'sim-cmp-1',
        feature: 'Core Service Reliability',
        criteria: 'Requires 99.9% or higher core performance SLA targets.',
        evaluations: {}
      },
      {
        id: 'sim-cmp-2',
        feature: 'Sovereignty & Encryption Guard',
        criteria: 'Requires localized customer-managed key support.',
        evaluations: {}
      }
    ];

    selectedDocs.forEach(doc => {
      matrix[0].evaluations[doc.id] = {
        score: Math.floor(Math.random() * 4) + 7,
        comment: `Satisfactory mentions of operational stability inside "${doc.name}".`,
        sourceText: doc.content.substring(0, 100) + '...'
      };
      matrix[1].evaluations[doc.id] = {
        score: Math.floor(Math.random() * 5) + 6,
        comment: `Mentions general security encryption, though custom key controls are unspecified in "${doc.name}".`,
        sourceText: doc.content.substring(50, 150) + '...'
      };
    });

    const compareReport: CompareReport = {
      targetDocIds: docIds,
      matrix,
      redlines: [
        {
          docId: selectedDocs[0].id,
          originalText: selectedDocs[0].content.substring(0, 80) + '...',
          suggestedText: 'AMENDED: This clause should include dedicated multi-region backup synchronization.',
          reason: 'Protects critical business data from unannounced zonal outages.'
        }
      ],
      summary: `Simulated comparison indicates high parity across terms. However, "${selectedDocs[0].name}" displays stronger SLA covenants while "${selectedDocs.length > 1 ? selectedDocs[1].name : 'other'}" shows better pricing efficiency.`,
      winningDocId: selectedDocs[0].id
    };

    project.compareReport = compareReport;
    project.updatedAt = new Date().toISOString();
    return res.json(compareReport);
  }

  // Real Gemini Comparison!
  try {
    const docsPrompt = selectedDocs.map(d => `ID: "${d.id}"\nName: "${d.name}"\nType: "${d.type}"\nContent: "${d.content}"`).join('\n\n');

    const prompt = `You are an expert contract and policy analyst. Compare the following documents side-by-side:

${docsPrompt}

Generate a comprehensive comparison report. Return a JSON object matching this schema exactly. Output ONLY raw JSON, no markdown formatting:
{
  "matrix": [
    {
      "feature": "Name of feature or requirement being compared",
      "criteria": "The target expectation or industry standard",
      "evaluations": {
        "insert_doc_id_here": {
          "score": 8, 
          "comment": "Specific evaluation of how well this document fulfills this feature (score 1-10)",
          "sourceText": "Extracted quote from this document supporting the evaluation"
        }
      }
    }
  ],
  "redlines": [
    {
      "docId": "The document ID requiring redlining",
      "originalText": "The text as currently written",
      "suggestedText": "Proposed redline rewrite",
      "reason": "Why this change is legally or commercially necessary"
    }
  ],
  "summary": "Overall synthesis comparison and summary of trade-offs.",
  "winningDocId": "The document ID that represents the strongest contractual or commercial position"
}`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      }
    });

    const textOutput = response.text || '';
    const parsed = JSON.parse(textOutput.trim());

    const compareReport: CompareReport = {
      targetDocIds: docIds,
      matrix: (parsed.matrix || []).map((m: any, idx: number) => ({
        id: `cmp-row-${idx}`,
        feature: m.feature || 'Feature',
        criteria: m.criteria || 'Standard',
        evaluations: m.evaluations || {}
      })),
      redlines: (parsed.redlines || []).map((r: any) => ({
        docId: r.docId || selectedDocs[0].id,
        originalText: r.originalText || '',
        suggestedText: r.suggestedText || '',
        reason: r.reason || ''
      })),
      summary: parsed.summary || 'Comparison complete.',
      winningDocId: parsed.winningDocId || selectedDocs[0].id
    };

    project.compareReport = compareReport;
    project.updatedAt = new Date().toISOString();
    res.json(compareReport);

  } catch (error) {
    console.error('Error running live Gemini compare, using simulation: ', error);
    res.status(500).json({ error: 'Live comparison model failed. Please verify your GEMINI_API_KEY.' });
  }
});

// POST chat with the project context (with citations!)
app.post('/api/projects/:id/chat', async (req, res) => {
  const { id } = req.params;
  const { message, history, agentType } = req.body;

  const project = projects.find(p => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Project Chat Query', `User asked "${message.substring(0, 45)}..." in context of project "${project.name}".`, 'info');

  const client = getGeminiClient();
  const docsText = project.documents.map(d => `DOCUMENT: "${d.name}"\nCONTENT:\n${d.content}`).join('\n\n');

  if (!client) {
    // Simulation chat
    setTimeout(() => {
      const answers = [
        `Based on the documents in **${project.name}**, particularly in the RFP guidelines, we mandate a rigorous SLA compliance schema. However, Vendor Alpha has a minor gap with its 99.99% availability limit. Let me know if you would like me to draft a specific redline clause to address this gap!`,
        `Analyzing the terms in **${project.name}**, the principal risk is the data backup region located in London (UK). Under European Data Sovereignty, this triggers additional standard contractual clauses (SCC) audits. Vendor Beta avoids this entirely.`,
        `Commercial metrics show that Vendor Alpha represents a massive cost savings of $900,000 USD over 3 years. Procurement has flagged that while Beta is highly aligned operationally, the premium cost may require secondary corporate approvals.`
      ];
      
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      const responseMsg: ChatMessage = {
        id: `msg-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: `*(Running in Local Simulation Mode)*\n\n${randomAnswer}`,
        timestamp: new Date().toISOString(),
        agentType: agentType || 'Collaborative Hub',
        citations: project.documents.length > 0 ? [
          {
            docId: project.documents[0].id,
            docName: project.documents[0].name,
            text: project.documents[0].content.substring(0, 150) + '...'
          }
        ] : []
      };
      return res.json(responseMsg);
    }, 1000);
    return;
  }

  // Real Gemini Chat!
  try {
    const formattedHistory = (history || []).map((h: ChatMessage) => `${h.role === 'user' ? 'User' : 'AI'}: ${h.content}`).join('\n');

    const agentInstructions = {
      'Executive Assistant': 'You are the Executive Assistant. Provide concise, decision-oriented, clear executive summaries with actionable recommendations.',
      'Risk Officer': 'You are the Chief Risk Officer. Focus aggressively on liabilities, gaps, indemnities, single point of failures, and regulatory compliance risks.',
      'Compliance Officer': 'You are the Chief Compliance Officer. Focus strictly on GDPR, ISO, SOC2, PCI-DSS compliance audits, and legal redline text edits.',
      'Procurement Specialist': 'You are the Procurement Director. Focus on commercial models, pricing, SLA credit robustness, and year-over-year cost trends.',
      'Collaborative Hub': 'You are the DocuGraph Collaborative Hub, combining the views of the Executive, Risk, Compliance, and Procurement specialists to make unified strategic recommendations.'
    }[agentType as string || 'Collaborative Hub'];

    const prompt = `System Guidance:
${agentInstructions}
You have access to the following project documents:
${docsText}

Conversational History:
${formattedHistory}

User Query:
"${message}"

Formulate a highly detailed, professional response based strictly on the provided documents. Cite specific document names in your text using brackets like [Document Name, Section/Clause].
If the query cannot be answered using the document contents, state clearly that the uploaded documents do not contain that information.
Return the output in clean text markdown. Ensure you format clear headers and lists where appropriate.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const responseText = response.text || '';
    
    // Automatically find simple citations by checking document names in text
    const citations = project.documents
      .filter(doc => responseText.toLowerCase().includes(doc.name.toLowerCase()) || responseText.toLowerCase().includes(doc.name.split(':')[0].toLowerCase()))
      .map(doc => ({
        docId: doc.id,
        docName: doc.name,
        text: doc.content.substring(0, 200) + '...'
      }));

    const responseMsg: ChatMessage = {
      id: `msg-${Math.random().toString(36).substr(2, 9)}`,
      role: 'assistant',
      content: responseText,
      timestamp: new Date().toISOString(),
      agentType: agentType || 'Collaborative Hub',
      citations: citations.length > 0 ? citations : undefined
    };

    res.json(responseMsg);

  } catch (error) {
    console.error('Gemini chat error: ', error);
    res.status(500).json({ error: 'Chat processing failed on the AI server.' });
  }
});

// GET security settings
app.get('/api/security-settings', (req, res) => {
  res.json(securitySettings);
});

// PUT security settings
app.put('/api/security-settings', (req, res) => {
  securitySettings = { ...securitySettings, ...req.body };
  addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Security Policies Modified', `Data residency set to ${securitySettings.dataResidency}, double HSM encryption status updated.`, 'warning');
  res.json(securitySettings);
});

// POST trigger Antigravity agent sandbox interaction
app.post('/api/antigravity', async (req, res) => {
  const { prompt, projectId } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }

  const project = projects.find(p => p.id === projectId);
  const docsContext = project 
    ? project.documents.map(d => `Document Name: ${d.name}\nType: ${d.type}\nContent:\n${d.content}`).join('\n\n')
    : '';

  const client = getGeminiClient();

  if (!client) {
    // Return high-fidelity simulation of Antigravity Agent steps & reasoning trace
    console.log('Running simulated Antigravity Sandbox interaction...');
    setTimeout(() => {
      const isComplianceTask = prompt.toLowerCase().includes('compliance') || prompt.toLowerCase().includes('gdpr') || prompt.toLowerCase().includes('residency');
      const isSlaTask = prompt.toLowerCase().includes('sla') || prompt.toLowerCase().includes('uptime') || prompt.toLowerCase().includes('credit');
      
      let thought1 = "I am initializing a secure remote Linux sandbox. To process the user request, I will load the document repository and search for relevant terms.";
      let searchCall = "Sovereign GDPR cloud guidelines & PCI-DSS banking SLA standards";
      let searchResult = "Found 3 main references: 1) AWS Sovereign cloud boundary rules, 2) EBA Guidelines on outsourcing arrangements, 3) PCI-DSS v4.0 Section 12.3.";
      let thought2 = "Let's review the active workspace document data. I'll execute a sandboxed Python script to run string comparison on the SLA and backup replication terms.";
      let codeCall = "import re\ntext = '''" + (docsContext ? docsContext.substring(0, 500) + '...' : 'No active document corpus found.') + "'''\n# Pattern match on uptime SLA and residency targets\nresidency = re.findall(r'(London|Frankfurt|Paris)', text)\nprint(f'Detected locations: {residency}')";
      let codeResult = "Detected locations: ['Frankfurt', 'London']";
      let finalOutput = "";

      if (isComplianceTask) {
        finalOutput = "### Antigravity Sandbox Sovereign Audit Report\n\nBased on sandboxed parsing and web compliance searches:\n\n1. **Data Sovereignty Gaps**: Snapshots replicated to London (UK) violate standard EU data sovereignty charters (GDPR Article 44) under strict banking regulations. \n2. **Recommendation**: Amend contract Section 13.3. Re-route snapshot target to Frankfurt AWS secondary or Paris AWS secondary.\n\n*Source nodes: Vendor Alpha Proposal, RFP Banking Specs.*";
      } else if (isSlaTask) {
        finalOutput = "### Antigravity Sandbox SLA & Performance Analysis\n\nAnalysis executed via local pandas regression script:\n\n1. **Uptime Comparison**: RFP specifies 99.999% (26s/mo allowable down). Vendor Alpha proposes 99.99% (4.3m/mo allowable down). This gap translates to **51.6 minutes** of unhedged downtime exposure annually.\n2. **SLA Penalties**: Vendor Beta matches 99.999% with aggressive 50% refund caps. Alpha caps refunds at 15%.\n\n*Execution complete. Code successfully written to sandbox `audit_sla.py`.*";
      } else {
        finalOutput = `### Antigravity Agent Response\n\nSandbox environment successfully created with ID \`env-sim-${Math.random().toString(36).substring(2, 7)}\`.\n\nI have evaluated your request: "${prompt}".\n\n**Key Actions Taken:**\n- Simulated file indexing across ${project?.documents.length || 0} loaded workspace nodes.\n- Performed sandboxed code execution checking terms and clauses.\n- Cross-referenced global compliance regulations.\n\n**Findings Summary:**\n- All ledger operations align with active security settings.\n- Standard SLA gap identified (Alpha 99.99% vs RFP 99.999%).\n\n*The full code snippet is persisted in \`sandbox_output.log\`.*`;
      }

      const simSteps = [
        {
          type: 'thought',
          signature: 'initializing_sandbox',
          summary: 'Provisioning remote sovereign Linux container environment...'
        },
        {
          type: 'thought',
          signature: 'plan_and_search',
          summary: thought1
        },
        {
          type: 'google_search_call',
          signature: 'web_search_audit',
          content: [{ type: 'text', text: searchCall }]
        },
        {
          type: 'google_search_result',
          signature: 'web_search_audit_result',
          content: [{ type: 'text', text: searchResult }]
        },
        {
          type: 'thought',
          signature: 'analyze_data',
          summary: thought2
        },
        {
          type: 'code_execution_call',
          signature: 'python_analysis_exec',
          content: [{ type: 'text', text: codeCall }]
        },
        {
          type: 'code_execution_result',
          signature: 'python_analysis_res',
          content: [{ type: 'text', text: codeResult }]
        },
        {
          type: 'model_output',
          content: [{ type: 'text', text: finalOutput }]
        }
      ];

      addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Antigravity Agent Simulated', `Sandbox interaction executed: "${prompt.substring(0, 45)}...".`, 'info');
      
      res.json({
        id: `inter-sim-${Math.random().toString(36).substring(2, 9)}`,
        environment_id: `env-sim-${Math.random().toString(36).substring(2, 9)}`,
        output_text: finalOutput,
        steps: simSteps,
        status: 'completed'
      });
    }, 2000);
    return;
  }

  // Real Antigravity Flow!
  try {
    addAuditLog('khmzamantonmoy@gmail.com', 'admin', 'Antigravity Agent Invoked', `Invoking real Antigravity agent for prompt: "${prompt.substring(0, 45)}...".`, 'info');

    // Call interactions.create for antigravity-preview-05-2026
    const finalPrompt = `Project Name: "${project?.name || 'DocuGraph'}"
Description: "${project?.description || ''}"

Available Document Context:
${docsContext}

User Directive:
${prompt}

Please process this directive inside your sandbox. Run code, perform searches, or analyze files as necessary. Always write detailed findings back to the user in markdown.`;

    const interaction = await client.interactions.create({
      agent: "antigravity-preview-05-2026",
      input: finalPrompt,
      environment: "remote",
    }, { timeout: 300000 });

    // Retrieve combined full text output from steps
    let fullOutput = "";
    for (const step of (interaction.steps as any[])) {
      if (step.type === 'model_output') {
        const textContent = (step.content as any[])?.find((c: any) => c.type === 'text');
        if (textContent && textContent.text) {
          fullOutput += textContent.text;
        }
      }
    }

    if (!fullOutput) {
      fullOutput = interaction.output_text || "Task complete with no text output returned.";
    }

    res.json({
      id: interaction.id,
      environment_id: interaction.environment_id,
      output_text: fullOutput,
      steps: interaction.steps,
      status: 'completed'
    });

  } catch (error) {
    console.error('Real Antigravity interaction error:', error);
    addAuditLog('system@docugraph.ai', 'admin', 'Antigravity Error', `Antigravity agent failed: ${error instanceof Error ? error.message : String(error)}`, 'critical');
    res.status(500).json({ error: 'Real Antigravity Agent failed to spin up. Ensure your API key is correctly configured and has Agent execution clearance.' });
  }
});

// -------------------------------------------------------------
// Serve static frontend assets & Vite integration
// -------------------------------------------------------------
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
    // Serve client SPA
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuGraph server listening on http://localhost:${PORT}`);
  });
}

startServer();
