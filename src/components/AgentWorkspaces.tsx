/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, SpecialistAnalysis, RiskItem, ComplianceItem, ProcurementMetric } from '../types';
import { 
  ShieldAlert, 
  ClipboardCheck, 
  TrendingUp, 
  User, 
  Sparkles, 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Flame, 
  Scale, 
  Target, 
  Plus, 
  Check 
} from 'lucide-react';

interface AgentWorkspacesProps {
  project: Project;
}

export default function AgentWorkspaces({ project }: AgentWorkspacesProps) {
  const [activeAgent, setActiveAgent] = useState<'exec' | 'risk' | 'comp' | 'proc'>('exec');

  const analysis = project.analysis;

  if (!analysis) {
    return (
      <div id="agent-workspace-empty" className="bg-slate-900/20 backdrop-blur-sm border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-4 text-slate-500">
        <Sparkles className="h-10 w-10 text-indigo-400 mx-auto animate-pulse" />
        <h3 className="text-base font-display font-semibold text-slate-200">
          Specialist Workspaces Inactive
        </h3>
        <p className="text-xs max-w-sm mx-auto leading-relaxed text-slate-500">
          Please run the Multi-Agent Review on the dashboard first to invoke the Risk, Compliance, Procurement, and Executive agents.
        </p>
      </div>
    );
  }

  // Helpers for badge coloring
  const getSeverityBadge = (severity: 'High' | 'Medium' | 'Low') => {
    const styles = {
      High: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      Low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    };
    return (
      <span className={`px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded-full tracking-widest ${styles[severity]}`}>
        {severity}
      </span>
    );
  };

  const getStatusBadge = (status: 'Passed' | 'Warning' | 'Failed' | 'Missing') => {
    const styles = {
      Passed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      Warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
      Failed: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      Missing: 'bg-slate-800/80 text-slate-400 border border-white/5',
    };
    const icons = {
      Passed: <CheckCircle className="h-3.5 w-3.5 text-emerald-400 inline mr-1.5" />,
      Warning: <AlertTriangle className="h-3.5 w-3.5 text-amber-400 inline mr-1.5" />,
      Failed: <XCircle className="h-3.5 w-3.5 text-rose-400 inline mr-1.5" />,
      Missing: <AlertTriangle className="h-3.5 w-3.5 text-slate-400 inline mr-1.5" />,
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center shrink-0 ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  return (
    <div id="agent-workspaces-container" className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveAgent('exec')}
          className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition duration-300 cursor-pointer ${activeAgent === 'exec' ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <Award className="h-4 w-4 text-indigo-400" />
          Executive consensus
        </button>
        <button
          onClick={() => setActiveAgent('risk')}
          className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition duration-300 cursor-pointer ${activeAgent === 'risk' ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <ShieldAlert className="h-4 w-4 text-indigo-400" />
          Risk Officer
        </button>
        <button
          onClick={() => setActiveAgent('comp')}
          className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition duration-300 cursor-pointer ${activeAgent === 'comp' ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <ClipboardCheck className="h-4 w-4 text-indigo-400" />
          Compliance Audit
        </button>
        <button
          onClick={() => setActiveAgent('proc')}
          className={`px-5 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition duration-300 cursor-pointer ${activeAgent === 'proc' ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-500/5' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
        >
          <TrendingUp className="h-4 w-4 text-indigo-400" />
          Procurement Value
        </button>
      </div>

      {/* Main tab content */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl text-left">
        
        {/* 1. EXECUTIVE ASSISTANT WORKSPACE */}
        {activeAgent === 'exec' && analysis.executiveAssistant && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/15">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-200">
                    Executive Assistant Consensus Hub
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Provides overall consensus decision scoring and confidence tracing.
                  </p>
                </div>
              </div>

              <div className="text-right flex items-center gap-6">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Confidence Level</div>
                  <div className="text-xl font-bold text-indigo-400 font-mono mt-0.5">
                    {analysis.executiveAssistant.confidenceScore}% Accurate
                  </div>
                </div>
                <div className="border-l border-white/5 pl-6">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Consensus Quality</div>
                  <div className="text-xl font-bold text-slate-200 font-mono mt-0.5">
                    {analysis.executiveAssistant.overallScore}/100
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-3">
                <h5 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1.5 font-mono">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  Consolidated Briefing
                </h5>
                <div className="text-sm text-slate-300 leading-relaxed space-y-4 bg-slate-950/60 border border-white/5 p-5 rounded-2xl">
                  <p className="whitespace-pre-line">{analysis.executiveAssistant.briefing}</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-950/60 p-5 rounded-2xl border border-white/5">
                <h5 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest font-mono">
                  Traceable Organizational Memory
                </h5>
                <p className="text-xs text-slate-400">
                  Document nodes parsed during consensus mapping:
                </p>
                <div className="space-y-2.5 pt-2">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="flex gap-2.5 items-start bg-slate-900/60 p-3.5 rounded-xl border border-white/5">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-slate-300">
                        <span className="font-semibold text-slate-200">{doc.name}</span> — {doc.wordsCount} words analyzed.
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          Status: Active in contextual memory index.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. RISK OFFICER WORKSPACE */}
        {activeAgent === 'risk' && analysis.riskOfficer && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-rose-500/5 p-5 rounded-2xl border border-rose-500/15">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 bg-rose-600/10 text-rose-400 rounded-xl">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-200">
                    Risk Assessment & Mitigation Register
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chief Risk Officer audits liability, financial exposure, and performance continuity.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Risk Score</div>
                <div className="text-xl font-bold text-rose-400 font-mono mt-0.5">
                  {analysis.riskOfficer.overallScore}/100
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest font-mono">
                Identified Exposures & Liabilities
              </h5>

              {(!analysis.riskOfficer.risks || analysis.riskOfficer.risks.length === 0) ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No critical risks identified.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {analysis.riskOfficer.risks.map((risk) => (
                    <div
                      key={risk.id}
                      className="border border-white/5 bg-slate-900/60 rounded-2xl p-5 hover:border-white/10 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono uppercase bg-slate-950/80 border border-white/5 px-2 py-0.5 text-indigo-400 rounded font-bold tracking-wider">
                            {risk.category}
                          </span>
                          <h6 className="font-semibold text-slate-200 text-sm mt-1.5">
                            {risk.clause}
                          </h6>
                        </div>
                        {getSeverityBadge(risk.severity)}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-white/5">
                        <span className="font-bold text-[9px] uppercase text-slate-500 block mb-1 font-mono tracking-wider">Risk Description:</span>
                        {risk.description}
                      </p>

                      <div className="text-xs leading-relaxed text-slate-300 flex gap-2 items-start pt-1">
                        <div className="p-0.5 bg-indigo-500/10 text-indigo-400 rounded mt-0.5 border border-indigo-500/20 shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-[9px] text-indigo-400 block uppercase tracking-widest font-mono mb-0.5">Proposed Legal Mitigation:</span>
                          {risk.recommendation}
                        </div>
                      </div>

                      <div className="text-[9px] text-slate-500 font-mono text-right pt-1">
                        Found in: {risk.targetDocName}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. COMPLIANCE AUDIT WORKSPACE */}
        {activeAgent === 'comp' && analysis.complianceOfficer && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/15">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-200">
                    Compliance Audit & Redlining Workspace
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chief Compliance Officer audits sovereign privacy limits, GDPR, SOC 2, and security covenants.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Compliance Index</div>
                <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                  {analysis.complianceOfficer.overallScore}/100
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest font-mono">
                Regulatory Audits & Contractual Gaps
              </h5>

              {(!analysis.complianceOfficer.checklists || analysis.complianceOfficer.checklists.length === 0) ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No compliance checks mapped.
                </div>
              ) : (
                <div className="space-y-4">
                  {analysis.complianceOfficer.checklists.map((check) => (
                    <div
                      key={check.id}
                      className="border border-white/5 bg-slate-900/60 rounded-2xl p-5 hover:border-white/10 transition-all space-y-4"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono bg-slate-950/80 border border-white/5 px-2 py-0.5 text-indigo-400 rounded font-bold uppercase tracking-wider">
                            Standard: {check.standardName}
                          </span>
                          <h6 className="font-semibold text-slate-200 text-sm mt-1.5">
                            {check.clauseName}
                          </h6>
                        </div>
                        {getStatusBadge(check.status)}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {check.description}
                      </p>

                      {check.sourceText && (
                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 text-xs font-mono text-slate-400 leading-relaxed">
                          <span className="font-bold text-[9px] text-slate-500 block mb-1 uppercase font-sans tracking-wider">Extracted Contract Source:</span>
                          &quot;{check.sourceText}&quot;
                        </div>
                      )}

                      {check.redlineRecommendation && (
                        <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-xl text-xs space-y-1.5 leading-relaxed">
                          <span className="font-bold text-[9px] text-rose-400 block uppercase tracking-widest font-mono">
                            Legal Redline Recommendation:
                          </span>
                          <p className="text-slate-300 whitespace-pre-line">
                            {check.redlineRecommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. PROCUREMENT DIRECT WORKSPACE */}
        {activeAgent === 'proc' && analysis.procurementSpecialist && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-indigo-500/5 p-5 rounded-2xl border border-indigo-500/15">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-slate-200">
                    Procurement, Economics & SLA Metrics
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Procurement specialist compares capital efficiencies, total cost of ownership (TCO), and SLA credit penalty structures.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">Commercial Score</div>
                <div className="text-xl font-bold text-indigo-400 font-mono mt-0.5">
                  {analysis.procurementSpecialist.overallScore}/100
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest font-mono">
                Value Engineering Matrix
              </h5>

              {(!analysis.procurementSpecialist.metrics || analysis.procurementSpecialist.metrics.length === 0) ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No commercial metrics logged.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {analysis.procurementSpecialist.metrics.map((metric) => (
                    <div
                      key={metric.id}
                      className="border border-white/5 bg-slate-900/60 rounded-2xl p-5 hover:border-white/10 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h6 className="font-semibold text-slate-200 text-sm">
                            {metric.category}
                          </h6>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Assigned evaluation weight: {metric.weight}%
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider font-mono">Metric Score</span>
                            <span className="text-sm font-bold text-indigo-400 font-mono">
                              {metric.score}/100
                            </span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-16 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                              style={{ width: `${metric.score}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {metric.description}
                      </p>

                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-white/5 text-xs text-slate-300 leading-relaxed flex gap-2">
                        <div className="p-0.5 bg-slate-900 rounded border border-white/5 shrink-0 self-start">
                          <Check className="h-3.5 w-3.5 text-slate-400" />
                        </div>
                        <div>
                          <span className="font-bold text-[9px] text-slate-500 block uppercase font-mono tracking-wider mb-0.5">Procurement Analysis Comments:</span>
                          {metric.comments}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
