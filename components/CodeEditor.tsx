import React, { useState, useEffect, useRef } from 'react';
import { SupportedLanguage } from '../types';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChange: (newCode: string) => void;
}

interface HistoryState {
    code: string;
    cursor: number;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, language, onChange }) => {
  const [html, setHtml] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<number | null>(null);

  // History Stack
  const historyRef = useRef<HistoryState[]>([{ code, cursor: 0 }]);
  const historyIndex = useRef(0);
  const isUndoRedo = useRef(false);

  // Restore cursor position after code update if needed
  useEffect(() => {
    if (cursorRef.current !== null && textareaRef.current) {
        textareaRef.current.selectionStart = cursorRef.current;
        textareaRef.current.selectionEnd = cursorRef.current;
        cursorRef.current = null;
    }
  }, [code]);

  // Sync external code changes (e.g. Reset) to history
  useEffect(() => {
      // If code changed and it wasn't triggered by our own Undo/Redo
      if (!isUndoRedo.current) {
          const currentHist = historyRef.current[historyIndex.current];
          // If the new code is different from what we have in history current index
          if (currentHist && currentHist.code !== code) {
              const nextHistory = historyRef.current.slice(0, historyIndex.current + 1);
              nextHistory.push({ code, cursor: 0 }); // We don't know cursor for external change
              if (nextHistory.length > 50) nextHistory.shift();
              
              historyRef.current = nextHistory;
              historyIndex.current = nextHistory.length - 1;
          }
      }
      isUndoRedo.current = false;
  }, [code]);

  // Sync scroll between textarea, pre, and line numbers
  const handleScroll = () => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
      }

      if (lineNumberRef.current) {
        lineNumberRef.current.scrollTop = scrollTop;
      }
    }
  };

  useEffect(() => {
    // Perform syntax highlighting
    const prism = (window as any).Prism;
    if (prism) {
      const grammer = prism.languages[language] || prism.languages.plaintext;
      const highlighted = prism.highlight(code, grammer, language);
      setHtml(highlighted + '<br>'); 
    } else {
      setHtml(code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '<br>');
    }
  }, [code, language]);

  const saveToHistory = (newCode: string, newCursor: number) => {
      const currentHist = historyRef.current[historyIndex.current];
      if (currentHist && currentHist.code === newCode) return;

      const nextHistory = historyRef.current.slice(0, historyIndex.current + 1);
      nextHistory.push({ code: newCode, cursor: newCursor });
      if (nextHistory.length > 50) nextHistory.shift();
      
      historyRef.current = nextHistory;
      historyIndex.current = nextHistory.length - 1;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const { selectionStart, selectionEnd, value } = e.currentTarget;

    // Undo / Redo
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        
        if (e.shiftKey) {
            // Redo
            if (historyIndex.current < historyRef.current.length - 1) {
                historyIndex.current++;
                const state = historyRef.current[historyIndex.current];
                isUndoRedo.current = true;
                onChange(state.code);
                cursorRef.current = state.cursor;
            }
        } else {
            // Undo
            if (historyIndex.current > 0) {
                historyIndex.current--;
                const state = historyRef.current[historyIndex.current];
                isUndoRedo.current = true;
                onChange(state.code);
                cursorRef.current = state.cursor;
            }
        }
        return;
    }

    // 1. Handle Tab: Insert 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const newValue = value.substring(0, selectionStart) + '    ' + value.substring(selectionEnd);
      const newCursor = selectionStart + 4;
      
      saveToHistory(newValue, newCursor);
      onChange(newValue);
      cursorRef.current = newCursor;
      return;
    }

    // 2. Handle Enter: Smart Indentation
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const lastNewLine = value.lastIndexOf('\n', selectionStart - 1);
      const currentLineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
      const currentLineContent = value.substring(currentLineStart, selectionStart);
      
      // Get current indentation
      const match = currentLineContent.match(/^(\s*)/);
      let indent = match ? match[1] : '';
      
      const trimmed = currentLineContent.trimEnd();
      // Increase indent if line ends with block opener
      const isBlockOpener = ['{', ':', '(', '['].some(op => trimmed.endsWith(op));
      if (isBlockOpener) {
        indent += '    ';
      }

      // Special Case: "Between Braces" -> Open new block
      const charBefore = value[selectionStart - 1];
      const charAfter = value[selectionStart];
      
      if ((charBefore === '{' && charAfter === '}') || 
          (charBefore === '[' && charAfter === ']') || 
          (charBefore === '(' && charAfter === ')')) {
        const parentIndent = indent.substring(0, Math.max(0, indent.length - 4));
        const newValue = value.substring(0, selectionStart) + '\n' + indent + '\n' + parentIndent + value.substring(selectionEnd);
        const newCursor = selectionStart + 1 + indent.length;
        
        saveToHistory(newValue, newCursor);
        onChange(newValue);
        cursorRef.current = newCursor;
        return;
      }

      // Normal Enter
      const newValue = value.substring(0, selectionStart) + '\n' + indent + value.substring(selectionEnd);
      const newCursor = selectionStart + 1 + indent.length;
      
      saveToHistory(newValue, newCursor);
      onChange(newValue);
      cursorRef.current = newCursor;
      return;
    }

    // 3. Handle Closing Brace '}' : Dedent
    if (e.key === '}') {
      const lastNewLine = value.lastIndexOf('\n', selectionStart - 1);
      const currentLineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
      const currentLineContent = value.substring(currentLineStart, selectionStart);

      // If line is whitespace only and roughly matches an indent level, dedent before typing '}'
      if (/^\s+$/.test(currentLineContent) && currentLineContent.length >= 4) {
         e.preventDefault();
         const dedented = currentLineContent.substring(0, currentLineContent.length - 4);
         const newValue = value.substring(0, currentLineStart) + dedented + '}' + value.substring(selectionEnd);
         const newCursor = currentLineStart + dedented.length + 1;
         
         saveToHistory(newValue, newCursor);
         onChange(newValue);
         cursorRef.current = newCursor;
         return;
      }
    }

    // 4. Handle Opening Brace '{' : Add space before if missing
    if (e.key === '{') {
        const charBefore = value[selectionStart - 1];
        // If char before is present, not whitespace, and not another opener
        if (charBefore && !/\s/.test(charBefore) && !['(','[','{'].includes(charBefore)) {
            e.preventDefault();
            const newValue = value.substring(0, selectionStart) + ' {' + value.substring(selectionEnd);
            const newCursor = selectionStart + 2;
            
            saveToHistory(newValue, newCursor);
            onChange(newValue);
            cursorRef.current = newCursor;
            return;
        }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      const cursor = e.target.selectionStart;
      saveToHistory(val, cursor);
      onChange(val);
  };

  return (
    <div className="relative w-full h-full bg-[#1e1e1e] overflow-hidden">
      {/* Line Numbers */}
      <div 
        ref={lineNumberRef}
        className="absolute left-0 top-0 bottom-0 w-[48px] bg-[#1e1e1e] border-r border-[#333] text-gray-500 text-right select-none z-10 font-code text-[14px] leading-[24px] pt-[24px] pr-2 overflow-hidden"
      >
        {code.split('\n').map((_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
        {/* Spacer to match textarea padding bottom */}
        <div className="h-[24px]"></div>
      </div>

      <div className="absolute inset-0 left-[48px] w-[calc(100%-48px)] h-full">
        {/* The Syntax Highlighted Layer */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 m-0 p-[24px] overflow-hidden whitespace-pre break-keep font-code text-[14px] leading-[24px] pointer-events-none text-gray-100"
          style={{
             fontFamily: '"Fira Code", monospace',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* The Editable Layer */}
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="absolute inset-0 w-full h-full m-0 p-[24px] resize-none bg-transparent border-0 outline-none whitespace-pre break-keep font-code text-[14px] leading-[24px] text-transparent caret-blue-500 overflow-auto"
          style={{
             fontFamily: '"Fira Code", monospace',
             WebkitTextFillColor: 'transparent',
             color: 'transparent',
             caretColor: '#3b82f6'
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;