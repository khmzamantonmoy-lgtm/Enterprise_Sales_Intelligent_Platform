/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project, CompareReport, Document } from '../types';
import { 
  Scale, 
  CheckCircle, 
  HelpCircle, 
  AlertTriangle, 
  Shuffle, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Award,
  Loader
} from 'lucide-react';

interface DocumentComparatorProps {
  project: Project;
  onCompareDocuments: (docIds: string[]) => Promise<void>;
}

export default function DocumentComparator({
  project,
  onCompareDocuments,
}: DocumentComparatorProps) {
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const handleToggleDoc = (docId: string) => {
    setSelectedDocIds(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId) 
        : [...prev, docId]
    );
  };

  const handleRunCompare = async () => {
    if (selectedDocIds.length < 2) return;
    setIsComparing(true);
    try {
      await onCompareDocuments(selectedDocIds);
    } catch (err) {
      console.error(err);
    } finally {
      setIsComparing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 font-bold font-mono';
    if (score >= 5) return 'text-amber-400 font-semibold font-mono';
    return 'text-rose-400 font-semibold font-mono';
  };

  const compareReport = project.compareReport;

  return (
    <div id="document-comparator-container" className="space-y-6 text-left">
      {/* Selection Panel */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
        <div>
          <h4 className="font-display font-bold text-slate-200 flex items-center gap-2">
            <Shuffle className="h-5 w-5 text-indigo-400 animate-pulse" />
            Side-by-Side Contract Comparison
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Select two or more uploaded proposals, policies, or RFPs to perform multi-standard clause compliance and commercial metric comparison.
          </p>
        </div>

        {/* Checkbox selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
          {project.documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id);
            return (
              <button
                key={doc.id}
                onClick={() => handleToggleDoc(doc.id)}
                className={`p-3.5 rounded-2xl border text-left flex gap-3 items-start transition cursor-pointer duration-300 ${isSelected ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-slate-950/40 hover:border-white/10 hover:bg-slate-950/60'}`}
              >
                <div className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-700 bg-slate-950'}`}>
                  {isSelected && <span className="text-[10px] font-bold">✓</span>}
                </div>
                <div className="text-xs space-y-0.5 min-w-0">
                  <span className="font-semibold text-slate-200 line-clamp-1">
                    {doc.name}
                  </span>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 uppercase font-bold">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.wordsCount} words</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t border-white/5">
          <button
            id="btn-trigger-compare"
            onClick={handleRunCompare}
            disabled={selectedDocIds.length < 2 || isComparing}
            className="relative px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            {isComparing ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Aligning Clauses...
              </>
            ) : (
              <>
                <Scale className="h-4 w-4" />
                Compare Selected Documents
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comparison results */}
      {!compareReport ? (
        <div id="compare-empty-state" className="bg-slate-900/20 border border-white/10 border-dashed rounded-3xl p-12 text-center space-y-4">
          <Scale className="h-10 w-10 text-indigo-400 mx-auto animate-pulse" />
          <h5 className="font-display font-semibold text-slate-200">
            Comparative Grid Inactive
          </h5>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Choose at least two documents from the workspace list above and click Compare to evaluate SLA alignments and regulatory compliance matrices side-by-side.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main comparison matrix table */}
          <div className="bg-slate-900/40 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-slate-950/60">
              <h5 className="font-display font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-indigo-400" />
                Comparative Evaluation Matrix
              </h5>
              <span className="text-[9px] font-mono bg-indigo-500/10 px-2.0 py-0.5 text-indigo-400 border border-indigo-500/20 rounded font-bold uppercase tracking-widest">
                AI Alignment Grids
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-white/5 text-slate-400 uppercase tracking-wider font-bold font-mono text-[10px]">
                    <th className="p-4 w-1/4">Requirement Feature</th>
                    <th className="p-4 w-1/5">Compliance Target</th>
                    {project.documents.filter(d => compareReport.targetDocIds.includes(d.id)).map(doc => (
                      <th key={doc.id} className="p-4 min-w-[200px] border-l border-white/5">
                        {doc.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {compareReport.matrix.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors duration-200">
                      <td className="p-4 align-top font-semibold text-slate-200">
                        {row.feature}
                      </td>
                      <td className="p-4 align-top text-slate-400 leading-relaxed">
                        {row.criteria}
                      </td>
                      {project.documents.filter(d => compareReport.targetDocIds.includes(d.id)).map(doc => {
                        const evalData = row.evaluations[doc.id] || row.evaluations[doc.name] || { score: 0, comment: 'Evaluation not completed.' };
                        return (
                          <td key={doc.id} className="p-4 align-top border-l border-white/5 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold uppercase text-slate-500 font-mono">Score</span>
                              <span className={`text-sm ${getScoreColor(evalData.score)}`}>
                                {evalData.score}/10
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-[11px]">
                              {evalData.comment}
                            </p>
                            {evalData.sourceText && (
                              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 font-mono text-[10px] text-slate-400 leading-relaxed max-h-[100px] overflow-y-auto">
                                &quot;{evalData.sourceText}&quot;
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Strategic redlines proposed */}
          {compareReport.redlines && compareReport.redlines.length > 0 && (
            <div className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h5 className="font-display font-bold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
                Critical Redline Amendments proposed
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {compareReport.redlines.map((red, i) => {
                  const targetDoc = project.documents.find(d => d.id === red.docId);
                  return (
                    <div key={i} className="border border-white/5 rounded-2xl p-4 space-y-3 bg-slate-950/20">
                      <div className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                        Document Target: {targetDoc ? targetDoc.name : 'Unknown Document'}
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="line-through text-xs text-rose-400 font-mono p-2.5 bg-rose-500/5 rounded-xl border border-rose-500/10">
                          &quot;{red.originalText}&quot;
                        </div>
                        <div className="text-xs text-emerald-400 font-mono p-2.5 bg-emerald-500/5 rounded-xl border border-emerald-500/10 font-semibold">
                          &quot;{red.suggestedText}&quot;
                        </div>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                        <span className="font-bold text-[9px] text-slate-500 block uppercase font-mono tracking-widest mb-0.5">Redlining Motive:</span>
                        {red.reason}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Award Selection */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/15 rounded-3xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
            <div className="flex items-start gap-4 text-left">
              <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-2xl shrink-0">
                <Award className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h5 className="font-display font-bold text-slate-200">
                  Decision Consensus Award Recommendation
                </h5>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {compareReport.summary}
                </p>
                {compareReport.winningDocId && (
                  <div className="text-[10px] text-indigo-400 font-mono font-bold pt-1 uppercase tracking-widest">
                    Consensus Favorite Candidate: {project.documents.find(d => d.id === compareReport.winningDocId)?.name || compareReport.winningDocId}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
