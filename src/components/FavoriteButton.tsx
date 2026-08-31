import { useState } from "react";
import { addFavorite, removeFavorite } from "../services/favorite.service";

interface FavoriteButtonProps {
  productId: string;
  isFavorite: boolean;
  onToggle?: (isFav: boolean) => void;
  className?: string;
}

const FavoriteButton = ({ productId, isFavorite, onToggle, className = "" }: FavoriteButtonProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Evitar navegación o propagación a la tarjeta

    if (loading) return;

    try {
      setLoading(true);
      if (isFavorite) {
        await removeFavorite(productId);
        if (onToggle) onToggle(false);
      } else {
        await addFavorite(productId);
        if (onToggle) onToggle(true);
      }
    } catch (err) {
      console.error("Error toggling favorite status:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center p-2 rounded-full bg-white border border-slate-100 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110 active:scale-75 disabled:opacity-60 cursor-pointer ${className}`}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 transition-colors duration-200 ${
          isFavorite
            ? "fill-red-500 stroke-red-500"
            : "fill-transparent stroke-slate-400 hover:stroke-red-500"
        }`}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;
