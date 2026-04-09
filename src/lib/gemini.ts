import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

export const getAiMentorFeedback = async (userCode: string, error: string) => {
  const model = "gemini-3.1-pro-preview";
  const systemInstruction = `Bạn là một AI Mentor tại trường THPT Nguyễn Huệ. 
Nhiệm vụ của bạn là hướng dẫn học sinh sửa lỗi code bằng phương pháp Socratic (Socratic Method).
QUY TẮC Cực kỳ quan trọng:
1. KHÔNG BAO GIỜ đưa ra code mẫu hoặc lời giải trực tiếp.
2. Chỉ đặt các câu hỏi gợi mở để học sinh tự nhận ra vấn đề.
3. Gợi ý về logic, cú pháp hoặc thuật toán thông qua các ví dụ tương tự hoặc câu hỏi "Tại sao?".
4. Luôn giữ thái độ khích lệ và chuyên nghiệp.
5. Trả lời bằng tiếng Việt.`;

  const prompt = `Học sinh đang gặp lỗi sau:
Lỗi: ${error}
Code của học sinh:
\`\`\`
${userCode}
\`\`\`
Hãy đặt câu hỏi gợi ý để học sinh tự tìm ra lỗi.`;

  const response = await genAI.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      systemInstruction,
    },
  });

  return response.text;
};

export const generateQuizFromText = async (curriculumText: string) => {
  const model = "gemini-3.1-pro-preview";
  const systemInstruction = `Bạn là một chuyên gia soạn đề thi Tin học THPT. 
Dựa trên nội dung giáo trình được cung cấp, hãy tạo ra 5 câu hỏi trắc nghiệm.
Mỗi câu hỏi phải có 4 lựa chọn (A, B, C, D) và chỉ có 1 đáp án đúng.
Định dạng trả về phải là JSON array.`;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING, description: "Nội dung câu hỏi" },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "4 lựa chọn A, B, C, D",
        },
        correctAnswer: { type: Type.INTEGER, description: "Index của đáp án đúng (0-3)" },
        explanation: { type: Type.STRING, description: "Giải thích ngắn gọn tại sao đáp án đó đúng" },
      },
      required: ["question", "options", "correctAnswer", "explanation"],
    },
  };

  const response = await genAI.models.generateContent({
    model,
    contents: [{ parts: [{ text: `Nội dung giáo trình:\n${curriculumText}` }] }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  return JSON.parse(response.text || "[]");
};
