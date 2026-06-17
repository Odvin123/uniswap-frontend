import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "../components/LoginModal";
import SistemaCalificaciones from "../components/SistemaCalificaciones";
import ChatInterno from "../components/ChatInterno";
import { supabase } from "../config/supabase";
import { CheckCircle, XCircle, Clock, Trash2, RefreshCw, MessageCircle } from "lucide-react";

export default function MisIntercambios() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState([]);
  const [activeTab, setActiveTab] = useState("recibidas");
  const [loading, setLoading] = useState(false);
  const [accionando, setAccionando] = useState(false);
  const [chatUsuario, setChatUsuario] = useState(null);
  const [chatMaterialId, setChatMaterialId] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  
  // Cargar solicitudes desde el backend
  const cargarSolicitudes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("❌ No hay sesión");
        setLoading(false);
        return;
      }
      
      console.log("📡 Cargando solicitudes...");
      
      // Solicitudes recibidas (soy el propietario)
      const recibidasRes = await fetch(`${API_URL}/api/solicitudes/recibidas`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      // Solicitudes enviadas (soy el solicitante)
      const enviadasRes = await fetch(`${API_URL}/api/solicitudes/enviadas`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (recibidasRes.ok) {
        const recibidas = await recibidasRes.json();
        console.log("📥 Solicitudes recibidas:", recibidas);
        setSolicitudesRecibidas(recibidas);
      } else {
        console.error("Error al cargar recibidas:", await recibidasRes.text());
      }
      
      if (enviadasRes.ok) {
        const enviadas = await enviadasRes.json();
        console.log("📤 Solicitudes enviadas:", enviadas);
        setSolicitudesEnviadas(enviadas);
      } else {
        console.error("Error al cargar enviadas:", await enviadasRes.text());
      }
      
    } catch (error) {
      console.error("❌ Error cargando solicitudes:", error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (user) {
      cargarSolicitudes();
    }
  }, [user]);
  
  // Aceptar solicitud (como propietario)
  const aceptarSolicitud = async (solicitudId) => {
    setAccionando(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_URL}/api/solicitudes/${solicitudId}/aceptar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (response.ok) {
        alert("✅ ¡Solicitud aceptada! El material ha sido marcado como intercambiado.");
        cargarSolicitudes();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || "No se pudo aceptar"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión");
    }
    
    setAccionando(false);
  };
  
  // Rechazar solicitud (como propietario)
  const rechazarSolicitud = async (solicitudId) => {
    setAccionando(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_URL}/api/solicitudes/${solicitudId}/rechazar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (response.ok) {
        alert("❌ Solicitud rechazada");
        cargarSolicitudes();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || "No se pudo rechazar"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión");
    }
    
    setAccionando(false);
  };
  
  // Cancelar solicitud (como solicitante)
  const cancelarSolicitud = async (solicitudId) => {
    if (!confirm("¿Estás seguro de que quieres cancelar esta solicitud?")) return;
    
    setAccionando(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${API_URL}/api/solicitudes/${solicitudId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      });
      
      if (response.ok) {
        alert("✅ Solicitud cancelada");
        cargarSolicitudes();
      } else {
        const error = await response.json();
        alert(`❌ Error: ${error.error || "No se pudo cancelar"}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Error de conexión");
    }
    
    setAccionando(false);
  };
  
  const getEstadoBadge = (estado) => {
    switch(estado) {
      case "pendiente":
        return { color: "bg-yellow-100 text-yellow-700", icon: Clock, texto: "Pendiente" };
      case "aceptada":
        return { color: "bg-green-100 text-green-700", icon: CheckCircle, texto: "Aceptada" };
      case "rechazada":
        return { color: "bg-red-100 text-red-700", icon: XCircle, texto: "Rechazada" };
      default:
        return { color: "bg-gray-100 text-gray-700", icon: Clock, texto: estado };
    }
  };
  
  const formatearFecha = (fecha) => {
    if (!fecha) return "Fecha no disponible";
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Si no está logueado
  if (!user) {
    return (
      <>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Acceso restringido</h2>
            <p className="text-gray-600 mb-6">Necesitas iniciar sesión para ver tus intercambios.</p>
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
  
  const solicitudesActuales = activeTab === "recibidas" ? solicitudesRecibidas : solicitudesEnviadas;
  
  return (
    <>
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                🔄 Mis Intercambios
              </h1>
              <p className="text-gray-600">Gestiona tus solicitudes de intercambio</p>
            </div>
            
            <button
              onClick={cargarSolicitudes}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("recibidas")}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === "recibidas"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📥 Recibidas
            {solicitudesRecibidas.length > 0 && (
              <span className="ml-2 bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-xs">
                {solicitudesRecibidas.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("enviadas")}
            className={`px-6 py-3 font-semibold transition-all relative ${
              activeTab === "enviadas"
                ? "text-emerald-600 border-b-2 border-emerald-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📤 Enviadas
            {solicitudesEnviadas.length > 0 && (
              <span className="ml-2 bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full text-xs">
                {solicitudesEnviadas.length}
              </span>
            )}
          </button>
        </div>
        
        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : solicitudesActuales.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 text-lg">
              No tienes {activeTab === "recibidas" ? "solicitudes recibidas" : "solicitudes enviadas"}
            </p>
            <p className="text-gray-400 mt-2">
              {activeTab === "recibidas" 
                ? "Cuando alguien solicite tus materiales, aparecerán aquí."
                : "Ve al catálogo y solicita materiales para comenzar."}
            </p>
            {activeTab === "enviadas" && (
              <a href="/catalogo" className="inline-block mt-4 text-emerald-600 hover:underline">
                → Explorar catálogo
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {solicitudesActuales.map(solicitud => {
              const estadoInfo = getEstadoBadge(solicitud.estado);
              const EstadoIcon = estadoInfo.icon;
              
              return (
                <div key={solicitud.id} className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition border border-gray-100">
                  <div className="flex justify-between items-start flex-wrap gap-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{solicitud.material_titulo}</h3>
                      
                      {activeTab === "recibidas" ? (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            📩 <strong>Solicitante:</strong> {solicitud.solicitante_nombre || "Usuario"}
                          </p>
                          <p className="text-xs text-gray-500">📧 {solicitud.solicitante_email}</p>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            👤 <strong>Propietario:</strong> {solicitud.propietario_nombre || "Usuario"}
                          </p>
                          <p className="text-xs text-gray-500">📧 {solicitud.propietario_email}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${estadoInfo.color}`}>
                      <EstadoIcon className="w-3 h-3" />
                      {estadoInfo.texto}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 mt-3">
                    <div className="flex flex-wrap justify-between text-xs text-gray-500 gap-2 mb-3">
                      <span>📅 Solicitado: {formatearFecha(solicitud.created_at)}</span>
                      {solicitud.respuesta_fecha && (
                        <span>✅ Respondido: {formatearFecha(solicitud.respuesta_fecha)}</span>
                      )}
                    </div>
                    
                    {/* Botones de acción según estado y tipo */}
                    {solicitud.estado === "pendiente" && (
                      <div className="flex gap-2">
                        {activeTab === "recibidas" ? (
                          <>
                            <button
                              onClick={() => aceptarSolicitud(solicitud.id)}
                              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Aceptar
                            </button>
                            <button
                              onClick={() => rechazarSolicitud(solicitud.id)}
                              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Rechazar
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => cancelarSolicitud(solicitud.id)}
                            className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Cancelar solicitud
                          </button>
                        )}
                      </div>
                    )}
                    
                    {solicitud.estado === "aceptada" && (
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-green-700 text-sm font-medium">
                          ✅ ¡Intercambio aceptado!
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Contacta al {activeTab === "recibidas" ? "solicitante" : "propietario"} vía correo electrónico.
                        </p>
                        
                        {/* Botón de chat */}
                        <button
                          onClick={() => {
                            const otroUsuario = activeTab === "recibidas" ? {
                              id: solicitud.solicitante_id,
                              name: solicitud.solicitante_nombre,
                              email: solicitud.solicitante_email
                            } : {
                              id: solicitud.propietario_id,
                              name: solicitud.propietario_nombre,
                              email: solicitud.propietario_email
                            };
                            console.log("🟢 Abrir chat con:", otroUsuario);
                            setChatUsuario(otroUsuario);
                            setChatMaterialId(solicitud.material_id);
                          }}
                          className="mt-3 w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Hablar con {activeTab === "recibidas" ? solicitud.solicitante_nombre : solicitud.propietario_nombre}
                        </button>
                      </div>
                    )}
                    
                    {solicitud.estado === "rechazada" && (
                      <div className="bg-red-50 p-3 rounded-lg text-center">
                        <p className="text-red-700 text-sm font-medium">
                          ❌ Solicitud rechazada
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Modal de chat */}
      {chatUsuario && (
        <ChatInterno
          otroUsuario={chatUsuario}
          materialId={chatMaterialId}
          onClose={() => {
            console.log("🟢 Cerrando chat");
            setChatUsuario(null);
            setChatMaterialId(null);
          }}
        />
      )}
      
      {/* Overlay de carga */}
      {accionando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Procesando...</p>
          </div>
        </div>
      )}
      
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={() => window.location.reload()} />
    </>
  );
}