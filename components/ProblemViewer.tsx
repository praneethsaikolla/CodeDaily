import React from 'react';
import { Problem } from '../types';
import { AlertCircle, FileText } from 'lucide-react';

interface ProblemViewerProps {
  problem: Problem;
}

const ProblemViewer: React.FC<ProblemViewerProps> = ({ problem }) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 bg-white font-sans relative">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <h2 className="text-2xl font-bold text-gray-900 leading-tight">
            {problem.id}. {problem.title}
          </h2>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDifficultyColor(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
        </div>
        
        <div className="prose prose-slate max-w-none text-gray-600 text-sm leading-relaxed">
            <p className="whitespace-pre-line">{problem.description}</p>
        </div>
      </div>

      {/* Examples / Test Cases */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Sample Test Cases</h3>
        </div>
        
        <div className="space-y-4">
          {problem.examples.map((example, idx) => (
            <div key={idx} className="rounded-lg p-4 border bg-gray-50 border-gray-200 text-sm">
              <div className="mb-2">
                <span className="font-semibold text-gray-700 block mb-1">Input:</span> 
                <code className="font-code text-gray-800 bg-black/5 px-2 py-1 rounded block w-fit max-w-full overflow-x-auto">
                    {example.input}
                </code>
              </div>

              <div className="mb-2">
                <span className="font-semibold text-gray-700 block mb-1">Output:</span>
                <code className="font-code text-gray-800 bg-black/5 px-2 py-1 rounded block w-fit max-w-full overflow-x-auto">
                    {example.output}
                </code>
              </div>
              
              {example.explanation && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-700">Explanation:</span>
                    <span className="ml-2 text-gray-600">{example.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Constraints */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Constraints</h3>
        </div>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
          {problem.constraints.map((constraint, idx) => (
            <li key={idx} className="font-code text-xs bg-gray-50 inline-block px-2 py-1 rounded border border-gray-100 w-full">
              {constraint}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProblemViewer;