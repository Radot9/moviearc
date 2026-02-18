import React from "react";
import { Link } from "react-router-dom";

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface MovieCardProps {
  movie: Movie;
  genreMap: Record<number, string>;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, genreMap }) => {
  const API_IMG = "https://image.tmdb.org/t/p/w500";
  const genreNames = (movie.genre_ids ?? [])
    .map((id) => genreMap[id])
    .filter(Boolean);

  return (
    <Link to={`/movie/${movie.id}`} className="movie block hover:shadow-lg transition-shadow duration-200">
      <div>
        <img
          src={
            movie.poster_path !== null //
              ? `${API_IMG}${movie.poster_path}`
              : "https://via.placeholder.com/400x600"
          }
          alt={movie.title}
        />
      </div>
      <div>
        <p className="text-xs my-2">{movie.release_date.slice(0, 4)}</p>
        <h3 className="font-bold text-lg">{movie.title}</h3>
        <p className="my-2">Rating : {movie.vote_average.toFixed(1)}</p>
        <p className="text-sm text-gray-700">
          Genres: {genreNames.length ? genreNames.join(", ") : "N/A"}
        </p>
      </div>
    </Link>
  );
};

export default MovieCard;
