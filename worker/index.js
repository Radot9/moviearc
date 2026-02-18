const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get("query") || "";
    const id = url.searchParams.get("id");

    if (!env.TMDB_API_KEY) {
      return new Response("Server key missing", { status: 500, headers: corsHeaders });
    }
    if (!query && !id) {
      return new Response("query or id required", { status: 400, headers: corsHeaders });
    }

    const target = id
      ? `https://api.themoviedb.org/3/movie/${id}?api_key=${env.TMDB_API_KEY}`
      : `https://api.themoviedb.org/3/search/movie?api_key=${env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`;

    const tmdbRes = await fetch(target, { headers: { Accept: "application/json" } });
    if (!tmdbRes.ok) {
      return new Response("TMDB error", { status: tmdbRes.status, headers: corsHeaders });
    }

    const body = await tmdbRes.text();
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
        ...corsHeaders,
      },
    });
  },
};
