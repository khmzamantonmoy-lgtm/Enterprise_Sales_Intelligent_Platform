/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Project, ChatMessage, Citation } from '../types';
import { 
  Send, 
  Sparkles, 
  User, 
  HelpCircle, 
  MessageSquareCode, 
  FileSearch, 
  X, 
  Layers, 
  ShieldAlert, 
  ClipboardCheck, 
  TrendingUp, 
  Award,
  Loader
} from 'lucide-react';

interface ProjectChatProps {
  project: Project;
  chatHistory: ChatMessage[];
  onSendMessage: (message: string, agentType: 'Executive Assistant' | 'Risk Officer' | 'Compliance Officer' | 'Procurement Specialist' | 'Collaborative Hub') => Promise<void>;
  isSending: boolean;
}

export default function ProjectChat({
  project,
  chatHistory,
  onSendMessage,
  isSending,
}: ProjectChatProps) {
  const [userInput, setUserInput] = useState('');
  const [activeAgent, setActiveAgent] = useState<'Executive Assistant' | 'Risk Officer' | 'Compliance Officer' | 'Procurement Specialist' | 'Collaborative Hub'>('Collaborative Hub');
  const [viewingCitation, setViewingCitation] = useState<Citation | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() && !isSending) {
      const msg = userInput;
      setUserInput('');
      await onSendMessage(msg, activeAgent);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    if (!isSending) {
      await onSendMessage(suggestion, activeAgent);
    }
  };

  const getAgentIcon = (type?: string) => {
    const iconClass = "h-4 w-4 shrink-0";
    switch (type) {
      case 'Executive Assistant':
        return <Award className={`${iconClass} text-amber-500`} />;
      case 'Risk Officer':
        return <ShieldAlert className={`${iconClass} text-rose-500`} />;
      case 'Compliance Officer':
        return <ClipboardCheck className={`${iconClass} text-emerald-500`} />;
      case 'Procurement Specialist':
        return <TrendingUp className={`${iconClass} text-indigo-500`} />;
      default:
        return <Layers className={`${iconClass} text-slate-500`} />;
    }
  };

  const getAgentBadgeColor = (type?: string) => {
    switch (type) {
      case 'Executive Assistant':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Risk Officer':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Compliance Officer':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Procurement Specialist':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default:
        return 'bg-slate-800/80 text-slate-400 border-white/5';
    }
  };

  // Sample prompt suggestions based on project type
  const suggestions = {
    'proj-core-banking': [
      "Compare the SLA commitment differences between Alpha and Beta.",
      "What compliance risks does Vendor Alpha's disaster recovery backup present?",
      "Which vendor represents superior long-term financial capital efficiency?"
    ],
    'proj-telecom-sla': [
      "What are the primary liability cap risks inside Section 9.1?",
      "Does the Data Breach Indemnity limit provide adequate financial protection?",
      "Draft a redlined liability exemption clause."
    ],
  }[project.id] || [
    "Summarize the main contractual risks across these documents.",
    "Do any clauses fail standard GDPR sovereign requirements?",
    "Highlight the key commercial SLA targets."
  ];

  return (
    <div id="project-chat-workspace" className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left h-[calc(100vh-14rem)] min-h-[450px]">
      
      {/* Left sidebar: Agent Perspective Selectors */}
      <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
        <div className="space-y-4">
          <div>
            <h5 className="font-display font-bold text-slate-200 flex items-center gap-2">
              <MessageSquareCode className="h-5 w-5 text-indigo-400" />
              Specialist Panels
            </h5>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              Select which specialized AI agent perspective should evaluate your questions.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'Collaborative Hub', name: 'Collaborative Hub', desc: 'Unified group consensus review', icon: <Layers className="h-4.5 w-4.5 text-slate-400" /> },
              { id: 'Executive Assistant', name: 'Executive Assistant', desc: 'Briefings & summarizations', icon: <Award className="h-4.5 w-4.5 text-amber-400" /> },
              { id: 'Risk Officer', name: 'Risk Officer', desc: 'Liability, DR & SLA risks', icon: <ShieldAlert className="h-4.5 w-4.5 text-rose-400" /> },
              { id: 'Compliance Officer', name: 'Compliance Officer', desc: 'GDPR, ISO & policy alignments', icon: <ClipboardCheck className="h-4.5 w-4.5 text-emerald-400" /> },
              { id: 'Procurement Specialist', name: 'Procurement Specialist', desc: 'Cost matrices & commercial weightings', icon: <TrendingUp className="h-4.5 w-4.5 text-indigo-400" /> }
            ].map(agent => (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id as any)}
                className={`w-full p-3 rounded-2xl border text-left flex gap-3 items-start transition cursor-pointer duration-300 ${activeAgent === agent.id ? 'border-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5' : 'border-white/5 hover:bg-white/[0.02] hover:border-white/10'}`}
              >
                <div className="p-1.5 bg-slate-950 rounded-xl border border-white/5 shrink-0">
                  {agent.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200">{agent.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{agent.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-white/5 p-3.5 rounded-2xl text-center space-y-1 mt-4 lg:mt-0">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest">Cognitive Range</div>
          <div className="text-xs text-slate-400 font-medium">
            Project Context: {project.documents.length} Docs Node
          </div>
        </div>
      </div>

      {/* Main chat window container */}
      <div className="lg:col-span-3 flex flex-col bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl relative">
        {/* Chat window Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full bg-indigo-500 animate-pulse`} />
            <h5 className="font-display font-bold text-sm text-slate-200">
              Decision Intelligence Agent: <span className="text-indigo-400">{activeAgent}</span>
            </h5>
          </div>
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Audit Conversation
          </span>
        </div>

        {/* Message Thread Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto space-y-6 py-8">
              <div className="p-4 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h6 className="font-display font-bold text-slate-200">
                  Begin Decision Verification
                </h6>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Query the unified contract and RFP repository. The active Specialist Agent will locate specific paragraphs and deliver trace-back source citations.
                </p>
              </div>

              <div className="space-y-2 text-left w-full">
                <span className="text-[9px] font-bold uppercase text-slate-500 tracking-widest flex items-center gap-1.5 font-mono">
                  <HelpCircle className="h-3.5 w-3.5 text-indigo-400" /> Suggested Queries
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {suggestions.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(sug)}
                      className="p-3 text-left bg-slate-950/45 hover:bg-indigo-500/10 text-xs rounded-2xl border border-white/5 hover:border-indigo-500/30 text-slate-300 transition duration-300 cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {chatHistory.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Agent avatar */}
                    {!isUser && (
                      <div className="p-2 bg-slate-950 border border-white/5 rounded-xl mt-0.5 shrink-0 self-start">
                        {getAgentIcon(msg.agentType)}
                      </div>
                    )}

                    <div className="space-y-1 max-w-[85%] text-left">
                      {/* Name tag */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 font-sans">
                          {isUser ? 'Decision Lead' : msg.agentType || 'DocuGraph'}
                        </span>
                        {!isUser && (
                          <span className={`text-[8px] uppercase tracking-widest font-mono font-bold border px-1.5 py-0.5 rounded-full ${getAgentBadgeColor(msg.agentType)}`}>
                            Verified
                          </span>
                        )}
                        <span className="text-[9px] text-slate-500 font-mono font-semibold">
                          {msg.timestamp.split('T')[1]?.substring(0, 5) || ''}
                        </span>
                      </div>

                      {/* Content block */}
                      <div className={`p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-line border ${isUser ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/10' : 'bg-slate-950/60 border-white/5 text-slate-200'}`}>
                        {msg.content}
                      </div>

                      {/* Citations block */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1.5">
                          {msg.citations.map((cit, idx) => (
                            <button
                              key={idx}
                              onClick={() => setViewingCitation(cit)}
                              className="px-2.5 py-1.5 bg-slate-950 hover:bg-indigo-500/15 text-slate-300 rounded-lg text-[10px] font-mono border border-white/5 flex items-center gap-1 transition cursor-pointer duration-300"
                            >
                              <FileSearch className="h-3.5 w-3.5 text-indigo-400" />
                              Cite: {cit.docName.split(':')[0]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isSending && (
            <div className="flex gap-3.5 justify-start">
              <div className="p-2 bg-slate-950 border border-white/5 rounded-xl mt-0.5 animate-pulse">
                <Layers className="h-4 w-4 text-indigo-400 animate-spin" />
              </div>
              <div className="space-y-1 text-left w-36">
                <span className="text-[10px] font-bold text-slate-500 animate-pulse uppercase tracking-widest font-mono">AI Agent Writing...</span>
                <div className="h-3.5 bg-slate-950 border border-white/5 rounded-lg animate-pulse" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Text Form bar */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/5 flex gap-3.5 bg-slate-950/60">
          <input
            id="chat-input-text"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={isSending}
            placeholder={`Ask ${activeAgent} a strategic question about this project context...`}
            className="flex-1 bg-slate-900/60 border border-white/5 focus:border-indigo-500 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-500"
          />
          <button
            id="chat-btn-submit"
            type="submit"
            disabled={!userInput.trim() || isSending}
            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-750 disabled:from-slate-850 disabled:to-slate-850 disabled:text-slate-600 text-white rounded-xl transition duration-300 shadow-md cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Floating Citation Drawer side-modal */}
        {viewingCitation && (
          <div className="absolute inset-y-0 right-0 max-w-sm w-full bg-slate-900/90 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 text-left">
            <div className="p-4 border-b border-white/5 bg-slate-950/60 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileSearch className="h-4 w-4 text-indigo-400" />
                <span className="font-display font-semibold text-xs text-slate-200">Citation Source Trace</span>
              </div>
              <button
                onClick={() => setViewingCitation(null)}
                className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-slate-200 transition duration-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest">Source Document</div>
                <div className="text-sm font-semibold text-slate-200 leading-snug">
                  {viewingCitation.docName}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest">Contextual Fragment Quote</div>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  &quot;{viewingCitation.text}&quot;
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
