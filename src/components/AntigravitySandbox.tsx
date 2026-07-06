/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Project } from '../types';
import { 
  Sparkles, 
  Send, 
  Terminal, 
  Code, 
  Search, 
  BrainCircuit, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Server
} from 'lucide-react';

interface AntigravitySandboxProps {
  project: Project;
}

interface Step {
  type: string;
  signature?: string;
  summary?: string;
  content?: Array<{ type: string; text?: string }>;
}

interface InteractionResponse {
  id: string;
  environment_id: string;
  output_text: string;
  steps: Step[];
  status: string;
}

export default function AntigravitySandbox({ project }: AntigravitySandboxProps) {
  const [prompt, setPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [response, setResponse] = useState<InteractionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Suggested tasks
  const defaultSuggestions = [
    "Execute a python script to verify overall SLA drift across contracts.",
    "Search standard GDPR compliance guidelines for non-EU snapshot transfer rules.",
    "Audit all liability caps for unhedged financial exposure."
  ];

  const handleRunAgent = async (taskText: string) => {
    if (!taskText.trim() || isRunning) return;
    setIsRunning(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/antigravity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: taskText,
          projectId: project.id
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Server error running agent.');
      }

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to invoke Antigravity Sandbox Agent.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRunAgent(prompt);
  };

  // Render step beautifully to show proof of work
  const renderStep = (step: Step, index: number) => {
    switch (step.type) {
      case 'thought':
        return (
          <div key={index} className="flex gap-3 items-start p-3 bg-slate-950/40 rounded-xl border border-white/5">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <div className="text-xs text-left">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-500 block">Agent Reasoning Trace</span>
              <p className="text-slate-300 leading-relaxed mt-0.5">{step.summary || 'Processing context...'}</p>
            </div>
          </div>
        );
      case 'google_search_call':
        return (
          <div key={index} className="flex gap-3 items-start p-3 bg-cyan-500/5 rounded-xl border border-cyan-500/10">
            <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Search className="h-4 w-4" />
            </div>
            <div className="text-xs text-left">
              <span className="font-mono text-[9px] uppercase font-bold text-cyan-500 block">Invoking Google Search</span>
              <p className="text-slate-300 leading-relaxed font-mono mt-0.5">{step.content?.[0]?.text}</p>
            </div>
          </div>
        );
      case 'google_search_result':
        return (
          <div key={index} className="flex gap-3 items-start p-3 bg-slate-950/20 rounded-xl border border-white/5 ml-4">
            <div className="text-xs text-left">
              <span className="font-mono text-[9px] uppercase font-bold text-slate-500 block">Search Grounding Results</span>
              <p className="text-slate-400 leading-relaxed mt-0.5">{step.content?.[0]?.text}</p>
            </div>
          </div>
        );
      case 'code_execution_call':
        return (
          <div key={index} className="flex gap-3 items-start p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Code className="h-4 w-4" />
            </div>
            <div className="text-xs text-left w-full overflow-hidden">
              <span className="font-mono text-[9px] uppercase font-bold text-emerald-400 block">Writing Sandboxed Python Script</span>
              <pre className="text-[10px] text-slate-300 font-mono leading-relaxed mt-1.5 bg-slate-950 p-2.5 rounded-lg border border-white/5 overflow-x-auto">
                {step.content?.[0]?.text}
              </pre>
            </div>
          </div>
        );
      case 'code_execution_result':
        return (
          <div key={index} className="flex gap-3 items-start p-3 bg-slate-950/40 rounded-xl border border-white/5 ml-4 font-mono text-[11px] text-slate-400 text-left">
            <div className="w-full">
              <span className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Sandbox Terminal Output:</span>
              <pre className="bg-black/40 p-2 rounded border border-white/5 text-emerald-400 whitespace-pre-wrap">{step.content?.[0]?.text}</pre>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div id="antigravity-sandbox-workspace" className="grid grid-cols-1 lg:grid-cols-5 gap-6 text-left">
      
      {/* Sidebar: Config & Tasks */}
      <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-5 shadow-xl flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h5 className="font-display font-bold text-slate-200 flex items-center gap-2">
              <Server className="h-5 w-5 text-indigo-400" />
              Antigravity Sandbox Agent
            </h5>
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              Deploys a dedicated, fully secure remote Linux sandbox container. The agent can write/execute code, browse web parameters, and verify structural files in real-time.
            </p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-white/5 rounded-2xl space-y-3">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-mono block">Sandbox Parameters</span>
            <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
              <div className="bg-slate-900 p-2 rounded border border-white/5">
                <span className="text-slate-500 block text-[9px] uppercase">Agent</span>
                <span className="text-slate-300 font-semibold truncate block">antigravity-preview</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-white/5">
                <span className="text-slate-500 block text-[9px] uppercase">Environment</span>
                <span className="text-slate-300 font-semibold block">Remote Linux</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-white/5">
                <span className="text-slate-500 block text-[9px] uppercase">Web Access</span>
                <span className="text-emerald-400 font-bold block">ENABLED</span>
              </div>
              <div className="bg-slate-900 p-2 rounded border border-white/5">
                <span className="text-slate-500 block text-[9px] uppercase">Code Exec</span>
                <span className="text-emerald-400 font-bold block">ENABLED</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-mono block">Quick Directives</span>
            <div className="space-y-1.5">
              {defaultSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  disabled={isRunning}
                  onClick={() => {
                    setPrompt(suggestion);
                    handleRunAgent(suggestion);
                  }}
                  className="w-full text-left p-3 bg-slate-950/45 hover:bg-indigo-500/10 border border-white/5 hover:border-indigo-500/25 rounded-xl text-xs text-slate-300 hover:text-slate-100 transition duration-300 cursor-pointer flex items-start gap-2 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                  <span>{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-950/60 border border-white/5 p-4 rounded-2xl text-center space-y-1 mt-4">
          <div className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-widest">Active Workspace</div>
          <div className="text-xs text-slate-300 font-semibold truncate">
            {project.name}
          </div>
        </div>
      </div>

      {/* Main Execution Arena */}
      <div className="lg:col-span-3 flex flex-col space-y-5">
        
        {/* Interaction Form input */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="agent-prompt" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                Sandbox Execution Prompt
              </label>
              <textarea
                id="agent-prompt"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isRunning}
                placeholder="Instruct the Antigravity Agent to run an audit script, search Google, or evaluate terms..."
                className="w-full bg-slate-950 border border-white/5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs rounded-2xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-[10px] text-slate-500 font-mono">
                Timeout budget: 5.0 minutes
              </span>
              <button
                id="btn-run-antigravity"
                type="submit"
                disabled={!prompt.trim() || isRunning}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-600 text-xs font-semibold text-white rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-300 flex items-center gap-2 cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Executing Agent...
                  </>
                ) : (
                  <>
                    <Terminal className="h-3.5 w-3.5" />
                    Launch Sandbox Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Status and Step Feed */}
        {isRunning && (
          <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 space-y-4 shadow-xl animate-pulse">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin" />
              <div>
                <h6 className="text-xs font-bold text-slate-200">Sandbox Provisioned. Launching execution loop...</h6>
                <p className="text-[10px] text-slate-500 mt-0.5">Please wait while the Antigravity Agent reasons, writes scripts, and verifies parameters.</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-5 flex items-start gap-3 text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs text-left">
              <span className="font-bold block">Sandbox Execution Gaps</span>
              <p className="mt-0.5 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {response && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Steps Timeline showing Proof of Work */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-3.5 shadow-xl">
              <h5 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-mono">
                Sandbox Execution Log (Proof of Work)
              </h5>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {response.steps.map((step, idx) => renderStep(step, idx))}
              </div>
            </div>

            {/* Final Outcome Output */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-400" />
                  <span className="font-display font-bold text-sm text-slate-200">Final Audit Consensus</span>
                </div>
                <span className="text-[9px] font-mono bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 px-2 py-0.5 rounded uppercase">
                  Verified Outcome
                </span>
              </div>
              
              <div className="text-sm text-slate-300 leading-relaxed text-left whitespace-pre-line space-y-4">
                {response.output_text}
              </div>

              <div className="pt-3 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-mono text-slate-500">
                <span>Sandbox ID: {response.environment_id}</span>
                <span>Interaction ID: {response.id}</span>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder before launch */}
        {!isRunning && !response && !error && (
          <div className="bg-slate-900/20 backdrop-blur-sm border border-dashed border-white/10 rounded-3xl p-12 text-center space-y-4 text-slate-500 flex-1 flex flex-col justify-center items-center">
            <Terminal className="h-8 w-8 text-slate-600 animate-pulse" />
            <div className="space-y-1">
              <h6 className="text-xs font-bold text-slate-300">Sandbox Ready for Commands</h6>
              <p className="text-[11px] max-w-sm mx-auto leading-relaxed">
                Provide a prompt or click one of the quick directives to launch the agent inside the remote Linux environment.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
