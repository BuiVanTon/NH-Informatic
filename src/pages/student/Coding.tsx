import React, { useState } from 'react';
import { CodeEditor } from '@/components/CodeEditor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Save, Terminal, BookOpen, ChevronLeft, RotateCcw, Layout, SplitSquareVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  examples: { input: string; output: string; explanation?: string }[];
}

export default function CodingPage() {
  const [code, setCode] = useState('// Bắt đầu viết code của bạn ở đây...\nfunction solve() {\n  console.log("Hello World");\n}\n\nsolve();');
  const [language, setLanguage] = useState<'javascript' | 'python'>('javascript');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFreeCode, setIsFreeCode] = useState(false);
  
  const [problem] = useState<Problem | null>({
    id: '1',
    title: '1. Two Sum',
    difficulty: 'Easy',
    description: 'Cho một mảng số nguyên nums và một số nguyên target, hãy trả về chỉ số của hai số sao cho tổng của chúng bằng target.',
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Vì nums[0] + nums[1] == 9, chúng ta trả về [0, 1].' }
    ]
  });

  const handleRun = () => {
    setIsRunning(true);
    setOutput([]);
    
    setTimeout(() => {
      if (language === 'javascript') {
        try {
          const logs: string[] = [];
          const customLog = (...args: any[]) => {
            logs.push(args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' '));
          };
          
          const originalLog = console.log;
          console.log = customLog;
          
          // eslint-disable-next-line no-eval
          eval(code);
          
          console.log = originalLog;
          setOutput(logs.length > 0 ? logs : ['Code executed successfully (no output)']);
          toast.success('Chạy code thành công!');
        } catch (err: any) {
          setOutput([`Error: ${err.message}`]);
          toast.error('Có lỗi xảy ra khi chạy code!');
        }
      } else {
        setOutput(['Python execution is not supported in the browser yet.']);
      }
      setIsRunning(false);
    }, 500);
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc muốn đặt lại code về ban đầu?')) {
      setCode('// Bắt đầu viết code của bạn ở đây...\nfunction solve() {\n  console.log("Hello World");\n}\n\nsolve();');
      toast.info('Đã đặt lại trình soạn thảo');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Button 
            variant={isFreeCode ? "secondary" : "ghost"} 
            size="sm" 
            className="text-slate-600"
            onClick={() => setIsFreeCode(!isFreeCode)}
          >
            <SplitSquareVertical className="h-4 w-4 mr-2" />
            {isFreeCode ? 'Chế độ bài tập' : 'Code Chay'}
          </Button>
          <div className="h-4 w-[1px] bg-slate-300" />
          <span className="font-medium text-sm">
            {isFreeCode ? 'Trình soạn thảo tự do' : (problem?.title || 'Đang tải...')}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs defaultValue="javascript" onValueChange={(v) => setLanguage(v as any)} className="mr-2">
            <TabsList className="h-8">
              <TabsTrigger value="javascript" className="text-xs">JavaScript</TabsTrigger>
              <TabsTrigger value="python" className="text-xs">Python</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={handleReset} title="Đặt lại code">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => toast.success('Đã lưu!')}>
            <Save className="h-4 w-4 mr-2" />
            Lưu
          </Button>
          <Button size="sm" onClick={handleRun} disabled={isRunning} className="bg-green-600 hover:bg-green-700">
            <Play className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            Chạy
          </Button>
        </div>
      </div>

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-grow overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Left Panel: Problem Description (Hidden in Free Code mode) */}
          {!isFreeCode && problem && (
            <>
              <Panel defaultSize={40} minSize={20}>
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 shadow-sm bg-white rounded-none border-none">
                  <CardHeader className="border-b border-slate-100 py-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-lg font-bold">Mô tả bài toán</CardTitle>
                      <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        problem.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : 
                        problem.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-auto p-6 prose prose-slate max-w-none">
                    <h2 className="text-xl font-bold mb-4">{problem.title}</h2>
                    <p className="text-slate-700 leading-relaxed mb-6">{problem.description}</p>
                    
                    <div className="space-y-6">
                      {problem.examples.map((ex, i) => (
                        <div key={i} className="space-y-2">
                          <h4 className="font-bold text-sm">Ví dụ {i + 1}:</h4>
                          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 font-mono text-sm space-y-1">
                            <p><span className="text-slate-500">Đầu vào:</span> {ex.input}</p>
                            <p><span className="text-slate-500">Đầu ra:</span> {ex.output}</p>
                            {ex.explanation && <p className="text-slate-400 italic mt-2">// {ex.explanation}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Panel>
              <PanelResizeHandle className="w-1 bg-slate-100 hover:bg-blue-400 transition-colors cursor-col-resize" />
            </>
          )}

          {/* Right Panel: Editor & Console */}
          <Panel defaultSize={isFreeCode ? 100 : 60} minSize={30}>
            <PanelGroup direction={isFreeCode ? "horizontal" : "vertical"}>
              {/* Editor */}
              <Panel defaultSize={isFreeCode ? 70 : 65} minSize={20}>
                <Card className="h-full flex flex-col overflow-hidden border-slate-200 shadow-sm bg-white rounded-none border-none">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Code Editor</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                    </div>
                  </div>
                  <CardContent className="p-0 flex-grow overflow-hidden">
                    <CodeEditor 
                      language={language} 
                      initialValue={code} 
                      onChange={setCode}
                      height="100%"
                      className="border-none shadow-none rounded-none h-full"
                    />
                  </CardContent>
                </Card>
              </Panel>
              
              <PanelResizeHandle className={`${isFreeCode ? 'w-1' : 'h-1'} bg-slate-100 hover:bg-blue-400 transition-colors cursor-resize`} />

              {/* Console Output */}
              <Panel defaultSize={isFreeCode ? 30 : 35} minSize={10}>
                <div className="h-full flex flex-col overflow-hidden bg-[#1e1e1e]">
                  <div className="flex items-center px-4 py-1.5 border-b border-white/10 bg-black/20 shrink-0">
                    <Terminal className="h-3 w-3 text-slate-400 mr-2" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Console Output</span>
                  </div>
                  <div className="flex-grow p-3 font-mono text-sm overflow-auto text-slate-300 m-0 scrollbar-thin scrollbar-thumb-white/10">
                    {output.length > 0 ? (
                      output.map((line, i) => (
                        <div key={i} className={`mb-1 ${line.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                          <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString([], {hour12: false})}]</span>
                          {line}
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-600 italic text-xs">Chưa có kết quả thực thi...</div>
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
