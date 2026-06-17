import { Search, Filter, X } from "lucide-react";

export default function Filtros({ busqueda, setBusqueda, filtroTipo, setFiltroTipo, filtroCarrera, setFiltroCarrera }) {
  const tipos = ['todos', 'libro', 'apunte', 'oficina'];
  const carreras = ['todas', 'Sistemas', 'Electrónica', 'Civil', 'Industrial', 'Mecánica', 'Química'];
  
  const limpiarFiltros = () => {
    setBusqueda('');
    setFiltroTipo('todos');
    setFiltroCarrera('todas');
  };
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por título, autor o materia..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          {tipos.map(tipo => (
            <option key={tipo} value={tipo}>
              {tipo === 'todos' ? 'Todos los tipos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </option>
          ))}
        </select>
        
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={filtroCarrera}
          onChange={(e) => setFiltroCarrera(e.target.value)}
        >
          {carreras.map(carrera => (
            <option key={carrera} value={carrera}>
              {carrera === 'todas' ? 'Todas las carreras' : carrera}
            </option>
          ))}
        </select>
        
        {(busqueda || filtroTipo !== 'todos' || filtroCarrera !== 'todas') && (
          <button
            onClick={limpiarFiltros}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
          >
            <X className="w-4 h-4" /> Limpiar
          </button>
        )}
      </div>
    </div>
  );
}