import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { generateQuizFromText } from "@/lib/gemini";
import { Curriculum, UserProfile } from "@/types";
import { Loader2, Plus, BookOpen, BrainCircuit, Users, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [grade, setGrade] = useState("10");
  const [loading, setLoading] = useState(false);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    fetchCurriculums();
    fetchUsers();
  }, []);

  const fetchCurriculums = async () => {
    const q = query(collection(db, "curriculum"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setCurriculums(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Curriculum)));
  };

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    setUsers(snapshot.docs.map(doc => doc.data() as UserProfile));
  };

  const handleUpload = async () => {
    if (!title || !content) return toast.error("Vui lòng điền đầy đủ thông tin");
    
    setLoading(true);
    try {
      const curriculumRef = await addDoc(collection(db, "curriculum"), {
        title,
        content,
        grade: parseInt(grade),
        createdAt: new Date().toISOString(),
      });

      toast.info("Đang dùng AI tạo câu hỏi trắc nghiệm...");
      const aiQuestions = await generateQuizFromText(content);
      
      for (const q of aiQuestions) {
        await addDoc(collection(db, "questions"), {
          ...q,
          curriculumId: curriculumRef.id,
        });
      }

      toast.success(`Đã tải lên bài học và tạo ${aiQuestions.length} câu hỏi!`);
      setTitle("");
      setContent("");
      fetchCurriculums();
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra khi xử lý tài liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCurriculum = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bài học này?")) return;
    
    try {
      await deleteDoc(doc(db, "curriculum", id));
      toast.success("Đã xóa bài học");
      fetchCurriculums();
    } catch (error: any) {
      toast.error("Lỗi xóa dữ liệu: " + (error.message || "Không có quyền hạn"));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bảng điều khiển Admin</h1>
      </div>

      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="curriculum">Quản lý giáo trình</TabsTrigger>
          <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
        </TabsList>

        <TabsContent value="curriculum" className="space-y-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} /> Thêm bài học mới
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input 
                  placeholder="Tiêu đề bài học (vd: Lập trình Python cơ bản)" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="flex gap-4">
                  <Input 
                    type="number" 
                    placeholder="Khối lớp" 
                    className="w-24"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground flex items-center">Lớp {grade}</p>
                </div>
                <Textarea 
                  placeholder="Dán nội dung bài học vào đây để AI tự soạn câu hỏi..." 
                  className="min-h-[300px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Button className="w-full" onClick={handleUpload} disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : <BrainCircuit className="mr-2" />}
                  Tải lên & Tự động tạo Quiz
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen size={20} /> Bài học đã đăng
              </h2>
              {curriculums.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4 flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{c.title}</h3>
                      <p className="text-xs text-muted-foreground">Lớp {c.grade} • {new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteCurriculum(c.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} /> Danh sách người dùng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-bottom text-left">
                      <th className="p-2">Tên</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Vai trò</th>
                      <th className="p-2">XP</th>
                      <th className="p-2">Đăng nhập cuối</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.uid} className="border-bottom hover:bg-slate-50">
                        <td className="p-2 font-medium">{u.displayName}</td>
                        <td className="p-2 text-muted-foreground">{u.email}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                            u.role === 'admin' ? 'bg-red-100 text-red-700' : 
                            u.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-2">{u.xp}</td>
                        <td className="p-2 text-xs">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Chưa rõ"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
