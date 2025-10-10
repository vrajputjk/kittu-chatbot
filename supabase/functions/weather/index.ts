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
    const { location } = await req.json();
    
    // Using wttr.in - a free weather service that doesn't require an API key
    const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await response.json();
    
    const current = weatherData.current_condition[0];
    const formattedWeather = {
      location: weatherData.nearest_area[0].areaName[0].value,
      temperature: `${current.temp_C}°C`,
      condition: current.weatherDesc[0].value,
      humidity: `${current.humidity}%`,
      windSpeed: `${current.windspeedKmph} km/h`,
      feelsLike: `${current.FeelsLikeC}°C`,
    };

    return new Response(JSON.stringify(formattedWeather), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Weather function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch weather';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
