/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../types';
import { 
  FolderKanban, 
  Plus, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Activity, 
  ShieldAlert, 
  Cpu 
} from 'lucide-react';

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, description: string) => void;
  engineStatus: { status: string; engine: string; apiKeyConfigured: boolean } | null;
}

export default function ProjectSelector({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  engineStatus,
}: ProjectSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreateProject(name, description);
      setName('');
      setDescription('');
      setIsCreating(false);
    }
  };

  return (
    <div id="project-selector-container" className="space-y-8">
      {/* Title & Introduction Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900/40 backdrop-blur-md text-white p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden glow-indigo">
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FolderKanban className="h-6 w-6" />
            </div>
            <h1 className="text-3.5xl font-display font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DocuGraph
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              v1.2 Enterprise
            </span>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            Enterprise Decision Intelligence Platform converting business documents into connected organizational knowledge and evidence-backed executive decisions.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/60 p-4 rounded-2xl border border-white/5 relative z-10">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Cpu className="h-4 w-4 animate-pulse" />
          </div>
          <div className="text-left font-mono text-xs">
            <div className="text-slate-500">Processing Mode</div>
            <div className="flex items-center gap-1.5 font-semibold text-slate-200 mt-0.5">
              <span className={`inline-block w-2 h-2 rounded-full ${engineStatus?.apiKeyConfigured ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-amber-500 shadow-amber-500/30'} animate-pulse`} />
              {engineStatus?.engine || 'Local Simulation'}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Header & Creation Trigger */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2.5">
            Active Decision Workspaces
            <span className="px-2.5 py-0.5 text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full font-mono">
              {projects.length}
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Select a project to upload documents, run specialist reviews, or evaluate contract alignments.
          </p>
        </div>

        {!isCreating && (
          <button
            id="btn-create-project-trigger"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm rounded-xl transition duration-300 shadow-lg shadow-indigo-500/20 cursor-pointer glow-button"
          >
            <Plus className="h-4 w-4" />
            New Workspace
          </button>
        )}
      </div>

      {/* Workspace Creation Form */}
      {isCreating && (
        <form
          id="form-create-project"
          onSubmit={handleSubmit}
          className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="border-b border-white/5 pb-4 flex justify-between items-center">
            <h3 className="font-display font-semibold text-slate-100 flex items-center gap-2.5">
              <FolderKanban className="h-5 w-5 text-indigo-400" />
              Create New Decision Workspace
            </h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 text-left">
              <label htmlFor="input-project-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Workspace Name *
              </label>
              <input
                id="input-project-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 5G Core Infrastructure Procurement"
                required
                className="w-full text-sm bg-slate-950/60 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-all duration-200"
              />
            </div>

            <div className="space-y-2 text-left">
              <label htmlFor="input-project-desc" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Strategic Scope & Description
              </label>
              <input
                id="input-project-desc"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the audit parameters or comparative goals."
                className="w-full text-sm bg-slate-950/60 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-500 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 border border-white/15 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800/40 cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              id="btn-submit-create-project"
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-medium shadow-lg shadow-indigo-500/20 cursor-pointer glow-button"
            >
              Create Workspace
            </button>
          </div>
        </form>
      )}

      {/* Grid of Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          const documentsCount = proj.documents?.length || 0;
          
          return (
            <div
              key={proj.id}
              id={`project-card-${proj.id}`}
              className={`flex flex-col bg-slate-900/40 backdrop-blur-md rounded-3xl border transition-all duration-300 overflow-hidden text-left relative group ${isActive ? 'border-indigo-500/40 shadow-xl shadow-indigo-500/10' : 'border-white/5 hover:border-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-0.5'}`}
            >
              {/* Card Header */}
              <div className="p-6 flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-display font-semibold text-slate-100 group-hover:text-indigo-400 transition-colors line-clamp-1">
                      {proj.name}
                    </h3>
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-widest font-mono shrink-0 border ${proj.overallRiskLevel === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : proj.overallRiskLevel === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {proj.overallRiskLevel} Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                {/* Micro KPIs */}
                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-2xl border border-white/5 text-center">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono">Documents</div>
                    <div className="text-sm font-semibold text-slate-200 flex items-center justify-center gap-1 font-mono mt-0.5">
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      {documentsCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono">Compliance</div>
                    <div className="text-sm font-semibold text-slate-200 font-mono mt-0.5">
                      {proj.overallComplianceScore}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono">Commercial</div>
                    <div className="text-sm font-semibold text-slate-200 font-mono mt-0.5">
                      {proj.overallCommercialScore}%
                    </div>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-1.5">
                    {proj.status === 'Analyzed' || proj.status === 'Collaborating' ? (
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Activity className="h-3.5 w-3.5 text-indigo-400" />
                    )}
                    <span className="font-medium text-slate-300">
                      {proj.status === 'Collaborating' ? 'Collaborative Synthesis' : proj.status === 'Analyzed' ? 'Decision Package Ready' : proj.status === 'Draft' ? 'Needs Agent Run' : 'Awaiting Documents'}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-500">
                    {new Date(proj.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Card CTA */}
              <button
                id={`btn-select-project-${proj.id}`}
                onClick={() => onSelectProject(proj.id)}
                className={`w-full py-3.5 text-center text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${isActive ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-950/80 text-slate-300 hover:bg-indigo-600/10 hover:text-indigo-400 border-t border-white/5'} cursor-pointer`}
              >
                {isActive ? 'Active Workspace' : 'Open Workspace'}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
