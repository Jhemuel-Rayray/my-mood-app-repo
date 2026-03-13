import api from "./api"; // Reuse your existing axios config

export async function getAIResponse(text) {
  try {
    // We send the user's reflection to our backend
    const response = await api.post("/ai/analyze", { text });
    return response.data.suggestion;
  } catch (error) {
    console.error("AI Error:", error);
    return "Remember to pause, breathe, and take things one step at a time.";
  }
}