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
    const popular = url.searchParams.get("popular") === "1";
    const genres = url.searchParams.get("genres") === "1";
    const genre = url.searchParams.get("genre") || ""; // single genre id
    const year = url.searchParams.get("year") || ""; // release year

    if (!env.TMDB_API_KEY) {
      return new Response("Server key missing", { status: 500, headers: corsHeaders });
    }

    let target;
    if (id) {
      target = `https://api.themoviedb.org/3/movie/${id}?api_key=${env.TMDB_API_KEY}`;
    } else if (genres) {
      target = `https://api.themoviedb.org/3/genre/movie/list?api_key=${env.TMDB_API_KEY}`;
    } else if (genre || year) {
      // Use discover endpoint when filtering by genre or year.
      const params = new URLSearchParams({ api_key: env.TMDB_API_KEY, sort_by: "popularity.desc" });
      if (genre) params.set("with_genres", genre);
      if (year) params.set("primary_release_year", year);
      target = `https://api.themoviedb.org/3/discover/movie?${params.toString()}`;
    } else if (popular || !query) {
      // Default to popular titles when no query is provided.
      target = `https://api.themoviedb.org/3/movie/popular?api_key=${env.TMDB_API_KEY}`;
    } else {
      target = `https://api.themoviedb.org/3/search/movie?api_key=${env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    }

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
