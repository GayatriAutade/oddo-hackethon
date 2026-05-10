import { Router, type IRouter } from "express";
import { SearchCitiesQueryParams } from "@workspace/api-zod";

const CITIES = [
  { name: "Paris", country: "France", region: "Europe", description: "The City of Light, famous for the Eiffel Tower, world-class cuisine, and art.", imageUrl: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400", popularityScore: 9.8, avgDailyCostUsd: 180 },
  { name: "Tokyo", country: "Japan", region: "Asia", description: "A dazzling metropolis where ancient temples meet futuristic technology.", imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400", popularityScore: 9.7, avgDailyCostUsd: 150 },
  { name: "New York", country: "USA", region: "North America", description: "The city that never sleeps, iconic skyline, Broadway, and diverse culture.", imageUrl: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400", popularityScore: 9.6, avgDailyCostUsd: 220 },
  { name: "Rome", country: "Italy", region: "Europe", description: "The Eternal City — ancient ruins, Renaissance art, and incredible food.", imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400", popularityScore: 9.5, avgDailyCostUsd: 140 },
  { name: "Barcelona", country: "Spain", region: "Europe", description: "Gaudi's masterpieces, sun-drenched beaches, and vibrant nightlife.", imageUrl: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400", popularityScore: 9.4, avgDailyCostUsd: 130 },
  { name: "London", country: "UK", region: "Europe", description: "Royal history, world-class museums, and an electric multicultural energy.", imageUrl: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400", popularityScore: 9.3, avgDailyCostUsd: 200 },
  { name: "Bangkok", country: "Thailand", region: "Asia", description: "Street food paradise, glittering temples, and non-stop energy.", imageUrl: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400", popularityScore: 9.2, avgDailyCostUsd: 60 },
  { name: "Dubai", country: "UAE", region: "Middle East", description: "Futuristic skyline, desert adventures, and luxury shopping.", imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400", popularityScore: 9.1, avgDailyCostUsd: 190 },
  { name: "Sydney", country: "Australia", region: "Oceania", description: "Iconic Opera House, stunning harbor, and beautiful beaches.", imageUrl: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400", popularityScore: 9.0, avgDailyCostUsd: 175 },
  { name: "Amsterdam", country: "Netherlands", region: "Europe", description: "Canal-lined streets, world-class museums, and a free-spirited culture.", imageUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5702?w=400", popularityScore: 8.9, avgDailyCostUsd: 160 },
  { name: "Istanbul", country: "Turkey", region: "Europe/Asia", description: "Where East meets West — mosques, bazaars, and the Bosphorus.", imageUrl: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400", popularityScore: 8.8, avgDailyCostUsd: 80 },
  { name: "Bali", country: "Indonesia", region: "Asia", description: "Tropical paradise with rice terraces, temples, and surfing.", imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400", popularityScore: 8.7, avgDailyCostUsd: 55 },
  { name: "Prague", country: "Czech Republic", region: "Europe", description: "Fairy-tale architecture, cobblestone streets, and excellent beer.", imageUrl: "https://images.unsplash.com/photo-1541849546-216549ae216d?w=400", popularityScore: 8.6, avgDailyCostUsd: 90 },
  { name: "Singapore", country: "Singapore", region: "Asia", description: "Ultramodern city-state with fantastic food, Gardens by the Bay.", imageUrl: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=400", popularityScore: 8.5, avgDailyCostUsd: 170 },
  { name: "Lisbon", country: "Portugal", region: "Europe", description: "Fado music, hilltop trams, and Portugal's golden age history.", imageUrl: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400", popularityScore: 8.4, avgDailyCostUsd: 100 },
  { name: "Mexico City", country: "Mexico", region: "North America", description: "Ancient Aztec ruins, incredible street food, and vibrant murals.", imageUrl: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?w=400", popularityScore: 8.3, avgDailyCostUsd: 65 },
  { name: "Cairo", country: "Egypt", region: "Africa", description: "Ancient pyramids, the Sphinx, and the legendary Nile River.", imageUrl: "https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=400", popularityScore: 8.2, avgDailyCostUsd: 50 },
  { name: "Kyoto", country: "Japan", region: "Asia", description: "Geisha districts, thousands of shrines, and cherry blossom beauty.", imageUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400", popularityScore: 8.1, avgDailyCostUsd: 130 },
  { name: "Vienna", country: "Austria", region: "Europe", description: "Imperial palaces, classical music, and coffeehouse culture.", imageUrl: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400", popularityScore: 8.0, avgDailyCostUsd: 145 },
  { name: "Marrakech", country: "Morocco", region: "Africa", description: "Colorful souks, riads, and the magical Djemaa el-Fna square.", imageUrl: "https://images.unsplash.com/photo-1553577999-4b3b4e9a4bda?w=400", popularityScore: 7.9, avgDailyCostUsd: 60 },
];

const router: IRouter = Router();

router.get("/cities/search", async (req, res): Promise<void> => {
  const params = SearchCitiesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  let results = [...CITIES];
  if (params.data.q) {
    const q = params.data.q.toLowerCase();
    results = results.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    );
  }
  if (params.data.country) {
    const country = params.data.country.toLowerCase();
    results = results.filter((c) => c.country.toLowerCase() === country);
  }
  res.json(results.sort((a, b) => (b.popularityScore ?? 0) - (a.popularityScore ?? 0)));
});

export default router;
