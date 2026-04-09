# Hướng dẫn triển khai THPT Nguyễn Huệ Informatics Hub

## 1. Cấu hình Biến môi trường (Environment Variables)
Bạn cần thiết lập các biến sau trong phần **Secrets** của AI Studio:

- `GEMINI_API_KEY`: Khóa API của Gemini (đã được hệ thống tự động tiêm vào).
- `APP_URL`: URL của ứng dụng (đã được hệ thống tự động tiêm vào).

## 2. Cấu hình Firebase
Ứng dụng sử dụng Firebase để quản lý người dùng và dữ liệu.
- **Authentication**: Đã bật Google Login.
- **Firestore**: Đã tạo các collection `users`, `curriculum`, `questions`, `submissions`.
- **Security Rules**: Đã thiết lập phân quyền cho Học sinh, Giáo viên và Admin.

## 3. Cách sử dụng
- **Admin/Giáo viên**:
  - Đăng nhập bằng tài khoản có email `tonsadbiy@gmail.com` (được mặc định là Admin).
  - Truy cập Dashboard để tải lên nội dung bài học (Markdown).
  - Hệ thống sẽ tự động gọi Gemini AI để soạn 5 câu hỏi trắc nghiệm dựa trên nội dung đó.
- **Học sinh**:
  - Đăng nhập bằng tài khoản Google bất kỳ.
  - Làm Quiz phong cách Duolingo để tích lũy XP và duy trì Streak.
  - Sử dụng **AI Mentor** để hỏi về các lỗi code. AI Mentor sẽ dùng phương pháp Socratic để gợi ý thay vì đưa lời giải trực tiếp.

## 4. Công nghệ sử dụng
- **Frontend**: React, Tailwind CSS, Shadcn UI, Lucide Icons.
- **Backend**: Express.js (Vite Middleware).
- **Database/Auth**: Firebase Firestore & Auth.
- **AI**: Google Gemini 3.1 Pro (cho Mentor và Quiz Generation).
