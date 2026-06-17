import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../config/supabase";

export default function ChatInterno({ otroUsuario, materialId, onClose }) {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const messagesEndRef = useRef(null);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
  
  // Crear ID del chat - ¡USAR EL MISMO FORMATO QUE EN LA PRUEBA!
  const chatId = [user?.id, otroUsuario?.id].sort().join('-');
  console.log("💬 Chat ID:", chatId);
  console.log("👤 Otro usuario:", otroUsuario);
  
  // Cargar mensajes
  const cargarMensajes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("❌ No hay sesión");
        setLoading(false);
        return;
      }
      
      console.log("📩 Cargando mensajes del chat:", chatId);
      
      const response = await fetch(`${API_URL}/api/mensajes/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Mensajes cargados:", data);
        setMensajes(data);
      } else {
        const error = await response.json();
        console.error("❌ Error al cargar mensajes:", error);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
    setLoading(false);
  };
  
  useEffect(() => {
    if (user) {
      cargarMensajes();
      // Recargar cada 3 segundos
      const interval = setInterval(cargarMensajes, 3000);
      return () => clearInterval(interval);
    }
  }, [user, chatId]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);
  
  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || enviando || !user) return;
    
    setEnviando(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("❌ No tienes sesión activa");
        setEnviando(false);
        return;
      }
      
      console.log("📤 Enviando mensaje...");
      console.log("- Chat ID:", chatId);
      console.log("- Texto:", nuevoMensaje);
      
      const response = await fetch(`${API_URL}/api/mensajes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          chat_id: chatId,
          texto: nuevoMensaje
        })
      });
      
      if (response.ok) {
        const nuevo = await response.json();
        console.log("✅ Mensaje enviado:", nuevo);
        setMensajes(prev => [...prev, nuevo]);
        setNuevoMensaje("");
      } else {
        const error = await response.json();
        console.error("❌ Error del servidor:", error);
        alert(`❌ Error: ${error.error || "No se pudo enviar"}`);
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      alert("❌ Error de conexión");
    }
    
    setEnviando(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md h-[450px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-xl">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">
              Chat con {otroUsuario?.name || otroUsuario?.nombre || "Usuario"}
            </span>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : mensajes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
              <p>No hay mensajes aún</p>
              <p className="text-sm">Envía un mensaje para comenzar</p>
            </div>
          ) : (
            mensajes.map((msg, index) => {
              const esMiMensaje = msg.emisor_id === user?.id;
              return (
                <div
                  key={msg.id || index}
                  className={`flex ${esMiMensaje ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      esMiMensaje
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none shadow-md'
                    }`}
                  >
                    {!esMiMensaje && (
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
                        {msg.emisor_nombre || "Usuario"}
                      </p>
                    )}
                    <p className="text-sm break-words">{msg.texto}</p>
                    <p className={`text-xs mt-1 text-right ${
                      esMiMensaje ? 'text-emerald-200' : 'text-gray-400 dark:text-gray-500'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
          <div className="flex gap-2">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarMensaje()}
              placeholder="Escribe un mensaje..."
              className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
              disabled={enviando}
            />
            <button
              onClick={enviarMensaje}
              disabled={enviando || !nuevoMensaje.trim()}
              className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}