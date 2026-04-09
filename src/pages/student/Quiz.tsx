import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, addDoc, doc, updateDoc, increment } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Question } from "@/types";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, ArrowRight, Loader2 } from "lucide-react";

export default function Quiz() {
  const [searchParams] = useSearchParams();
  const curriculumId = searchParams.get("curriculumId");
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (curriculumId) {
      fetchQuestions();
    }
  }, [curriculumId]);

  const fetchQuestions = async () => {
    const q = query(collection(db, "questions"), where("curriculumId", "==", curriculumId));
    const snapshot = await getDocs(q);
    setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question)));
    setLoading(false);
  };

  const handleCheck = async () => {
    if (selectedOption === null) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setIsAnswered(true);

    if (isCorrect) {
      setScore(prev => prev + 1);
      toast.success("Chính xác! +10 XP");
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      toast.error("Chưa đúng rồi!");
    }

    // Save submission
    if (user) {
      await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        questionId: currentQuestion.id,
        isCorrect,
        xpEarned: isCorrect ? 10 : 0,
        timestamp: new Date().toISOString(),
      });

      if (isCorrect) {
        await updateDoc(doc(db, "users", user.uid), {
          xp: increment(10),
          lastActive: new Date().toISOString(),
        });
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      toast.success(`Chúc mừng! Bạn đã hoàn thành bài tập với ${score}/${questions.length} câu đúng.`);
      navigate("/student/dashboard");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>;
  if (questions.length === 0) return <div className="p-8 text-center">Không có câu hỏi cho bài học này.</div>;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Progress Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <XCircle />
        </Button>
        <Progress value={progress} className="h-4 flex-1" />
        <span className="font-bold text-primary">{currentIndex + 1}/{questions.length}</span>
      </div>

      <Card className="border-2 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold leading-relaxed">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                disabled={isAnswered}
                onClick={() => setSelectedOption(index)}
                className={`
                  p-4 text-left rounded-2xl border-2 transition-all text-lg font-medium
                  ${selectedOption === index ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-slate-200 hover:bg-slate-50'}
                  ${isAnswered && index === currentQuestion.correctAnswer ? 'border-green-500 bg-green-50 text-green-700' : ''}
                  ${isAnswered && selectedOption === index && index !== currentQuestion.correctAnswer ? 'border-red-500 bg-red-50 text-red-700' : ''}
                `}
              >
                <span className="mr-4 opacity-50">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          {isAnswered && (
            <div className={`p-4 rounded-xl mt-6 ${selectedOption === currentQuestion.correctAnswer ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="font-bold mb-1 flex items-center gap-2">
                {selectedOption === currentQuestion.correctAnswer ? <CheckCircle2 className="text-green-500" /> : <XCircle className="text-red-500" />}
                {selectedOption === currentQuestion.correctAnswer ? "Tuyệt vời!" : "Giải thích:"}
              </p>
              <p className="text-sm opacity-80">{currentQuestion.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        {!isAnswered ? (
          <Button 
            size="lg" 
            className="w-full md:w-auto px-12 py-6 text-xl rounded-2xl"
            disabled={selectedOption === null}
            onClick={handleCheck}
          >
            Kiểm tra
          </Button>
        ) : (
          <Button 
            size="lg" 
            className="w-full md:w-auto px-12 py-6 text-xl rounded-2xl bg-green-600 hover:bg-green-700"
            onClick={handleNext}
          >
            Tiếp tục <ArrowRight className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
