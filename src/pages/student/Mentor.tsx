import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAiMentorFeedback } from "@/lib/gemini";
import { BrainCircuit, Send, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "ai";
  content: string;
}

export default function Mentor() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Chào bạn! Tôi là AI Mentor của THPT Nguyễn Huệ. Hãy dán code và lỗi bạn đang gặp phải, tôi sẽ giúp bạn tự tìm ra lời giải!" }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    if (!code || !error) return;

    const userMessage = `Code:\n\`\`\`\n${code}\n\`\`\`\nLỗi: ${error}`;
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const feedback = await getAiMentorFeedback(code, error);
      setMessages(prev => [...prev, { role: "ai", content: feedback || "Tôi không thể xử lý yêu cầu này lúc này." }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-120px)]">
      {/* Left: Input Area */}
      <div className="flex flex-col gap-4">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Dán code lỗi của bạn</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <Textarea 
              placeholder="Dán code vào đây..." 
              className="flex-1 font-mono text-sm resize-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Textarea 
              placeholder="Dán thông báo lỗi (error message) vào đây..." 
              className="h-24 font-mono text-sm resize-none"
              value={error}
              onChange={(e) => setError(e.target.value)}
            />
            <Button onClick={handleAsk} disabled={loading || !code || !error}>
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
              Hỏi Mentor
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Right: Chat Area */}
      <div className="flex flex-col gap-4">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="text-primary" /> AI Mentor (Socratic Method)
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-3 ${msg.role === "ai" ? "flex-row" : "flex-row-reverse"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "ai" ? "bg-primary text-white" : "bg-slate-200"}`}>
                      {msg.role === "ai" ? <BrainCircuit size={16} /> : <User size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[85%] ${msg.role === "ai" ? "bg-slate-100" : "bg-primary text-white"}`}>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center animate-pulse">
                      <BrainCircuit size={16} />
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-100 animate-pulse">
                      Đang suy nghĩ...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
