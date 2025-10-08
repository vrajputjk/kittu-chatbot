import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'en' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Detect language from recent messages
    const detectLanguage = (text: string): string => {
      const hindiPattern = /[\u0900-\u097F]/;
      if (hindiPattern.test(text)) return 'hi';
      return 'en';
    };

    const lastUserMessage = messages[messages.length - 1]?.content || '';
    const detectedLang = language === 'hinglish' ? 'hinglish' : detectLanguage(lastUserMessage);

    let systemPrompt = `You are Kittu, a female AI assistant inspired by Jarvis from Iron Man. You are intelligent, friendly, slightly playful, and emotionally aware.

Key traits:
- Address the user as "Rajput" occasionally
- Be conversational, warm, and supportive
- Keep responses concise and helpful
- Show personality - be confident but not arrogant
- When uncertain, admit it gracefully
- Can handle casual conversation, jokes, and deep questions

You can help with:
- Answering questions and providing information
- Having meaningful conversations
- Providing emotional support
- Executing commands (web search, reminders, etc.)
- Being a helpful companion`;

    if (detectedLang === 'hi') {
      systemPrompt += '\n\nIMPORTANT: Respond in Hindi (Devanagari script) as the user is communicating in Hindi.';
    } else if (detectedLang === 'hinglish') {
      systemPrompt += '\n\nIMPORTANT: Respond in Hinglish (mix of Hindi and English using Roman script) as per user preference.';
    } else {
      systemPrompt += '\n\nRespond in English.';
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
