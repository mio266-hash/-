import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

if (process.env.API_KEY) {
  genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
}

export const generateTissueMessages = async (count: number = 3): Promise<string[]> => {
  if (!genAI) {
    console.warn("Gemini API Key not found. Returning default messages.");
    return fallbackMessages.slice(0, count);
  }

  try {
    // Updated prompt for Chinese context
    const prompt = `生成 ${count} 句简短、治愈、温暖或者稍微有点幽默的中文短句（类似于幸运饼干或网抑云语录）。每句不超过15个字。这些句子是写在抽纸上的，希望能给用户带来解压的感觉。仅返回句子，用竖线 (|) 分隔。不要返回 JSON 或 Markdown。`;
    
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    const messages = text.split('|').map(s => s.trim()).filter(s => s.length > 0);
    
    if (messages.length === 0) return fallbackMessages.slice(0, count);
    return messages;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallbackMessages.slice(0, count);
  }
};

const fallbackMessages = [
  "深呼吸，慢下来。",
  "你已经做得很好了。",
  "休息一下也没关系。",
  "擦去烦恼。",
  "保持柔软。",
  "一步一个脚印。",
  "一切都会好起来的。",
  "生活原本沉闷，但跑起来就有风。",
  "今日宜：发呆。",
  "把不开心都丢掉。"
];