import { useState } from "react";
import { Star } from "lucide-react";

export default function SistemaCalificaciones({ solicitudId, onCalificar, calificacionExistente }) {
  const [rating, setRating] = useState(calificacionExistente || 0);
  const [hover, setHover] = useState(0);
  
  const handleCalificar = (valor) => {
    setRating(valor);
    if (onCalificar) {
      onCalificar(solicitudId, valor);
    }
  };
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleCalificar(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 transition-all ${
              (hover || rating) >= star
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className="text-sm text-gray-500 ml-2">
          {rating} estrella{rating !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}