import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    
    if (!query) {
      throw new Error('Search query is required');
    }

    // Using DuckDuckGo Instant Answer API (free, no API key needed)
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
      relatedTopics: searchData.RelatedTopics?.slice(0, 5).map((topic: any) => ({
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
