import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BodySchema = z.object({
  location: z.string().trim().min(1, "Location is required").max(100, "Location too long")
    .regex(/^[a-zA-Z0-9\s,.\-']+$/, "Invalid characters in location"),
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

    const { location } = parsed.data;
    
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
