import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Leaf, RefreshCw, Users, TrendingUp, Heart, ArrowRight } from "lucide-react";
import Arbol3D from '../components/Arbol3D';

export default function Home() {
  const [estadisticas, setEstadisticas] = useState({
    materialesRescatados: 0,
    estudiantesActivos: 0,
    co2Evitado: 0,
    intercambiosRealizados: 0
  });
  const [loading, setLoading] = useState(true);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      console.log("📡 Cargando desde:", `${API_URL}/api/estadisticas`);
      
      const response = await fetch(`${API_URL}/api/estadisticas`);
      console.log("📡 Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("📊 Datos recibidos:", data);
        setEstadisticas({
          materialesRescatados: data.materialesRescatados || 0,
          estudiantesActivos: data.estudiantesActivos || 0,
          co2Evitado: data.co2Evitado || 0,
          intercambiosRealizados: data.intercambiosRealizados || 0
        });
      } else {
        console.error("Error HTTP:", response.status);
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarEstadisticas();
    const interval = setInterval(cargarEstadisticas, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Hero Section */}
      
      <section className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl overflow-hidden shadow-2xl mb-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-20 md:py-28 text-center text-white">
          <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
            Intercambia, ahorra y<br />
            <span className="text-yellow-300">cuida el planeta</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Plataforma colaborativa para estudiantes UNI. Dale una segunda vida a tus materiales académicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogo" className="bg-white text-emerald-700 px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
              Explorar materiales <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/publicar" className="bg-emerald-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-emerald-400 transition-all">
              Publicar material
            </Link>
          </div>
        </div>
      </section>
    
      
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {loading ? (
              <div className="inline-block w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              estadisticas.materialesRescatados
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Materiales rescatados</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {loading ? (
              <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              estadisticas.estudiantesActivos
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Estudiantes activos</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-7 h-7 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {loading ? (
              <div className="inline-block w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              `${estadisticas.co2Evitado} kg`
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">CO₂ evitado</div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {loading ? (
              <div className="inline-block w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              estadisticas.intercambiosRealizados
            )}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Intercambios realizados</div>
        </div>
      </div>
      
      {/* Beneficios Section */}
      <div className="mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          ¿Por qué usar <span className="text-emerald-600">UNISWAP</span>?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-2">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Leaf className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Impacto ambiental</h3>
            <p className="text-gray-600 dark:text-gray-400">Reducimos residuos de papel y evitamos la tala de árboles al reutilizar materiales.</p>
          </div>
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-2">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <RefreshCw className="w-10 h-10 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Economía circular</h3>
            <p className="text-gray-600 dark:text-gray-400">Libros, apuntes y materiales siguen siendo útiles para otros estudiantes.</p>
          </div>
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all hover:-translate-y-2">
            <div className="w-20 h-20 bg-cyan-100 dark:bg-cyan-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">Comunidad UNI</h3>
            <p className="text-gray-600 dark:text-gray-400">Exclusivo para estudiantes con correo @std.uni.edu.ni, confianza y seguridad.</p>
          </div>
        </div>
      </div>
      
      {/* Cómo funciona */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-3xl p-8 md:p-12 mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          ¿Cómo funciona <span className="text-emerald-600">UNISWAP</span>?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
              1
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Publica tu material</h3>
            <p className="text-gray-600 dark:text-gray-400">Sube fotos y describe el material que ya no usas</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
              2
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Encuentra lo que necesitas</h3>
            <p className="text-gray-600 dark:text-gray-400">Busca en el catálogo por materia, tipo o carrera</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 shadow-lg">
              3
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Intercambia en el campus</h3>
            <p className="text-gray-600 dark:text-gray-400">Coordina la entrega dentro de la UNI</p>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
        <Heart className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
        <h2 className="text-3xl md:text-4xl font-bold mb-4">¡Únete a la revolución circular!</h2>
        <p className="text-lg mb-8 opacity-95 max-w-2xl mx-auto">
          Sé parte del cambio y contribuye a una UNI más sostenible. ¡Cada material cuenta!
        </p>
        <Link 
          to="/publicar" 
          className="inline-flex items-center gap-2 bg-white text-emerald-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
        >
          Comenzar ahora <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}