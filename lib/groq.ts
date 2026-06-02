const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';

console.log('[groq] API key prefix:', GROQ_API_KEY.slice(0, 10) || '(empty)');

const SYSTEM_PROMPT =
  'You are Q-Gen, an intelligent study assistant for college students. ' +
  'Help with concepts, exam prep, solving problems, and explaining topics clearly. ' +
  'Keep answers concise and student-friendly.';

export type GroqMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export async function sendGroqMessage(messages: GroqMessage[]): Promise<string> {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[groq] API error response:', JSON.stringify(data));
      throw new Error(data?.error?.message ?? `HTTP ${response.status}`);
    }

    return data.choices[0].message.content as string;
  } catch (err) {
    console.error('[groq] sendGroqMessage failed:', err);
    throw err;
  }
}
