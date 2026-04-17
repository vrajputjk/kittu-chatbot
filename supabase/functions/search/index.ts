import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BodySchema = z.object({
  query: z.string().trim().min(1, "Search query is required").max(200, "Query too long"),
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(rawBody);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.errors[0]?.message || "Invalid input" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { query } = parsed.data;

    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch search results');
    }

    const searchData = await response.json();
    
    const results = {
      abstract: searchData.Abstract || searchData.AbstractText,
      heading: searchData.Heading,
      url: searchData.AbstractURL,
      relatedTopics: searchData.RelatedTopics?.slice(0, 5).map((topic: { Text?: string; FirstURL?: string }) => ({
        text: topic.Text,
        url: topic.FirstURL,
      })) || [],
    };

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Search function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to perform search';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
