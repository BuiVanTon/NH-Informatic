import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Flame, Trophy, Code2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCodingPage = location.pathname === '/student/coding';

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50 shrink-0">
      <div className={isCodingPage ? "px-4" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xl font-bold text-primary flex items-center gap-2">
              <span className="bg-primary text-white p-1 rounded-lg">NH</span>
              <span className="hidden sm:inline">Nguyễn Huệ Informatics</span>
            </Link>
            
            {user && user.role === 'student' && (
              <div className="hidden md:flex items-center gap-6 ml-8">
                <Link to="/student/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Lộ trình</Link>
                <Link to="/student/coding" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                  <Code2 size={16} />
                  Lập trình
                </Link>
                <Link to="/student/mentor" className="text-sm font-medium hover:text-primary transition-colors">Hỏi Mentor</Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-4 mr-4">
                  <div className="flex items-center gap-1 text-orange-500 font-bold">
                    <Flame size={20} fill="currentColor" />
                    <span>{user.streak || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-blue-500 font-bold">
                    <Trophy size={20} />
                    <span>{user.xp || 0} XP</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || ""} />
                    <AvatarFallback>{user.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <Button variant="ghost" size="icon" onClick={() => logout()}>
                    <LogOut size={20} />
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={() => navigate("/auth/login")}>Đăng nhập</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
