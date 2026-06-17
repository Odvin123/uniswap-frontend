import { useState, useEffect } from "react";
import { Bell, CheckCircle, XCircle, Clock, MessageCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function SistemaNotificaciones() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  useEffect(() => {
    if (user) {
      cargarNotificaciones();
      // Simular notificaciones en tiempo real cada 30 segundos
      const interval = setInterval(cargarNotificaciones, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);
  
  const cargarNotificaciones = () => {
    const solicitudes = JSON.parse(localStorage.getItem("uniswap_solicitudes") || "[]");
    const notis = [];
    
    solicitudes.forEach(s => {
      if (s.propietarioId === user?.id && s.estado === "pendiente") {
        notis.push({
          id: s.id,
          tipo: "nueva_solicitud",
          mensaje: `${s.solicitante} quiere tu material "${s.materialTitulo}"`,
          fecha: s.fecha,
          leida: false
        });
      }
      
      if (s.solicitanteId === user?.id && s.estado === "aceptada") {
        notis.push({
          id: s.id,
          tipo: "solicitud_aceptada",
          mensaje: `${s.propietario} aceptó tu solicitud para "${s.materialTitulo}"`,
          fecha: s.respuestaFecha,
          leida: false
        });
      }
      
      if (s.solicitanteId === user?.id && s.estado === "rechazada") {
        notis.push({
          id: s.id,
          tipo: "solicitud_rechazada",
          mensaje: `${s.propietario} rechazó tu solicitud para "${s.materialTitulo}"`,
          fecha: s.respuestaFecha,
          leida: false
        });
      }
    });
    
    setNotificaciones(notis.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
  };
  
  const marcarLeida = (id) => {
    setNotificaciones(notis => 
      notis.map(n => n.id === id ? { ...n, leida: true } : n)
    );
  };
  
  const getIcono = (tipo) => {
    switch(tipo) {
      case "nueva_solicitud": return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case "solicitud_aceptada": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "solicitud_rechazada": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };
  
  const noLeidas = notificaciones.filter(n => !n.leida).length;
  
  if (!user) return null;
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {noLeidas > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {noLeidas}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 border border-gray-100">
            <div className="p-3 border-b border-gray-100 font-semibold">
              Notificaciones
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notificaciones.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No hay notificaciones
                </div>
              ) : (
                notificaciones.map(noti => (
                  <div
                    key={noti.id}
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition ${!noti.leida ? 'bg-blue-50' : ''}`}
                    onClick={() => marcarLeida(noti.id)}
                  >
                    <div className="flex items-start gap-2">
                      {getIcono(noti.tipo)}
                      <div className="flex-1">
                        <p className="text-sm">{noti.mensaje}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(noti.fecha).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}