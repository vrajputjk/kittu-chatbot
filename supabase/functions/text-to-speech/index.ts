import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BodySchema = z.object({
  text: z.string().trim().min(1, "Text is required").max(5000, "Text too long"),
  language: z.string().max(20).optional().default("en"),
  gender: z.enum(["female", "male"]).optional().default("female"),
});

// ElevenLabs voice IDs for different languages
const voiceMap: Record<string, { id: string; name: string }> = {
  "en-female": { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
  "en-male": { id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },
  "hi-female": { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica" },
  "hi-male": { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel" },
  default: { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0]?.message || "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { text, language, gender } = parsed.data;

    const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
    
    if (!ELEVENLABS_API_KEY) {
      return new Response(
        JSON.stringify({ 
          available: false,
          message: "Premium voice not configured. Using browser voice." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const voiceKey = `${language.split('-')[0]}-${gender}`;
    const voice = voiceMap[voiceKey] || voiceMap.default;

    console.log(`Using ElevenLabs voice: ${voice.name} for ${language}`);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs error:", response.status, errorText);
      throw new Error("Failed to generate speech");
    }

    const audioBuffer = await response.arrayBuffer();
    
    const uint8Array = new Uint8Array(audioBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64Audio = btoa(binary);

    return new Response(
      JSON.stringify({ 
        available: true,
        audioContent: base64Audio,
        voiceName: voice.name 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Text-to-speech error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate speech";
    return new Response(
      JSON.stringify({ 
        available: false,
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
