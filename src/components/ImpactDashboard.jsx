import { useState, useEffect } from "react";
import { Leaf, Trees, Droplets, Zap, Award, TrendingUp, RefreshCw, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ImpactDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    materialesRescatados: 0,
    arbolesSalvados: 0,
    aguaAhorrada: 0,
    co2Evitado: 0,
    intercambiosCompletados: 0
  });
  const [puntos, setPuntos] = useState(0);
  const [nivel, setNivel] = useState("Principiante");
  
  useEffect(() => {
    calcularEstadisticas();
  }, [user]);
  
  const calcularEstadisticas = () => {
    // Obtener todos los materiales publicados
    const materiales = JSON.parse(localStorage.getItem("uniswap_materiales") || "[]");
    const solicitudes = JSON.parse(localStorage.getItem("uniswap_solicitudes") || "[]");
    
    // Materiales rescatados (intercambios completados)
    const intercambiosCompletados = solicitudes.filter(s => s.estado === "aceptada").length;
    
    // Cada material rescatado salva aproximadamente 1 árbol
    const arbolesSalvados = intercambiosCompletados;
    
    // Cada libro ahorra ~7.5 kg de CO2 y ~2000 litros de agua
    const co2Evitado = intercambiosCompletados * 7.5;
    const aguaAhorrada = intercambiosCompletados * 2000;
    
    // Puntos del usuario actual
    let puntosUsuario = 0;
    if (user) {
      // Por materiales publicados
      const misMateriales = materiales.filter(m => m.usuarioId === user.id).length;
      puntosUsuario += misMateriales * 10;
      
      // Por intercambios completados como propietario
      const misAceptadasComoPropietario = solicitudes.filter(s => s.propietarioId === user.id && s.estado === "aceptada").length;
      puntosUsuario += misAceptadasComoPropietario * 50;
      
      // Por intercambios completados como solicitante
      const misAceptadasComoSolicitante = solicitudes.filter(s => s.solicitanteId === user.id && s.estado === "aceptada").length;
      puntosUsuario += misAceptadasComoSolicitante * 30;
    }
    
    // Determinar nivel
    let nivelUsuario = "🌱 Principiante";
    if (puntosUsuario >= 500) nivelUsuario = "🏆 Eco Maestro";
    else if (puntosUsuario >= 300) nivelUsuario = "🌟 Eco Experto";
    else if (puntosUsuario >= 100) nivelUsuario = "💚 Eco Guardian";
    else if (puntosUsuario >= 50) nivelUsuario = "🍃 Eco Aprendiz";
    
    setStats({
      materialesRescatados: materiales.length,
      arbolesSalvados: arbolesSalvados,
      aguaAhorrada: aguaAhorrada,
      co2Evitado: co2Evitado,
      intercambiosCompletados: intercambiosCompletados
    });
    setPuntos(puntosUsuario);
    setNivel(nivelUsuario);
  };
  
  return (
    <div className="bg-gradient-to-r from-emerald-700 to-teal-700 rounded-2xl p-6 text-white shadow-xl mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Leaf className="w-6 h-6" />
          Impacto Ambiental
        </h2>
        <button onClick={calcularEstadisticas} className="p-2 hover:bg-white/20 rounded-lg transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold">{stats.arbolesSalvados}</div>
          <div className="text-sm opacity-90">🌳 Árboles salvados</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{stats.aguaAhorrada.toLocaleString()}</div>
          <div className="text-sm opacity-90">💧 Litros de agua</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{stats.co2Evitado} kg</div>
          <div className="text-sm opacity-90">🌍 CO₂ evitado</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold">{stats.intercambiosCompletados}</div>
          <div className="text-sm opacity-90">🔄 Intercambios</div>
        </div>
      </div>
      
      {user && (
        <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-300" />
                <span className="font-semibold">Tu puntuación:</span>
                <span className="text-2xl font-bold">{puntos}</span>
                <span>puntos</span>
              </div>
              <div className="text-sm mt-1">{nivel}</div>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full transition-all"
                  style={{ width: `${Math.min((puntos / 500) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="text-sm">
              {puntos >= 500 ? "🏆 ¡Máximo nivel alcanzado!" : `🏁 Faltan ${500 - puntos} puntos para Eco Maestro`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}