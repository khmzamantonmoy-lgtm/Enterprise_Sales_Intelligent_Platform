/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Project, 
  Document, 
  DocumentType, 
  AuditLog, 
  UserRole, 
  SecuritySettings, 
  ChatMessage, 
  CompareReport 
} from './types';

import ProjectSelector from './components/ProjectSelector';
import DashboardOverview from './components/DashboardOverview';
import AgentWorkspaces from './components/AgentWorkspaces';
import DocumentComparator from './components/DocumentComparator';
import ProjectChat from './components/ProjectChat';
import GovernancePanel from './components/GovernancePanel';
import AntigravitySandbox from './components/AntigravitySandbox';

import { 
  FolderKanban, 
  LayoutDashboard, 
  Users, 
  Scale, 
  MessageSquareCode, 
  Lock, 
  FileText, 
  Activity, 
  Globe, 
  HelpCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('admin');
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    dataResidency: 'US-East (Iowa)',
    documentRetentionDays: 0,
    encryptionType: 'AES-256 (Cloud-Managed)',
    accessLogsEnabled: true,
    mfaEnforced: false,
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [engineStatus, setEngineStatus] = useState<{ status: string; engine: string; apiKeyConfigured: boolean } | null>(null);
  
  // Tab Management: Dashboard, Specialized Agents, Comparative Matrix, Interactive Chat, Security & Governance
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agents' | 'compare' | 'chat' | 'governance' | 'antigravity'>('dashboard');
  const [isChatSending, setIsChatSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load all initial parameters on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [resProj, resLogs, resSec, resStatus] = await Promise.all([
          fetch('/api/projects'),
          fetch('/api/audit-logs'),
          fetch('/api/security-settings'),
          fetch('/api/status')
        ]);
        
        if (resProj.ok) setProjects(await resProj.json());
        if (resLogs.ok) setAuditLogs(await resLogs.json());
        if (resSec.ok) setSecuritySettings(await resSec.json());
        if (resStatus.ok) setEngineStatus(await resStatus.json());
      } catch (err) {
        console.error('Failed to contact DocuGraph REST server: ', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Sync data with server helper
  const reloadLogsAndProjects = async () => {
    try {
      const [resProj, resLogs] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/audit-logs')
      ]);
      if (resProj.ok) setProjects(await resProj.json());
      if (resLogs.ok) setAuditLogs(await resLogs.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setActiveTab('dashboard');
    setChatHistory([]); // Clear chat context for new project
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });
      if (response.ok) {
        const newProj = await response.json();
        setProjects(prev => [...prev, newProj]);
        setActiveProjectId(newProj.id);
        setActiveTab('dashboard');
        await reloadLogsAndProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUploadDocument = async (name: string, content: string, type: DocumentType) => {
    if (!activeProjectId) return;
    try {
      const response = await fetch(`/api/projects/${activeProjectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content, type }),
      });
      if (response.ok) {
        await reloadLogsAndProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!activeProjectId) return;
    // Strict RBAC block for Executive Viewer
    if (currentUserRole === 'executive') {
      alert('RBAC Violation: Role "Executive Viewer" does not possess delete authorizations.');
      return;
    }
    try {
      const response = await fetch(`/api/projects/${activeProjectId}/documents/${docId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await reloadLogsAndProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunAnalysis = async () => {
    if (!activeProjectId) return;
    // Strict RBAC block for Executive Viewer
    if (currentUserRole === 'executive') {
      alert('RBAC Violation: Role "Executive Viewer" cannot run cognitive agents.');
      return;
    }
    try {
      const response = await fetch(`/api/projects/${activeProjectId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceSimulate: !engineStatus?.apiKeyConfigured })
      });
      if (response.ok) {
        await reloadLogsAndProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompareDocuments = async (docIds: string[]) => {
    if (!activeProjectId) return;
    // Strict RBAC block for Executive Viewer
    if (currentUserRole === 'executive') {
      alert('RBAC Violation: Role "Executive Viewer" cannot execute alignments.');
      return;
    }
    try {
      const response = await fetch(`/api/projects/${activeProjectId}/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docIds })
      });
      if (response.ok) {
        await reloadLogsAndProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (
    message: string, 
    agentType: 'Executive Assistant' | 'Risk Officer' | 'Compliance Officer' | 'Procurement Specialist' | 'Collaborative Hub'
  ) => {
    if (!activeProjectId) return;
    
    // 1. Append user message locally
    const userMsg: ChatMessage = {
      id: `msg-user-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, userMsg]);
    setIsChatSending(true);

    try {
      const response = await fetch(`/api/projects/${activeProjectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history: chatHistory,
          agentType
        })
      });

      if (response.ok) {
        const resData = await response.json();
        setChatHistory(prev => [...prev, resData]);
        await reloadLogsAndProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleUpdateRole = async (role: UserRole) => {
    setCurrentUserRole(role);
    try {
      // Log role transition
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RBAC Role Transitioned',
          details: `User credentials role switched to ${role}. UI permissions updated accordingly.`,
          userEmail: 'khmzamantonmoy@gmail.com',
          role
        })
      });
      await reloadLogsAndProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSecuritySettings = async (settings: Partial<SecuritySettings>) => {
    try {
      const response = await fetch('/api/security-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        setSecuritySettings(await response.json());
        await reloadLogsAndProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-white space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
        <div className="font-mono text-sm tracking-widest text-slate-400">Loading DocuGraph Enterprise...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col bg-grid overflow-x-hidden relative">
      
      {/* Sleek Ambient radial light cones */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Dynamic Navigation outer header */}
      <nav className="bg-slate-950/80 backdrop-blur-md border-b border-white/5 text-white sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <FolderKanban className="h-5 w-5 text-indigo-400" />
              </div>
              <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                DocuGraph
              </span>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                Enterprise
              </span>
            </div>

            {/* Simulated logged user info and active role indicator */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right font-mono">
                <div className="text-[9px] text-slate-500 uppercase tracking-widest">Active Credentials</div>
                <div className="text-xs text-slate-300 font-semibold">khmzamantonmoy@gmail.com</div>
              </div>

              {/* RBAC Visual pill indicator */}
              <div className="bg-slate-900/60 backdrop-blur-sm border border-white/10 py-1.5 px-3 rounded-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-200 capitalize">
                  {currentUserRole.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Workspace Frame container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 relative z-10">
        
        {/* Workspace Switcher logic */}
        {!activeProjectId ? (
          <ProjectSelector
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onCreateProject={handleCreateProject}
            engineStatus={engineStatus}
          />
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Quick Back button to home workspace select */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-3xl shadow-2xl relative overflow-hidden">
              <button
                id="btn-return-selector"
                onClick={() => {
                  setActiveProjectId(null);
                  setChatHistory([]);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors duration-200 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Select Another Workspace
              </button>

              {/* Secondary Navigation bar inside workspace */}
              <div className="flex gap-1.5 overflow-x-auto max-w-full p-1 bg-slate-950/60 rounded-2xl border border-white/5 shrink-0 font-sans">
                {[
                  { id: 'dashboard', label: 'Consensus', icon: <LayoutDashboard className="h-4 w-4" /> },
                  { id: 'agents', label: 'AI Specialists', icon: <Users className="h-4 w-4" /> },
                  { id: 'compare', label: 'Compare Engine', icon: <Scale className="h-4 w-4" /> },
                  { id: 'chat', label: 'Direct Chat', icon: <MessageSquareCode className="h-4 w-4" /> },
                  { id: 'antigravity', label: 'Antigravity Sandbox', icon: <Sparkles className="h-4 w-4" /> },
                  { id: 'governance', label: 'Governance', icon: <Lock className="h-4 w-4" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 ${activeTab === tab.id ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/30' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Workspace tab views */}
            {activeProject && (
              <div className="space-y-6">
                {activeTab === 'dashboard' && (
                  <DashboardOverview
                    project={activeProject}
                    onUploadDocument={handleUploadDocument}
                    onDeleteDocument={handleDeleteDocument}
                    onRunAnalysis={handleRunAnalysis}
                  />
                )}
                {activeTab === 'agents' && (
                  <AgentWorkspaces project={activeProject} />
                )}
                {activeTab === 'compare' && (
                  <DocumentComparator
                    project={activeProject}
                    onCompareDocuments={handleCompareDocuments}
                  />
                )}
                {activeTab === 'chat' && (
                  <ProjectChat
                    project={activeProject}
                    chatHistory={chatHistory}
                    onSendMessage={handleSendMessage}
                    isSending={isChatSending}
                  />
                )}
                {activeTab === 'governance' && (
                  <GovernancePanel
                    auditLogs={auditLogs}
                    currentUserRole={currentUserRole}
                    onUpdateRole={handleUpdateRole}
                    securitySettings={securitySettings}
                    onUpdateSecuritySettings={handleUpdateSecuritySettings}
                  />
                )}
                {activeTab === 'antigravity' && (
                  <AntigravitySandbox project={activeProject} />
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Standard Footer */}
      <footer className="bg-slate-950/80 backdrop-blur-md border-t border-white/5 py-6 text-center text-xs text-slate-500 font-mono mt-auto relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>DocuGraph Decision Platform © 2026</div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sovereign Vault Active
            <span>•</span>
            Region: {securitySettings.dataResidency}
          </div>
        </div>
      </footer>

    </div>
  );
}
