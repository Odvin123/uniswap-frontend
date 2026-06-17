import { useState, useEffect } from "react";
import MaterialCard from "../components/MaterialCard";
import Filtros from "../components/Filtros";
import LoginModal from "../components/LoginModal";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabase";

export default function Catalogo() {
  const { user } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroCarrera, setFiltroCarrera] = useState("todas");
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [solicitando, setSolicitando] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  
  // Configurar URL de la API
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  console.log("📡 API URL:", API_URL);
  
  // Cargar materiales desde Supabase
  const cargarMateriales = async () => {
    setLoading(true);
    try {
      console.log("📡 Cargando materiales desde:", `${API_URL}/api/materiales`);
      const response = await fetch(`${API_URL}/api/materiales`);
      if (response.ok) {
        const data = await response.json();
        console.log("Materiales cargados:", data);
        setMateriales(data);
      } else {
        console.error("Error al cargar materiales, status:", response.status);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    cargarMateriales();
  }, []);
  
  const handleSolicitar = async (material) => {
    console.log("🔍 Solicitar material:", material);
    console.log("👤 Usuario actual:", user);
    
    if (!user) {
      setSelectedMaterial(material);
      setShowLogin(true);
      return;
    }
    
    if (material.usuario_id === user.id) {
      alert("❌ No puedes solicitar tu propio material");
      return;
    }
    
    setSolicitando(true);
    
    try {
      // Obtener sesión de Supabase
      const { data: { session } } = await supabase.auth.getSession();
      console.log("🔑 Token:", session?.access_token ? "✅ Obtenido" : "❌ No hay token");
      
      if (!session) {
        alert("❌ No tienes sesión activa. Inicia sesión nuevamente.");
        setSolicitando(false);
        return;
      }
      
      // Construir el cuerpo de la solicitud
      const bodyData = {
        material_id: material.id,
        material_titulo: material.titulo,
        propietario_id: material.usuario_id,
        propietario_nombre: material.usuario_nombre || "Usuario",
        propietario_email: material.usuario_email || `${material.usuario_nombre || 'usuario'}@std.uni.edu.ni`
      };
      
      console.log("📤 Enviando solicitud a:", `${API_URL}/api/solicitudes`);
      console.log("📦 Datos:", bodyData);
      
      const response = await fetch(`${API_URL}/api/solicitudes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(bodyData)
      });
      
      console.log("📡 Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Solicitud creada:", data);
        alert(`✅ Solicitud enviada a ${material.usuario_nombre || "Usuario"}`);
        cargarMateriales();
      } else {
        const error = await response.json();
        console.error("❌ Error del servidor:", error);
        alert(`❌ Error: ${error.error || "No se pudo enviar la solicitud"}`);
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      alert(`❌ Error de conexión: ${error.message}`);
    }
    
    setSolicitando(false);
  };
  
  const handleEliminar = async (materialId) => {
    if (!user) return;
    
    if (!confirm("¿Estás seguro de que quieres eliminar este material?")) return;
    
    setEliminando(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_URL}/api/materiales/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (response.ok) {
        alert("✅ Material eliminado");
        cargarMateriales();
      } else {
        alert("❌ Error al eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión");
    }
    
    setEliminando(false);
  };
  
  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (selectedMaterial) {
      handleSolicitar(selectedMaterial);
      setSelectedMaterial(null);
    }
  };
  
  // Filtrar materiales
  const materialesFiltrados = materiales.filter(material => {
    const matchBusqueda = material.titulo?.toLowerCase().includes(busqueda.toLowerCase()) ||
                         material.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
                         material.usuario_nombre?.toLowerCase().includes(busqueda.toLowerCase());
    const matchTipo = filtroTipo === "todos" || material.tipo === filtroTipo;
    const matchCarrera = filtroCarrera === "todas" || material.carrera === filtroCarrera;
    return matchBusqueda && matchTipo && matchCarrera;
  });
  
  return (
    <>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            📚 Catálogo de materiales
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Encuentra libros, apuntes y materiales para tus estudios
            {!user && (
              <span className="ml-2 text-amber-600 text-sm">
                🔒 Inicia sesión para solicitar materiales
              </span>
            )}
            {user && (
              <span className="ml-2 text-emerald-600 text-sm">
                ✅ Hola, {user.user_metadata?.name || user.email?.split('@')[0]}
              </span>
            )}
          </p>
        </div>
        
        <Filtros
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtroTipo={filtroTipo}
          setFiltroTipo={setFiltroTipo}
          filtroCarrera={filtroCarrera}
          setFiltroCarrera={setFiltroCarrera}
        />
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : materiales.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No hay materiales publicados aún</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">
              ¡Sé el primero en 
              <a href="/publicar" className="text-emerald-600 hover:underline ml-1">
                publicar un material
              </a>
              !
            </p>
          </div>
        ) : materialesFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">No se encontraron materiales</p>
            <p className="text-gray-400 dark:text-gray-500 mt-2">Intenta con otros filtros</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Mostrando {materialesFiltrados.length} de {materiales.length} materiales
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {materialesFiltrados.map(material => (
                <MaterialCard 
                  key={material.id} 
                  material={material}
                  currentUser={user}
                  onSolicitar={() => handleSolicitar(material)}
                  onEliminar={() => handleEliminar(material.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => {
          setShowLogin(false);
          setSelectedMaterial(null);
        }}
        onSuccess={handleLoginSuccess}
      />
      
      {(solicitando || eliminando) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-700 dark:text-gray-300">{solicitando ? "Enviando solicitud..." : "Eliminando publicación..."}</p>
          </div>
        </div>
      )}
    </>
  );
}