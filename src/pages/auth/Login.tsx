import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, RefreshCw, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Login() {
  const { loginWithEmail, register, bootstrapAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple Captcha
  const [captcha, setCaptcha] = useState({ q: "", a: 0 });
  const [captchaInput, setCaptchaInput] = useState("");

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setCaptcha({ q: `${num1} + ${num2}`, a: num1 + num2 });
    setCaptchaInput("");
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  if (user) {
    navigate("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (parseInt(captchaInput) !== captcha.a) {
      toast.error("Mã xác nhận không chính xác!");
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name);
        toast.success("Đăng ký thành công!");
      } else {
        await loginWithEmail(email, password);
        toast.success("Đăng nhập thành công!");
      }
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra");
      generateCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleBootstrap = async () => {
    try {
      const res = await bootstrapAdmin();
      if (res.success) {
        toast.success(`Đã tạo Super Admin: ${res.email} / ${res.pass}`);
        setEmail(res.email || "");
        setPassword(res.pass || "");
      } else {
        toast.info(res.message);
      }
    } catch (error: any) {
      toast.error("Lỗi: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">
            NH
          </div>
          <CardTitle className="text-2xl">THPT Nguyễn Huệ</CardTitle>
          <CardDescription>
            {isRegister ? "Tạo tài khoản mới" : "Đăng nhập vào Informatics Hub"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input 
                  id="name" 
                  placeholder="Nguyễn Văn A" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email / Username</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="student@thptnguyenhue.edu.vn" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Xác nhận bạn không phải là robot</Label>
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 px-4 py-2 rounded font-mono font-bold text-lg select-none">
                  {captcha.q} = ?
                </div>
                <Input 
                  className="w-24" 
                  placeholder="Kết quả" 
                  value={captchaInput} 
                  onChange={(e) => setCaptchaInput(e.target.value)} 
                  required 
                />
                <Button type="button" variant="ghost" size="icon" onClick={generateCaptcha}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" size="lg" type="submit" disabled={loading}>
              {loading ? (
                "Đang xử lý..."
              ) : isRegister ? (
                <>
                  <UserPlus className="mr-2 h-5 w-5" />
                  Đăng ký
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Đăng nhập
                </>
              )}
            </Button>
            <div className="flex justify-between w-full">
              <Button 
                variant="link" 
                className="px-0" 
                type="button" 
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Đã có tài khoản? Đăng nhập" : "Chưa có tài khoản? Đăng ký"}
              </Button>
              <Button 
                variant="ghost" 
                className="text-xs text-muted-foreground" 
                type="button" 
                onClick={handleBootstrap}
              >
                <ShieldCheck className="mr-1 h-3 w-3" />
                Bootstrap Admin
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
