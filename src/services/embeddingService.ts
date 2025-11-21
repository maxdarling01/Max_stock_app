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

export function combinedSearchText(tags: string[], category: string): string {
  return `${tags.join(' ')} ${category}`.trim();
}
