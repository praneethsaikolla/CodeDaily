import React from 'react';
import { ExecutionResult } from '../types';
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface ConsoleProps {
  result: ExecutionResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const Console: React.FC<ConsoleProps> = ({ result, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-[#1e1e1e] border-t border-[#333] h-[300px] flex flex-col z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
        <div className="flex items-center gap-2">
            <span className="text-gray-300 font-semibold text-sm">Console</span>
            {result && result.status === 'Pass' && (
                <span className="flex items-center gap-1 text-green-400 text-xs px-2 py-0.5 rounded-full bg-green-400/10">
                    <CheckCircle2 size={12} /> Accepted
                </span>
            )}
            {result && result.status === 'Fail' && (
                <span className="flex items-center gap-1 text-red-400 text-xs px-2 py-0.5 rounded-full bg-red-400/10">
                    <XCircle size={12} /> Wrong Answer
                </span>
            )}
             {result && result.status === 'Error' && (
                <span className="flex items-center gap-1 text-yellow-400 text-xs px-2 py-0.5 rounded-full bg-yellow-400/10">
                    <AlertTriangle size={12} /> Error
                </span>
            )}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {!result && (
            <div className="text-gray-500 italic">Run your code to see results...</div>
        )}

        {result && result.errorMessage && (
             <div className="text-red-400 bg-red-950/30 p-4 rounded-lg border border-red-900/50 whitespace-pre-wrap">
                {result.errorMessage}
            </div>
        )}

        {result && !result.errorMessage && (
            <div className="space-y-6">
                <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>Runtime: {result.executionTime}ms</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {result.results.map((res, idx) => (
                        <div key={idx} className="bg-[#2d2d2d] rounded-lg p-3 border border-[#333]">
                             <div className="flex items-center gap-2 mb-2">
                                {res.passed ? (
                                    <CheckCircle2 className="text-green-500 w-4 h-4" />
                                ) : (
                                    <XCircle className="text-red-500 w-4 h-4" />
                                )}
                                <span className={`font-semibold ${res.passed ? 'text-green-500' : 'text-red-500'}`}>
                                    Test Case {idx + 1}
                                </span>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 text-xs">
                                <div>
                                    <div className="text-gray-500 mb-1">Input</div>
                                    <div className="bg-[#1e1e1e] p-2 rounded text-gray-300 font-code">{res.input}</div>
                                </div>
                                <div className="hidden md:block"></div> {/* Spacer */}
                                
                                <div>
                                    <div className="text-gray-500 mb-1">Expected Output</div>
                                    <div className="bg-[#1e1e1e] p-2 rounded text-gray-300 font-code">{res.expected}</div>
                                </div>
                                <div>
                                    <div className="text-gray-500 mb-1">Actual Output</div>
                                    <div className={`p-2 rounded font-code ${res.passed ? 'bg-[#1e1e1e] text-gray-300' : 'bg-red-900/20 text-red-200'}`}>
                                        {res.actual}
                                    </div>
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
};

export default Console;
