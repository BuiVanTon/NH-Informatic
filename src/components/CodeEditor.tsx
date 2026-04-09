import React, { useState, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';

interface CodeEditorProps {
  initialValue?: string;
  language?: 'javascript' | 'python';
  theme?: 'dark' | 'light';
  onChange?: (value: string) => void;
  height?: string;
  className?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  initialValue = '',
  language = 'javascript',
  theme = 'dark',
  onChange,
  height = '400px',
  className = '',
}) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = useCallback((val: string) => {
    setValue(val);
    if (onChange) onChange(val);
  }, [onChange]);

  // Custom "Mod": Highlight specific keywords or add custom behavior
  const customMod: Extension = EditorView.theme({
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "#00ff00"
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: "#00ff0033"
    },
    ".cm-content": {
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: "14px"
    }
  });

  const extensions = [
    language === 'javascript' ? javascript({ jsx: true }) : python(),
    customMod,
    EditorView.lineWrapping,
  ];

  return (
    <div className={`rounded-lg overflow-hidden border border-slate-200 shadow-sm h-full flex flex-col ${className}`}>
      <div className="flex-grow overflow-hidden h-full">
        <CodeMirror
          value={value}
          height="100%"
          theme={theme === 'dark' ? oneDark : 'light'}
          extensions={extensions}
          onChange={handleChange}
          className="h-full"
          style={{ height: '100%' }}
          basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          history: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
      </div>
    </div>
  );
};
