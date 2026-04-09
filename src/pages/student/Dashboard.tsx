import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Curriculum } from "@/types";
import { useNavigate } from "react-router-dom";
import { BookOpen, BrainCircuit, Flame, Trophy, Play } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCurriculums();
  }, []);

  const fetchCurriculums = async () => {
    const q = query(collection(db, "curriculum"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setCurriculums(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Curriculum)));
  };

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* User Stats Hero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-white border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Tổng XP tích lũy</p>
              <h2 className="text-4xl font-bold">{user.xp}</h2>
            </div>
            <Trophy size={48} className="opacity-40" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-400 text-white border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Streak hiện tại</p>
              <h2 className="text-4xl font-bold">{user.streak} ngày</h2>
            </div>
            <Flame size={48} className="opacity-40" fill="currentColor" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-400 text-white border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">AI Mentor</p>
              <Button 
                variant="secondary" 
                className="mt-2"
                onClick={() => navigate("/student/mentor")}
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                Hỏi AI ngay
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Curriculum List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen size={24} /> Bài học của bạn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {curriculums.map((c) => (
            <Card key={c.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{c.title}</CardTitle>
                <p className="text-sm text-muted-foreground">Lớp {c.grade}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span>Tiến độ</span>
                  <span className="font-bold">0%</span>
                </div>
                <Progress value={0} className="h-2" />
                <Button 
                  className="w-full" 
                  onClick={() => navigate(`/student/quiz?curriculumId=${c.id}`)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Bắt đầu học
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
