import { Router, type IRouter } from "express";
import { ai } from "@workspace/integrations-gemini-ai";
import { GetAiRecommendationsBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const POPULAR_CITIES = [
  { name: "Paris", country: "France", region: "Europe", description: "The City of Light.", imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400", popularityScore: 9.8, avgDailyCostUsd: 180 },
  { name: "Tokyo", country: "Japan", region: "Asia", description: "Ancient temples meet futuristic tech.", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400", popularityScore: 9.7, avgDailyCostUsd: 150 },
  { name: "Bali", country: "Indonesia", region: "Asia", description: "Tropical paradise.", imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400", popularityScore: 8.7, avgDailyCostUsd: 55 },
  { name: "Barcelona", country: "Spain", region: "Europe", description: "Sun, art, and architecture.", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", popularityScore: 9.4, avgDailyCostUsd: 130 },
  { name: "Istanbul", country: "Turkey", region: "Europe/Asia", description: "Where East meets West.", imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400", popularityScore: 8.8, avgDailyCostUsd: 80 },
];

router.post("/ai/recommend", requireAuth, async (req, res): Promise<void> => {
  const parsed = GetAiRecommendationsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{ text: `You are a world-class travel advisor for Traveloop. The user asks: "${parsed.data.prompt}". Provide a helpful, specific, and inspiring travel recommendation in 2-3 paragraphs. Include specific tips about places, food, activities, and practical advice. Be conversational and enthusiastic.` }],
      }],
      config: { maxOutputTokens: 8192 },
    });
    const recommendations = response.text ?? "I couldn't generate recommendations right now. Please try again.";
    res.json({ recommendations, cities: POPULAR_CITIES.slice(0, 3) });
  } catch (err) {
    logger.error({ err }, "AI recommendation error");
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});

export default router;
