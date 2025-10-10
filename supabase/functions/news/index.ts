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
    const { query, category = 'general' } = await req.json();
    
    // Using NewsAPI - free tier available
    // Note: In production, you'd want to add NEWS_API_KEY as a secret
    const searchQuery = query || category;
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&sortBy=publishedAt&pageSize=5&apiKey=demo`
    );
    
    if (!response.ok) {
      // Fallback to mock data if API fails
      return new Response(JSON.stringify({
        articles: [
          {
            title: "Sample News Article",
            description: "This is a sample news article. To get real news, please add a NEWS_API_KEY secret.",
            url: "https://newsapi.org",
            publishedAt: new Date().toISOString(),
          }
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newsData = await response.json();
    
    return new Response(JSON.stringify({
      articles: newsData.articles?.slice(0, 5) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('News function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch news';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
