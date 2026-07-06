/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, Document, DocumentType } from '../types';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  Award, 
  ClipboardCheck, 
  Sparkles,
  Loader,
  X
} from 'lucide-react';

interface DashboardOverviewProps {
  project: Project;
  onUploadDocument: (name: string, content: string, type: DocumentType) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
  onRunAnalysis: () => Promise<void>;
}

export default function DashboardOverview({
  project,
  onUploadDocument,
  onDeleteDocument,
  onRunAnalysis,
}: DashboardOverviewProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [docName, setDocName] = useState('');
  const [docContent, setDocContent] = useState('');
  const [docType, setDocType] = useState<DocumentType>('Contract');
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Suggested high-fidelity templates
  const documentTemplates = [
    {
      name: "Standard Security SLA Addendum",
      type: "Contract" as DocumentType,
      content: `SECTION 4: SYSTEM BACKUP SECURITY
The Service Provider commits to establishing full real-time database failover instances. 
All backup databases containing sovereign enterprise assets must be encrypted at rest using AES-256 and reside exclusively inside the designated primary location bounds.

SECTION 5: BREACH PENALTY EXEMPTIONS
In the event of a catastrophic cyber incident or security data leak originating from software vulnerabilities, the Vendor general liability cap of 1x fees paid is fully applicable, excluding third-party breach class action lawsuits which are capped at $2,000,000.`
    },
    {
      name: "GDPR Sovereign Compliance Policy v2.4",
      type: "Policy" as DocumentType,
      content: `REGULATORY MANDATE: COMPLIANCE STANDARDS v2.4
1. ZERO SENSITIVE DATA CROSS-BORDER transfers outside the EU region. Snapshots replicated outside EU borders constitute a severe Article 44 GDPR compliance failure.
2. Breach reports must be delivered to our sovereign data privacy authority within 72 hours of first awareness.
3. Upon service contract termination, any and all customer data records must be fully purged with cryptographic evidence within 30 days.`
    },
    {
      name: "Vendor Gamma: Proposed CRM Terms",
      type: "Proposal" as DocumentType,
      content: `TERMS OF SERVICE: CUSTOMER ENGAGEMENT SERVICES
AVAILABILITY AND SYSTEM RUNTIMES:
We offer a general uptime commitment of 99.9% monthly runtime. Outages under this threshold are credited 1% of subscription costs up to a maximum credit of 10% monthly.

DATA RETENTION & TERMINATION:
Following system termination, Customer data is preserved in our archives for 90 days, after which it is queued for deletion over an additional 60-day window.`
    }
  ];

  const handleApplyTemplate = (tpl: typeof documentTemplates[0]) => {
    setDocName(tpl.name);
    setDocContent(tpl.content);
    setDocType(tpl.type);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (docName.trim() && docContent.trim()) {
      setIsProcessing(true);
      await onUploadDocument(docName, docContent, docType);
      setDocName('');
      setDocContent('');
      setIsProcessing(false);
      setIsUploading(false);
    }
  };

  const handleTriggerAnalysis = async () => {
    setIsProcessing(true);
    setAnalysisStep(1);
    const interval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < 5) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1200);

    try {
      await onRunAnalysis();
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(interval);
      setIsProcessing(false);
      setAnalysisStep(0);
    }
  };

  // Score badge coloring helpers
  const getRiskColor = (level: string) => {
    if (level === 'High') return 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/5';
    if (level === 'Medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/5';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5';
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div id="dashboard-overview-container" className="space-y-8 text-left">
      
      {/* 1. Project Title & State Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">
            Selected Workspace Overview
          </span>
          <h1 className="text-3xl font-display font-bold text-slate-100 mt-1">
            {project.name}
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          <button
            id="btn-upload-document-trigger"
            onClick={() => setIsUploading(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-white/10 hover:bg-slate-800/40 text-slate-300 hover:text-white font-medium text-sm rounded-xl transition cursor-pointer"
          >
            <Upload className="h-4 w-4 text-slate-400" />
            Add Document
          </button>

          {project.documents.length > 0 && (
            <button
              id="btn-run-collaborative-analysis"
              onClick={handleTriggerAnalysis}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:from-indigo-800 disabled:to-indigo-900 text-white font-medium text-sm rounded-xl transition duration-300 shadow-lg shadow-indigo-500/20 cursor-pointer glow-button"
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Synthesizing Agents...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white text-white" />
                  Run Multi-Agent Review
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Upload Document Modal overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-white/5 bg-slate-950/40">
              <div className="flex items-center gap-2.5">
                <Upload className="h-5 w-5 text-indigo-400" />
                <h3 className="font-display font-semibold text-slate-100">
                  Ingest Enterprise Document
                </h3>
              </div>
              <button
                onClick={() => setIsUploading(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              {/* Templates help section */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Quick-load Enterprise Templates
                </div>
                <div className="flex flex-wrap gap-2">
                  {documentTemplates.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="px-3 py-1.5 bg-slate-950/60 hover:bg-indigo-600/10 text-slate-300 hover:text-indigo-400 rounded-xl text-xs font-semibold border border-white/5 hover:border-indigo-500/20 transition duration-200 cursor-pointer"
                    >
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label htmlFor="modal-doc-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Document Name
                  </label>
                  <input
                    id="modal-doc-name"
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="e.g. Master SLA Agreement Alpha"
                    required
                    className="w-full text-sm bg-slate-950/60 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label htmlFor="modal-doc-type" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Document Classification
                  </label>
                  <select
                    id="modal-doc-type"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentType)}
                    className="w-full text-sm bg-slate-950/60 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-all appearance-none"
                  >
                    <option value="Contract">Contract (SLA, SLA Draft, Terms)</option>
                    <option value="RFP">RFP (Requirements Specification)</option>
                    <option value="Proposal">Vendor Proposal</option>
                    <option value="Policy">Policy / Guideline (GDPR, Compliance)</option>
                    <option value="Other">Supporting Note / Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="modal-doc-content" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex justify-between">
                  <span>Document Text Content</span>
                  <span className="text-[10px] lowercase normal-case text-slate-500 font-mono">
                    {docContent.split(/\s+/).filter(Boolean).length} words
                  </span>
                </label>
                <textarea
                  id="modal-doc-content"
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  placeholder="Paste clause text, proposal paragraphs, or compliance guidelines here..."
                  required
                  rows={8}
                  className="w-full text-sm bg-slate-950/60 border border-white/5 rounded-xl p-3.5 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-all"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
                  className="px-4 py-2 border border-white/10 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/40 cursor-pointer transition-all"
                >
                  Cancel
                </button>
                <button
                  id="btn-modal-doc-submit"
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-medium shadow-lg shadow-indigo-500/20 flex items-center gap-2 cursor-pointer glow-button"
                >
                  {isProcessing && <Loader className="h-4 w-4 animate-spin" />}
                  Upload Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Synthesis Steps Overlay */}
      {analysisStep > 0 && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4 text-white text-center">
          <div className="max-w-md w-full space-y-6 p-6">
            <div className="relative flex justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-indigo-400">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-display font-semibold tracking-wide text-slate-100">
                Specialist AI Consolidation
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Specialist risk, compliance, and commercial agents are running comparative reviews against core requirements.
              </p>
            </div>

            {/* Steps indicator */}
            <div className="bg-slate-900/80 rounded-2xl border border-white/10 p-5 text-left space-y-3.5 font-mono text-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-500 border-b border-white/5 pb-2.5 uppercase tracking-widest font-bold">
                <span>Agent Pipeline Step</span>
                <span>Active</span>
              </div>
              
              <div className="flex items-center gap-2 text-indigo-300">
                <span className={`w-1.5 h-1.5 rounded-full ${analysisStep >= 1 ? 'bg-indigo-400 animate-ping' : 'bg-slate-700'}`} />
                <span className={analysisStep >= 1 ? 'font-semibold text-slate-200' : 'text-slate-500'}>
                  1. Merging Document Context
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${analysisStep >= 2 ? 'bg-indigo-400 animate-ping' : 'bg-slate-700'}`} />
                <span className={analysisStep >= 2 ? 'font-semibold text-slate-200' : 'text-slate-500'}>
                  2. Risk Officer Clause Audits
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${analysisStep >= 3 ? 'bg-indigo-400 animate-ping' : 'bg-slate-700'}`} />
                <span className={analysisStep >= 3 ? 'font-semibold text-slate-200' : 'text-slate-500'}>
                  3. Compliance Policy Alignments
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${analysisStep >= 4 ? 'bg-indigo-400 animate-ping' : 'bg-slate-700'}`} />
                <span className={analysisStep >= 4 ? 'font-semibold text-slate-200' : 'text-slate-500'}>
                  4. Procurement Value Scoring
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${analysisStep >= 5 ? 'bg-indigo-400 animate-ping' : 'bg-slate-700'}`} />
                <span className={analysisStep >= 5 ? 'font-semibold text-slate-200' : 'text-slate-500'}>
                  5. Consolidating Consensus Recommendations
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Core Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-3xl border bg-slate-900/40 backdrop-blur-md shadow-xl flex items-center gap-4 transition-all duration-300 hover:border-white/10 ${getRiskColor(project.overallRiskLevel)}`}>
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 font-mono">
              Contractual Risk Level
            </div>
            <div className="text-xl font-bold font-display mt-1">
              {project.overallRiskLevel} Risk
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border bg-slate-900/40 backdrop-blur-md shadow-xl flex items-center gap-4 transition-all duration-300 hover:border-white/10 ${getScoreColor(project.overallComplianceScore)}`}>
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 font-mono">
              Sovereign Compliance Score
            </div>
            <div className="text-xl font-bold font-display mt-1">
              {project.overallComplianceScore}% Alignment
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-3xl border bg-slate-900/40 backdrop-blur-md shadow-xl flex items-center gap-4 transition-all duration-300 hover:border-white/10 ${getScoreColor(project.overallCommercialScore)}`}>
          <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-slate-500 font-mono">
              Commercial Alignment Score
            </div>
            <div className="text-xl font-bold font-display mt-1">
              {project.overallCommercialScore}% Performance
            </div>
          </div>
        </div>
      </div>

      {/* 5. Documents & Multi-Agent Consensus Column */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column: Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-semibold text-slate-200">
              Document Inventory ({project.documents.length})
            </h3>
            <button
              onClick={() => setIsUploading(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer transition-colors"
            >
              + Ingest File
            </button>
          </div>

          {project.documents.length === 0 ? (
            <div className="bg-slate-900/20 backdrop-blur-sm border border-dashed border-white/10 rounded-3xl p-8 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-slate-950/60 rounded-2xl border border-white/5 flex items-center justify-center text-slate-500">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-300">
                  No documents in workspace
                </div>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Upload contracts, RFP requirements, or company policy directives to initialize AI analysis.
                </p>
              </div>
              <button
                onClick={() => setIsUploading(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer transition shadow-lg shadow-indigo-500/20"
              >
                Ingest First File
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {project.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-white/10 rounded-2xl p-4 flex gap-3 shadow-lg items-start transition-all"
                >
                  <div className="p-2.5 bg-slate-950/60 rounded-xl text-slate-400 border border-white/5 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="flex-1 space-y-1 text-left min-w-0">
                    <div className="font-semibold text-sm text-slate-200 truncate">
                      {doc.name}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono">
                      <span className="px-1.5 py-0.5 bg-slate-950/80 border border-white/5 rounded text-indigo-400 font-bold uppercase tracking-wider">
                        {doc.type}
                      </span>
                      <span>•</span>
                      <span>{doc.wordsCount} words</span>
                      <span>•</span>
                      <span className="text-slate-400">{doc.status}</span>
                    </div>

                    {doc.summary && (
                      <p className="text-xs text-slate-400 line-clamp-2 pt-1 leading-relaxed">
                        {doc.summary}
                      </p>
                    )}
                  </div>

                  <button
                    id={`btn-delete-doc-${doc.id}`}
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                    title="Remove Document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Multi-Agent Consensus */}
        <div className="lg:col-span-3 space-y-4">
          <h3 className="font-display font-semibold text-slate-200 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Consensus Decision Package
          </h3>

          {!project.analysis ? (
            <div className="bg-slate-900/20 backdrop-blur-sm border border-dashed border-white/10 rounded-3xl p-10 text-center space-y-4 min-h-[16rem] flex flex-col justify-center items-center">
              <div className="p-3.5 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Sparkles className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-slate-300">
                  Ready for Collaborative Review
                </div>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Run the Multi-Agent Review. Specialized AI Agents (Executive, Risk, Compliance, Procurement) will process your documents and synthesize strategic decision options.
                </p>
              </div>
              <button
                onClick={handleTriggerAnalysis}
                disabled={project.documents.length === 0}
                className="px-5 py-2.5 bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-500/20 transition cursor-pointer"
              >
                Synthesize Decision Recommendations
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Executive Summary */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  Executive Summary
                </h4>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 text-sm leading-relaxed text-slate-300">
                  {project.executiveSummary || project.analysis.executiveAssistant?.summary}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <ClipboardCheck className="h-3.5 w-3.5 text-indigo-400" />
                  Strategic Guidance
                </h4>
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 max-w-none text-slate-300 leading-relaxed text-xs whitespace-pre-line">
                  {project.recommendation || project.analysis.executiveAssistant?.briefing}
                </div>
              </div>

              {/* Joint Specialist Stamp */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-4">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-slate-300">
                    Joint Specialist Verdict Approved
                  </span>
                </div>
                <div className="font-mono text-[9px]">
                  Consensus: {new Date(project.updatedAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
