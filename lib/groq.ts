export async function sendMessage(messages: { role: string; content: string }[]) {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
    console.log("Groq key loaded:", apiKey ? apiKey.slice(0, 8) + "..." : "MISSING");

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are Q-Gen, an intelligent study assistant for college students. Help with concepts, exam prep, solving problems, and explaining topics clearly. Keep answers concise and student-friendly." },
          ...messages,
        ],
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    console.error("sendMessage failed:", err);
    throw err;
  }
}
