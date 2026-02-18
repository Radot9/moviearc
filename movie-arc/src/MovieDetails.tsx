import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

interface Genre {
  id: number;
  name: string;
}

interface MovieDetailsResponse {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  backdrop_path: string | null;
  poster_path: string | null;
  genres: Genre[];
  tagline?: string;
}

const MovieDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) {
        setError("Missing movie id.");
        return;
      }
      if (!API_KEY) {
        setError("API key missing. Add VITE_TMDB_API_KEY to your .env file.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/movie/${id}?api_key=${API_KEY}`);
        if (!response.ok) throw new Error("Failed to load movie details");
        const data = (await response.json()) as MovieDetailsResponse;
        setMovie(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const backdropUrl = movie?.backdrop_path
    ? `${IMAGE_BASE}/w1280${movie.backdrop_path}`
    : undefined;
  const posterUrl = movie?.poster_path
    ? `${IMAGE_BASE}/w500${movie.poster_path}`
    : "https://via.placeholder.com/400x600";
  const genreNames = movie?.genres?.map((g) => g.name).join(", ") ?? "N/A";
  const year = movie?.release_date ? movie.release_date.slice(0, 4) : "";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        ← Back
      </button>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && movie && (
        <div className="relative overflow-hidden rounded-2xl shadow-xl bg-gray-900 text-white">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: backdropUrl
                ? `linear-gradient(180deg, rgba(12,14,24,0.75) 0%, rgba(12,14,24,0.9) 60%, rgba(12,14,24,1) 100%), url(${backdropUrl})`
                : "linear-gradient(180deg, rgba(12,14,24,0.9) 0%, rgba(12,14,24,1) 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="relative grid gap-8 p-6 md:grid-cols-[auto,1fr] md:p-10">
            <div className="w-full max-w-xs md:max-w-sm">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full rounded-xl shadow-lg"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-300">{year}</p>
                <h1 className="text-3xl font-bold leading-tight">{movie.title}</h1>
                {movie.tagline && (
                  <p className="text-sm italic text-gray-300">“{movie.tagline}”</p>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-gray-200">
                <span className="rounded-full bg-white/10 px-3 py-1">
                  ⭐ {movie.vote_average.toFixed(1)}
                </span>
                {movie.runtime ? (
                  <span className="rounded-full bg-white/10 px-3 py-1">
                    ⏱ {movie.runtime} min
                  </span>
                ) : null}
                <span className="rounded-full bg-white/10 px-3 py-1">
                  Genres: {genreNames}
                </span>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-2">Overview</h2>
                <p className="text-gray-200 leading-relaxed">{movie.overview || "No description available."}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetails;
