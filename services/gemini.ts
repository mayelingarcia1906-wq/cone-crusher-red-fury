
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const FALLBACK_COMMENTS = [
  "¡Esos conos tenían familia! Ten más cuidado la próxima.",
  "¿Seguro que no compraste la licencia de conducir en una caja de cereal?",
  "El auto rojo es rápido, pero tus reflejos... bueno, hay salud.",
  "¡Casi rompes el récord de... fallar estrepitosamente!",
  "Los conos están celebrando tu derrota ahora mismo.",
  "¿Viste un fantasma o por qué esquivaste los puntos?",
  "Tu estilo de manejo es 'especial', por no decir otra cosa.",
  "¡Directo al desguace con ese motor!",
  "Menos mal que los conos son de plástico, ¿verdad?",
  "¡Tus neumáticos están pidiendo clemencia a gritos!"
];

export async function getGameOverCommentary(score: number): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Short funny sarcastic Spanish comment (max 10 words) about a driver who got ${score} score hitting cones with a red car.`,
    });
    
    const text = response.text?.trim();
    if (!text || text.length === 0) throw new Error("Empty");
    return text;
    
  } catch (error: any) {
    // Silenciamos el error completamente para que no aparezca en consola y usamos fallback
    const randomIndex = Math.floor(Math.random() * FALLBACK_COMMENTS.length);
    return FALLBACK_COMMENTS[randomIndex];
  }
}
