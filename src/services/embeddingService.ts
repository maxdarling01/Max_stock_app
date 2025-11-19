export interface EmbeddingResult {
  embedding: number[];
}

const NETLIFY_FUNCTION_URL = '/.netlify/functions/generate-embeddings';
const EMBEDDING_CACHE: Map<string, number[]> = new Map();

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text.trim()) {
    return null;
  }

  const trimmedText = text.trim();
  if (EMBEDDING_CACHE.has(trimmedText)) {
    return EMBEDDING_CACHE.get(trimmedText)!;
  }

  try {
    const response = await fetch(NETLIFY_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: trimmedText }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Embedding generation failed:', errorData);
      return null;
    }

    const data: EmbeddingResult = await response.json();

    if (!data.embedding || !Array.isArray(data.embedding)) {
      console.error('Invalid embedding response format');
      return null;
    }

    EMBEDDING_CACHE.set(trimmedText, data.embedding);
    return data.embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

export function combinedSearchText(tags: string[], category: string): string {
  return `${tags.join(' ')} ${category}`.trim();
}
