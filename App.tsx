import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProblemViewer from './components/ProblemViewer';
import CodeEditor from './components/CodeEditor';
import Console from './components/Console';
import Button from './components/Button';
import { PROBLEMS } from './constants';
import { SupportedLanguage, ExecutionResult } from './types';
import { evaluateCode } from './services/geminiService';
import { Play, RotateCcw, Monitor, Copy, Check } from 'lucide-react';

const App: React.FC = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [language, setLanguage] = useState<SupportedLanguage>('java');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const currentProblem = PROBLEMS.find(p => p.id === currentDay) || PROBLEMS[0];

  useEffect(() => {
    // Reset code when problem or language changes
    setCode(currentProblem.starterCode[language]);
    setExecutionResult(null);
    setIsConsoleOpen(false);
  }, [currentDay, language, currentProblem]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setIsConsoleOpen(true);
    
    // Simulate slight delay for realism before API call
    setExecutionResult(null);

    try {
      const result = await evaluateCode(code, language, currentProblem);
      setExecutionResult(result);
    } catch (error) {
      setExecutionResult({
        status: 'Error',
        executionTime: 0,
        results: [],
        errorMessage: 'An unexpected error occurred during execution.'
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(currentProblem.starterCode[language]);
    setExecutionResult(null);
    setIsConsoleOpen(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden">
      <Navbar 
        currentDay={currentDay} 
        totalDays={PROBLEMS.length} 
        onDayChange={setCurrentDay} 
      />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Pane - Problem Description */}
        <section className="w-1/2 min-w-[400px] border-r border-gray-200 flex flex-col h-full">
          <ProblemViewer 
            problem={currentProblem} 
          />
        </section>

        {/* Right Pane - Editor */}
        <section className="w-1/2 flex flex-col h-full relative bg-[#1e1e1e]">
          {/* Editor Toolbar */}
          <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                className="bg-[#333] text-gray-200 text-xs rounded px-2 py-1 border border-[#444] focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="c">C</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button 
                 onClick={handleCopy}
                 className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-[#333] transition-colors relative"
                 title="Copy Code"
              >
                {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>

              <button 
                 onClick={handleReset}
                 disabled={isRunning}
                 className="text-gray-400 hover:text-white p-1.5 rounded-md hover:bg-[#333] transition-colors"
                 title="Reset Code"
              >
                <RotateCcw size={14} />
              </button>
              <div className="w-px h-4 bg-[#444]"></div>
              <Button 
                variant="primary" 
                onClick={handleRunCode} 
                isLoading={isRunning}
                className="h-7 text-xs bg-green-600 hover:bg-green-700 border-none"
              >
                {!isRunning && <Play size={12} fill="currentColor" />}
                Run Code
              </Button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 relative min-h-0">
             <CodeEditor 
                key={`${currentDay}-${language}`}
                code={code} 
                language={language} 
                onChange={setCode} 
             />
             
             {/* Floating toggle for console if closed */}
             {!isConsoleOpen && executionResult && (
                <button 
                  onClick={() => setIsConsoleOpen(true)}
                  className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 z-10"
                >
                  <Monitor size={20} />
                </button>
             )}

             <Console 
                result={executionResult} 
                isOpen={isConsoleOpen} 
                onClose={() => setIsConsoleOpen(false)} 
             />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;