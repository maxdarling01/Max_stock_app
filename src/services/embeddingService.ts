export interface EmbeddingResult {
  embedding: number[];
}

const EMBEDDING_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-embeddings`;
const EMBEDDING_CACHE: Map<string, number[]> = new Map();

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text.trim()) {
    throw new Error('Cannot generate embedding: text is empty');
  }

  const trimmedText = text.trim();
  if (EMBEDDING_CACHE.has(trimmedText)) {
    return EMBEDDING_CACHE.get(trimmedText)!;
  }

  try {
    const response = await fetch(EMBEDDING_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ text: trimmedText }),
    });

    if (!response.ok) {
      let errorMessage = `API returned status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If response isn't JSON, use status message
      }
      throw new Error(errorMessage);
    }

    const data: EmbeddingResult = await response.json();

    if (!data.embedding || !Array.isArray(data.embedding)) {
      throw new Error('Invalid response format from embedding API: embedding is missing or not an array');
    }

    EMBEDDING_CACHE.set(trimmedText, data.embedding);
    return data.embedding;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate embedding: ${errorMessage}`);
  }
}

const synonymMap: Record<string, string[]> = {
  'car': ['vehicle', 'automobile', 'driving', 'sedan', 'coupe', 'convertible', 'roadster', 'transportation', 'motor', 'engine', 'wheels', 'auto', 'ride', 'cruising', 'racing', 'Ferrari', 'Bugatti', 'Pagani', 'Corvette', 'Ford GT', 'Koenigsegg', 'Jesko', 'Rolls Royce', 'Audi', 'Aston Martin', 'Lamborghini', 'McLaren', 'Porsche', 'Bentley', 'Maserati', 'Mercedes', 'Alfa Romeo', 'Lexus'],
  'beach': ['ocean', 'water', 'sand', 'shore', 'coast', 'seaside', 'waves', 'tropical', 'paradise', 'surf', 'seashore', 'bay', 'coastline', 'marine', 'aquatic'],
  'sunset': ['dusk', 'evening', 'golden hour', 'sunrise', 'sun', 'dawn', 'twilight', 'horizon', 'sky', 'sundown', 'amber', 'glow', 'daybreak', 'morning', 'rays'],
  'watch': ['timepiece', 'clock', 'wristwatch', 'diamond watch', 'diamonds', 'chronograph', 'luxury watch', 'horology', 'bracelet', 'jewels', 'gems', 'timekeeper', 'rolex', 'patek', 'audemars'],
  'yacht': ['boat', 'vessel', 'ship', 'sailing', 'cruiser', 'sailboat', 'maritime', 'nautical', 'watercraft', 'catamaran', 'marina', 'harbor', 'seafaring', 'deck', 'captain'],
  'supercar': ['car', 'vehicle', 'sports car', 'fast car', 'automobile', 'exotic car', 'hypercar', 'performance car', 'racing car', 'luxury car', 'speedster', 'coupe', 'acceleration', 'horsepower', 'Ferrari', 'Bugatti', 'Pagani', 'Corvette', 'Ford GT', 'Koenigsegg', 'Jesko', 'Rolls Royce', 'Audi', 'Aston Martin', 'Lamborghini', 'McLaren', 'Porsche', 'Bentley', 'Maserati', 'Mercedes', 'Alfa Romeo', 'Lexus'],
  'bugatti': ['car', 'vehicle', 'automobile', 'supercar', 'hypercar', 'sports car', 'luxury car', 'exotic car', 'fast car', 'racing', 'performance', 'expensive', 'elite'],
};

function expandTagWithSynonyms(tag: string): string[] {
  const normalized = tag.toLowerCase();
  const synonyms = synonymMap[normalized] || [];
  return [tag, ...synonyms];
}

export function combinedSearchText(tags: string[], category: string): string {
  const expandedTerms: Set<string> = new Set();

  tags.forEach(tag => {
    expandTagWithSynonyms(tag).forEach(term => expandedTerms.add(term));
  });

  if (category) {
    expandTagWithSynonyms(category).forEach(term => expandedTerms.add(term));
  }

  return Array.from(expandedTerms).join(' ').trim();
}
