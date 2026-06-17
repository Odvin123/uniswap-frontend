import { Trash2, User, Calendar, ImageIcon } from "lucide-react";

export default function MaterialCard({ material, currentUser, onSolicitar, onEliminar }) {
  // Verificar si el usuario actual es el dueño del material
  const esMiMaterial = currentUser && material.usuario_id === currentUser.id;
  
  const getTipoIcon = () => {
    switch(material.tipo) {
      case 'libro': return "📖";
      case 'apunte': return "📝";
      case 'oficina': return "✏️";
      default: return "📚";
    }
  };
  
  const getEstadoColor = () => {
    switch(material.estado) {
      case 'excelente': return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";
      case 'bueno': return "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300";
      case 'regular': return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300";
      default: return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };
  
  const formatearFecha = (fecha) => {
    if (!fecha) return "Reciente";
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
      {/* Imagen del material */}
      <div className="relative h-40 bg-gradient-to-r from-emerald-500 to-teal-500">
        {material.imagen_url ? (
          <img 
            src={material.imagen_url} 
            alt={material.titulo} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-5xl">
            {getTipoIcon()}
          </div>
        )}
        
        {/* Badge de tipo */}
        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1">
          <span>{getTipoIcon()}</span>
          <span>{material.tipo === 'libro' ? 'Libro' : material.tipo === 'apunte' ? 'Apunte' : 'Oficina'}</span>
        </div>
        
        {/* Badge de estado */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${getEstadoColor()}`}>
          {material.estado?.charAt(0).toUpperCase() + material.estado?.slice(1)}
        </div>
        
        {/* Badge "Mi material" */}
        {esMiMaterial && (
          <div className="absolute top-2 left-2 bg-emerald-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
            <span>✓</span>
            <span>MI MATERIAL</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Título */}
        <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-white line-clamp-1">
          {material.titulo}
        </h3>
        
        {/* Carrera */}
        <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-2">
          🎓 {material.carrera}
        </p>
        
        {/* Usuario y fecha */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
             {material.usuario_nombre || material.usuario_name || "Usuario"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatearFecha(material.created_at)}</span>
          </div>
        </div>
        
        {/* Descripción */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {material.descripcion || "Sin descripción"}
        </p>
        
        {/* Botones */}
        {esMiMaterial ? (
          <button
            onClick={onEliminar}
            className="w-full bg-red-500 text-white py-2 rounded-lg font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />
            Eliminar publicación
          </button>
        ) : (
          <button
            onClick={onSolicitar}
            className={`w-full py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
              currentUser 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-lg' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            disabled={!currentUser}
          >
            {currentUser ? '📩 Solicitar intercambio' : '🔒 Inicia sesión para solicitar'}
          </button>
        )}
      </div>
    </div>
  );
}