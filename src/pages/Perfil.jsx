import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import { supabase } from "../config/supabase";
import { User, Mail, GraduationCap, Edit2, Camera, Award, Heart, Save, X, Calendar, TrendingUp, Star, Phone } from "lucide-react";

export default function Perfil() {
  const { user, logout, updateUser } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    carrera: "",
    biografia: "",
    telefono: "",
  });
  const [fotoPreview, setFotoPreview] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    materialesPublicados: 0,
    intercambiosRealizados: 0,
    reputacion: 0,
    puntos: 0,
    intercambiosComoDueno: 0,
    intercambiosComoSolicitante: 0
  });
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fechaRegistro, setFechaRegistro] = useState("");
  
  useEffect(() => {
    if (user) {
      cargarDatos();
    }
  }, [user]);
  
  const cargarDatos = async () => {
    setLoading(true);
    
    try {
      // Cargar perfil desde la API
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/perfil/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const perfil = await response.json();
        setFormData({
          nombre: perfil.nombre || user.user_metadata?.name || user.email?.split('@')[0] || "Usuario",
          carrera: perfil.carrera || "",
          biografia: perfil.biografia || "",
          telefono: perfil.telefono || "",
        });
        setFotoPreview(perfil.avatar_url || user.user_metadata?.avatar_url || null);
        setFechaRegistro(perfil.created_at || user.created_at || new Date().toISOString());
      } else {
        // Valores por defecto
        setFormData({
          nombre: user.user_metadata?.name || user.email?.split('@')[0] || "Usuario",
          carrera: user.user_metadata?.carrera || "",
          biografia: "",
          telefono: "",
        });
        setFotoPreview(user.user_metadata?.avatar_url || null);
        setFechaRegistro(user.created_at || new Date().toISOString());
      }
      
      // Cargar estadísticas
      const materialesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/materiales`);
      const solicitudesResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/solicitudes/recibidas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const solicitudesEnviadasResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/solicitudes/enviadas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const materiales = await materialesResponse.json();
      const solicitudesRecibidas = await solicitudesResponse.json();
      const solicitudesEnviadas = await solicitudesEnviadasResponse.json();
      
      const misMateriales = materiales.filter(m => m.usuario_id === user.id).length;
      const intercambiosCompletados = [...solicitudesRecibidas, ...solicitudesEnviadas].filter(s => s.estado === "aceptada").length;
      const comoDueno = solicitudesRecibidas.filter(s => s.estado === "aceptada").length;
      const comoSolicitante = solicitudesEnviadas.filter(s => s.estado === "aceptada").length;
      
      // Reputación simulada (puedes implementar calificaciones después)
      const reputacion = (comoDueno + comoSolicitante) > 0 ? 4.5 : 0;
      const puntos = misMateriales * 10 + intercambiosCompletados * 40;
      
      setEstadisticas({
        materialesPublicados: misMateriales,
        intercambiosRealizados: intercambiosCompletados,
        reputacion: reputacion,
        puntos: puntos,
        intercambiosComoDueno: comoDueno,
        intercambiosComoSolicitante: comoSolicitante
      });
      
      // Calcular logros
      const nuevosLogros = [];
      if (misMateriales >= 1) nuevosLogros.push({ icon: "📚", texto: "Primer material publicado", color: "emerald" });
      if (misMateriales >= 5) nuevosLogros.push({ icon: "📚", texto: "Coleccionista (5 materiales)", color: "emerald" });
      if (intercambiosCompletados >= 1) nuevosLogros.push({ icon: "🔄", texto: "Primer intercambio completado", color: "emerald" });
      if (intercambiosCompletados >= 5) nuevosLogros.push({ icon: "🤝", texto: "Intercambiador experto (5 intercambios)", color: "emerald" });
      if (reputacion >= 4) nuevosLogros.push({ icon: "⭐", texto: "Usuario confiable (4+ estrellas)", color: "yellow" });
      if (puntos >= 50) nuevosLogros.push({ icon: "🌱", texto: "Eco Aprendiz (50+ puntos)", color: "blue" });
      if (puntos >= 100) nuevosLogros.push({ icon: "💚", texto: "Eco Guardian (100+ puntos)", color: "blue" });
      if (puntos >= 300) nuevosLogros.push({ icon: "🌟", texto: "Eco Experto (300+ puntos)", color: "purple" });
      if (puntos >= 500) nuevosLogros.push({ icon: "🏆", texto: "Eco Maestro (500+ puntos)", color: "amber" });
      
      setLogros(nuevosLogros);
    } catch (error) {
      console.error("Error cargando perfil:", error);
    }
    
    setLoading(false);
  };
  
  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert("❌ Selecciona una imagen válida");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const imagenBase64 = event.target.result;
      setFotoPreview(imagenBase64);
      
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      await fetch(`${import.meta.env.VITE_API_URL}/api/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          avatar_url: imagenBase64
        })
      });
      
      alert("✅ Foto actualizada correctamente");
    };
    reader.readAsDataURL(file);
  };
  
  const guardarPerfil = async () => {
    const token = (await supabase.auth.getSession()).data.session?.access_token;
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/perfil`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nombre: formData.nombre,
        carrera: formData.carrera,
        telefono: formData.telefono,
        biografia: formData.biografia,
        avatar_url: fotoPreview
      })
    });
    
    if (response.ok) {
      alert("✅ Perfil guardado");
      setEditando(false);
      cargarDatos();
    } else {
      alert("❌ Error al guardar");
    }
  };
  
  const renderStars = () => {
    const rating = estadisticas.reputacion;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({estadisticas.reputacion})</span>
      </div>
    );
  };
  
  if (!user) {
    return (
      <>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">🔒 Perfil privado</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Inicia sesión para ver y editar tu perfil</p>
            <button
              onClick={() => setShowLogin(true)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={() => window.location.reload()} />
      </>
    );
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">👤 Mi Perfil</h1>
      
      {/* Tarjeta principal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-emerald-600 to-teal-600"></div>
        
        <div className="px-6 pb-6">
          <div className="flex flex-col md:flex-row gap-6 -mt-12 mb-6">
            {/* Foto de perfil */}
            <div className="relative group">
              <div className="w-28 h-28 bg-white dark:bg-gray-700 rounded-full p-1 shadow-lg">
                {fotoPreview ? (
                  <img src={fotoPreview} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full cursor-pointer hover:bg-emerald-700 shadow-lg">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleFotoChange} className="hidden" />
              </label>
            </div>
            
            {/* Información básica */}
            <div className="flex-1">
              {editando ? (
                <input
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  className="text-2xl font-bold border-b-2 border-emerald-500 outline-none bg-transparent dark:text-white"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{formData.nombre}</h2>
              )}
              
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              
              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" /> Miembro desde: {new Date(fechaRegistro).toLocaleDateString()}
              </p>
            </div>
            
            {/* Botones */}
            <div>
              {editando ? (
                <div className="flex gap-2">
                  <button onClick={guardarPerfil} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700">
                    <Save className="w-4 h-4" /> Guardar
                  </button>
                  <button onClick={() => setEditando(false)} className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-400">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditando(true)} className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  <Edit2 className="w-4 h-4" /> Editar perfil
                </button>
              )}
            </div>
          </div>
          
          {/* Estadísticas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{estadisticas.materialesPublicados}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Materiales publicados</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{estadisticas.intercambiosRealizados}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Intercambios completados</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
              <div className="flex justify-center">{renderStars()}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Reputación</div>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{estadisticas.puntos}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Puntos ecológicos</div>
            </div>
          </div>
          
          {/* Detalle de intercambios */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{estadisticas.intercambiosComoDueno}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">📤 Materiales prestados</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{estadisticas.intercambiosComoSolicitante}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">📥 Materiales recibidos</div>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {editando ? (
                <select
                  value={formData.carrera}
                  onChange={(e) => setFormData({...formData, carrera: e.target.value})}
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Selecciona tu carrera</option>
                  <option value="Sistemas">Ingeniería de Sistemas</option>
                  <option value="Electrónica">Ingeniería Electrónica</option>
                  <option value="Civil">Ingeniería Civil</option>
                  <option value="Industrial">Ingeniería Industrial</option>
                  <option value="Mecánica">Ingeniería Mecánica</option>
                  <option value="Química">Ingeniería Química</option>
                  <option value="Arquitectura">Arquitectura</option>
                  <option value="Computacion">Ingeniería de Computación</option>
                  <option value="Telecomunicaciones">Ingeniería de Telecomunicaciones</option>
        
                  
                </select>
              ) : (
                <span className={formData.carrera ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"}>
                  {formData.carrera || "Carrera no especificada"}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {editando ? (
                <input
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  placeholder="Teléfono de contacto"
                  className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <span className={formData.telefono ? "text-gray-800 dark:text-gray-200" : "text-gray-400 dark:text-gray-500"}>
                  {formData.telefono || "Teléfono no especificado"}
                </span>
              )}
            </div>
            
            {editando && (
              <div>
                <textarea
                  value={formData.biografia}
                  onChange={(e) => setFormData({...formData, biografia: e.target.value})}
                  placeholder="Escribe una breve biografía sobre ti..."
                  rows="3"
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                />
              </div>
            )}
            
            {!editando && formData.biografia && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <p className="text-sm text-gray-700 dark:text-gray-300">{formData.biografia}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Logros */}
      {logros.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mt-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-white">
            <Award className="w-5 h-5 text-yellow-500" />
            Logros obtenidos
          </h3>
          <div className="flex flex-wrap gap-2">
            {logros.map((logro, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                  logro.color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300' :
                  logro.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300' :
                  logro.color === 'amber' ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
                  logro.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' :
                  logro.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300' :
                  'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {logro.icon} {logro.texto}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Impacto ambiental */}
      {estadisticas.intercambiosRealizados > 0 && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-950/50 rounded-xl p-4 mt-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🌍</div>
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">¡Impacto ambiental positivo!</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Con {estadisticas.intercambiosRealizados} intercambios has ayudado a salvar aproximadamente{' '}
                <strong>{estadisticas.intercambiosRealizados} árboles</strong> y evitar{' '}
                <strong>{(estadisticas.intercambiosRealizados * 7.5).toFixed(1)} kg de CO₂</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Botón cerrar sesión */}
     <button
  onClick={async () => {
    await logout();
    window.location.href = '/';
  }}
  className="w-full mt-8 bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
>
  Cerrar sesión
</button>
    </div>
  );
}