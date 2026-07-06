/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuditLog, UserRole, SecuritySettings } from '../types';
import { 
  ShieldAlert, 
  UserCheck, 
  History, 
  Globe, 
  Key, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Activity,
  Lock
} from 'lucide-react';

interface GovernancePanelProps {
  auditLogs: AuditLog[];
  currentUserRole: UserRole;
  onUpdateRole: (role: UserRole) => void;
  securitySettings: SecuritySettings;
  onUpdateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
}

export default function GovernancePanel({
  auditLogs,
  currentUserRole,
  onUpdateRole,
  securitySettings,
  onUpdateSecuritySettings,
}: GovernancePanelProps) {
  const [activeTab, setActiveTab] = useState<'rbac' | 'audit' | 'sec'>('rbac');

  const handleResidencyChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await onUpdateSecuritySettings({ dataResidency: e.target.value as any });
  };

  const handleEncryptionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await onUpdateSecuritySettings({ encryptionType: e.target.value as any });
  };

  const handleRetentionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await onUpdateSecuritySettings({ documentRetentionDays: parseInt(e.target.value) });
  };

  // Helper for role permissions mapping table
  const rolePermissions = [
    { name: 'Executive Viewer', role: 'executive', read: true, upload: false, run: false, delete: false },
    { name: 'Risk Officer', role: 'risk_officer', read: true, upload: true, run: true, delete: false },
    { name: 'Compliance Officer', role: 'compliance_officer', read: true, upload: true, run: true, delete: false },
    { name: 'Procurement Specialist', role: 'procurement_specialist', read: true, upload: true, run: true, delete: false },
    { name: 'Sovereign Administrator', role: 'admin', read: true, upload: true, run: true, delete: true },
  ];

  return (
    <div id="governance-panel-container" className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
      
      {/* Sidebar: Sub-Tabs */}
      <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl">
        <div>
          <h5 className="font-display font-bold text-slate-200 flex items-center gap-2">
            <Lock className="h-5 w-5 text-indigo-400" />
            Security & Governance
          </h5>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Manage enterprise role constraints, sovereign storage parameters, and auditable history chains.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => setActiveTab('rbac')}
            className={`w-full p-3 rounded-2xl border text-left flex gap-3 items-center transition cursor-pointer duration-300 ${activeTab === 'rbac' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-slate-200'}`}
          >
            <UserCheck className="h-4.5 w-4.5 shrink-0" />
            <span className="text-xs font-semibold">RBAC Role Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('sec')}
            className={`w-full p-3 rounded-2xl border text-left flex gap-3 items-center transition cursor-pointer duration-300 ${activeTab === 'sec' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-slate-200'}`}
          >
            <Globe className="h-4.5 w-4.5 shrink-0" />
            <span className="text-xs font-semibold">Sovereign Data Storage</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full p-3 rounded-2xl border text-left flex gap-3 items-center transition cursor-pointer duration-300 ${activeTab === 'audit' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-transparent text-slate-400 hover:bg-white/[0.02] hover:text-slate-200'}`}
          >
            <History className="h-4.5 w-4.5 shrink-0" />
            <span className="text-xs font-semibold">Audit Ledger Logs</span>
          </button>
        </div>
      </div>

      {/* Main content pane */}
      <div className="lg:col-span-3 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
        
        {/* TAB 1: RBAC SIMULATED ROLES */}
        {activeTab === 'rbac' && (
          <div className="space-y-6">
            <div className="space-y-1.5 border-b border-white/5 pb-4">
              <h4 className="font-display font-bold text-slate-200">
                Role-Based Access Control Simulation
              </h4>
              <p className="text-xs text-slate-400">
                Switch between mock organizational credentials to dynamically adjust UI capabilities and access authorization blocks.
              </p>
            </div>

            {/* Select Role Trigger */}
            <div className="space-y-2">
              <label htmlFor="select-user-role" className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block">
                Select active credentials role
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { role: 'executive', label: 'Executive Viewer' },
                  { role: 'risk_officer', label: 'Risk Officer' },
                  { role: 'compliance_officer', label: 'Compliance Officer' },
                  { role: 'procurement_specialist', label: 'Procurement Specialist' },
                  { role: 'admin', label: 'Sovereign Admin' },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => onUpdateRole(item.role as UserRole)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-all duration-350 ${currentUserRole === item.role ? 'ring-2 ring-indigo-500 bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/5' : 'bg-slate-950/40 hover:bg-white/[0.03] text-slate-300 border-white/5'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions Matrix Grid */}
            <div className="space-y-3 pt-2">
              <h5 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-mono">
                Workspace Operational Policy Matrix
              </h5>
              
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-950/20">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-950 border-b border-white/5 text-slate-400 font-bold font-mono uppercase text-[9px] tracking-wider">
                      <th className="p-3.5">Credentials Role</th>
                      <th className="p-3.5 text-center">Read Context</th>
                      <th className="p-3.5 text-center">Ingest Docs</th>
                      <th className="p-3.5 text-center">Run Agents</th>
                      <th className="p-3.5 text-center">Delete Files</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {rolePermissions.map((row) => (
                      <tr 
                        key={row.role}
                        className={currentUserRole === row.role ? 'bg-indigo-500/5 font-semibold text-indigo-300' : ''}
                      >
                        <td className="p-3.5 font-semibold text-slate-200">
                          {row.name} {currentUserRole === row.role && ' (Active)'}
                        </td>
                        <td className={`p-3.5 text-center font-mono text-[10px] font-bold ${row.read ? 'text-emerald-400' : 'text-rose-500/55'}`}>
                          {row.read ? '✓ APPROVED' : '✗ DENIED'}
                        </td>
                        <td className={`p-3.5 text-center font-mono text-[10px] font-bold ${row.upload ? 'text-emerald-400' : 'text-rose-500/55'}`}>
                          {row.upload ? '✓ APPROVED' : '✗ DENIED'}
                        </td>
                        <td className={`p-3.5 text-center font-mono text-[10px] font-bold ${row.run ? 'text-emerald-400' : 'text-rose-500/55'}`}>
                          {row.run ? '✓ APPROVED' : '✗ DENIED'}
                        </td>
                        <td className={`p-3.5 text-center font-mono text-[10px] font-bold ${row.delete ? 'text-emerald-400' : 'text-rose-500/55'}`}>
                          {row.delete ? '✓ APPROVED' : '✗ DENIED'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOVEREIGN SECURITY POLICIES */}
        {activeTab === 'sec' && (
          <div className="space-y-6">
            <div className="space-y-1.5 border-b border-white/5 pb-4">
              <h4 className="font-display font-bold text-slate-200">
                Sovereign Storage & Privacy parameters
              </h4>
              <p className="text-xs text-slate-400">
                Configure GDPR sovereign boundaries, HSM cryptographic layers, and file-retention triggers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Sovereign data residency select */}
              <div className="space-y-2 text-left">
                <label htmlFor="select-data-residency" className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Globe className="h-4 w-4 text-indigo-400" /> Data Residency Boundary
                </label>
                <select
                  id="select-data-residency"
                  value={securitySettings.dataResidency}
                  onChange={handleResidencyChange}
                  className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200"
                >
                  <option value="US-East (Iowa)">US-East (Iowa - Primary Cloud Run Zone)</option>
                  <option value="EU-West (Frankfurt)">EU-West (Frankfurt - GDPR Compliant Boundary)</option>
                  <option value="APAC-East (Tokyo)">APAC-East (Tokyo - Tokyo Sovereign Data Hub)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  Setting this locks document assets strictly within sovereign database boundaries.
                </p>
              </div>

              {/* Cryptography select */}
              <div className="space-y-2 text-left">
                <label htmlFor="select-encryption" className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-indigo-400" /> Cryptographic Key Policy
                </label>
                <select
                  id="select-encryption"
                  value={securitySettings.encryptionType}
                  onChange={handleEncryptionChange}
                  className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200"
                >
                  <option value="AES-256 (Cloud-Managed)">AES-256 (Cloud-Managed Keys - Standard)</option>
                  <option value="AES-256 (Customer-Managed Key)">AES-256 (Customer-Managed Key - BYOK)</option>
                  <option value="HSM Double-Layer">HSM Double-Layer (Hardware-Locked Keys - High-Security)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  Dual-locked key systems backed by local Hardware Security Modules (HSM).
                </p>
              </div>

              {/* Retention limit select */}
              <div className="space-y-2 text-left">
                <label htmlFor="select-retention" className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-indigo-400" /> Document Retention Rule
                </label>
                <select
                  id="select-retention"
                  value={securitySettings.documentRetentionDays}
                  onChange={handleRetentionChange}
                  className="w-full text-xs bg-slate-950 border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200"
                >
                  <option value={0}>Retain Indefinitely (Enterprise Archive Plan)</option>
                  <option value={365}>Purge after 1 Year (Regulatory compliance standard)</option>
                  <option value={2555}>Purge after 7 Years (Banking transaction requirements)</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  System automatically schedules secure, zero-trace shredding of document contexts after expiration.
                </p>
              </div>

              {/* Verified Hardware status */}
              <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl flex items-start gap-3">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 border border-emerald-500/20">
                  <CheckCircle className="h-4.5 w-4.5 animate-pulse" />
                </div>
                <div className="space-y-0.5 text-xs text-left">
                  <div className="font-semibold text-slate-200">
                    Sovereign HSM Active
                  </div>
                  <p className="text-slate-400 leading-relaxed text-[11px]">
                    This platform validates transaction ledger entries on dedicated secure sovereign cloud infrastructure.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: AUDIT LEDGER LOGS */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="space-y-1.5 border-b border-white/5 pb-4">
              <h4 className="font-display font-bold text-slate-200">
                Chronological Audit Ledger Logs
              </h4>
              <p className="text-xs text-slate-400">
                Immutably trace-back every document upload, user interaction, AI agent synthesis run, and policy override.
              </p>
            </div>

            {/* logs feed scrollable */}
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950/40 border border-white/5 rounded-2xl p-3.5 text-xs flex gap-3.5 items-start"
                >
                  <div className={`p-1.5 rounded-lg shrink-0 border ${log.severity === 'critical' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-400 border-white/5'}`}>
                    <Activity className="h-4 w-4" />
                  </div>

                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="font-semibold text-slate-200 truncate">
                        {log.action}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-slate-400 leading-relaxed text-[11px]">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-2 pt-1 text-[9px] text-slate-500 font-mono uppercase font-bold tracking-wider">
                      <span className="text-slate-400">{log.userEmail}</span>
                      <span>•</span>
                      <span>Role: {log.role}</span>
                      <span>•</span>
                      <span>IP: {log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
