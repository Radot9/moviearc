import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import SearchIcon from "./assets/Search.svg";
import MovieCard, { type Movie } from "./MovieCard";
import MovieDetails from "./MovieDetails.tsx";

const PROXY_BASE = import.meta.env.VITE_PROXY_BASE;
const API_GENRES = `${PROXY_BASE}?genres=1`;

const Home = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genreMap, setGenreMap] = useState<Record<number, string>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const buildMoviesUrl = (title: string) => {
    const params = new URLSearchParams();
    const trimmed = title.trim();

    if (selectedGenre) params.set("genre", selectedGenre);
    if (selectedYear) params.set("year", selectedYear);

    if (trimmed) {
      params.set("query", trimmed);
    } else if (!selectedGenre && !selectedYear) {
      params.set("popular", "1");
    }

    return `${PROXY_BASE}?${params.toString()}`;
  };

  const getMovies = async (title: string) => {
    if (!PROXY_BASE) {
      setError("Proxy URL missing. Set VITE_PROXY_BASE to your worker URL.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const url = buildMoviesUrl(title);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch movies");
      const data = await response.json();
      setMovies(data.results ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (title: string) => {
    if (!PROXY_BASE) {
      setError("Proxy URL missing. Set VITE_PROXY_BASE to your worker URL.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(buildMoviesUrl(title));
      if (!response.ok) throw new Error("Failed to search movies");
      const data = await response.json();
      setMovies(data.results ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    if (!PROXY_BASE) return;
    const cached = localStorage.getItem("tmdb_genres");
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Record<number, string>;
        setGenreMap(parsed);
        return;
      } catch {
        // ignore cache parse errors
      }
    }
    try {
      const response = await fetch(API_GENRES);
      if (!response.ok) throw new Error("Failed to fetch genres");
      const data = await response.json();
      const map = Object.fromEntries(
        (data.genres ?? []).map((genre: { id: number; name: string }) => [
          genre.id,
          genre.name,
        ])
      );
      setGenreMap(map);
      localStorage.setItem("tmdb_genres", JSON.stringify(map));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    fetchGenres();
    getMovies("");
  }, []);

  return (
    <>
      <h1 className="font-bold text-3xl text-center my-4">MovieArc</h1>
      <div className="flex flex-col gap-3 items-center">
        <div className="search flex bg-white py-2 px-4 rounded-full max-w-[420px] shadow-md w-full">
          <input
            className=" flex-1 focus:outline-0"
            type="text"
            placeholder="Search movie"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <img
            className="cursor-pointer"
            src={SearchIcon}
            alt="search-icon"
            onClick={() => searchMovies(searchTerm)}
          />
        </div>
        <div className="flex flex-wrap gap-3 justify-center w-full">
          <select
            className="bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm min-w-[180px]"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All genres</option>
            {Object.entries(genreMap).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <input
            className="bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm w-[140px]"
            type="number"
            placeholder="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            min="1888"
            max={new Date().getFullYear()}
          />
          <button
            className="bg-blue-600 text-white rounded-full px-4 py-2 shadow-sm hover:bg-blue-700"
            onClick={() => getMovies(searchTerm)}
          >
            Apply filters
          </button>
        </div>
      </div>
      {error && <p className="text-center text-red-600 mt-4">{error}</p>}
      {loading && <p className="text-center mt-6">Loading...</p>}
      {movies?.length > 0 ? (
        <div className="container grid justify-center lg:grid-cols-4 md:grid-cols-3 mt-12 mx-auto gap-8">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} genreMap={genreMap} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center mt-12">
            <h2>No movies found</h2>
          </div>
        )
      )}
    </>
  );
};

const App = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/movie/:id" element={<MovieDetails />} />
  </Routes>
);

export default App;
