import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ImageUpload from "../components/ImageUpload";
import LoginModal from "../components/LoginModal";
import { supabase } from "../config/supabase";

export default function Publicar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [form, setForm] = useState({
    titulo: "",
    tipo: "libro",
    carrera: "",
    estado: "bueno",
    descripcion: "",
    imagen: null
  });
  const [submitting, setSubmitting] = useState(false);
  
  if (!user) {
    return (
      <>
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔒 Necesitas iniciar sesión</h2>
            <p className="text-gray-600 mb-6">Para publicar materiales, primero debes autenticarte</p>
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
  
const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    // Obtener el token de sesión
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      alert("❌ No estás autenticado");
      setSubmitting(false);
      return;
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/materiales`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        titulo: form.titulo,
        tipo: form.tipo,
        carrera: form.carrera,
        estado: form.estado,
        descripcion: form.descripcion,
        imagen_url: form.imagen
      })
    });
    
    if (response.ok) {
      alert("✅ ¡Material publicado exitosamente!");
      navigate("/catalogo");
    } else {
      const error = await response.json();
      alert(`❌ Error: ${error.error || "No se pudo publicar"}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error de conexión con el servidor");
  }
  
  setSubmitting(false);
};
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">📤 Publicar material</h1>
        <p className="text-gray-600">Comparte tus materiales con la comunidad UNI</p>
        <div className="flex items-center gap-2 mt-2 text-sm text-emerald-600">
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-6 h-6 rounded-full"
          />
          <span>Publicando como: {user.name}</span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Título del material *</label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            placeholder="Ej: Cálculo Diferencial"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            >
              <option value="libro">📖 Libro</option>
              <option value="apunte">📝 Apunte</option>
              <option value="oficina">✏️ Oficina</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="excelente">✨ Excelente</option>
              <option value="bueno">👍 Bueno</option>
              <option value="regular">📝 Regular</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Carrera *</label>
          <select
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={form.carrera}
            onChange={(e) => setForm({ ...form, carrera: e.target.value })}
          >
            <option value="">Selecciona</option>
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
        </div>
        
        <ImageUpload onImageUpload={(imagen) => setForm({ ...form, imagen })} />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Describe el material..."
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-50"
        >
          {submitting ? "Publicando..." : "📢 Publicar material"}
        </button>
      </form>
    </div>
  );
}