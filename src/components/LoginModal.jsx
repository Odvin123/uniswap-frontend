import { useState } from "react";
import { X, Mail, Lock, User, GraduationCap, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSecurity } from "../context/SecurityContext";

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [carrera, setCarrera] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, register } = useAuth();
  const { 
    intentosFallidos, 
    bloqueado, 
    tiempoRestante, 
    registrarIntentoFallido, 
    resetearIntentos 
  } = useSecurity();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Verificar si está bloqueado
    if (bloqueado) {
      setError(`⚠️ Demasiados intentos. Espera ${tiempoRestante} segundos.`);
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        resetearIntentos(); // Resetear al iniciar sesión correctamente
        alert("✅ ¡Sesión iniciada correctamente!");
      } else {
        await register(name, email, password, carrera);
        resetearIntentos();
        alert("✅ ¡Cuenta creada exitosamente!");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
      
      // Si es un error de login, registrar intento fallido
      if (isLogin && err.message.includes("contraseña")) {
        const bloqueado = registrarIntentoFallido();
        if (bloqueado) {
          setError(`🔒 Demasiados intentos. Espera 10 segundos.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {isLogin ? "Iniciar sesión" : "Crear cuenta"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mostrar bloqueo */}
        {bloqueado && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <span>🔒 Bloqueado por {tiempoRestante} segundos</span>
          </div>
        )}
        
        {/* Mostrar intentos restantes */}
        {!bloqueado && isLogin && intentosFallidos > 0 && (
          <div className="mx-4 mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>⚠️ {3 - intentosFallidos} intento(s) restante(s) antes del bloqueo</span>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex border-b dark:border-gray-700">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
            className={`flex-1 py-3 font-medium transition-all ${
              isLogin ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500"
            }`}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
            className={`flex-1 py-3 font-medium transition-all ${
              !isLogin ? "text-emerald-600 border-b-2 border-emerald-600" : "text-gray-500"
            }`}
          >
            Registrarse
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: Ana Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Carrera *
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                    value={carrera}
                    onChange={(e) => setCarrera(e.target.value)}
                  >
                    <option value="">Selecciona tu carrera</option>
                    <option value="Sistemas">Ingeniería de Sistemas</option>
                    <option value="Electrónica">Ingeniería Electrónica</option>
                    <option value="Civil">Ingeniería Civil</option>
                    <option value="Industrial">Ingeniería Industrial</option>
                    <option value="Mecánica">Ingeniería Mecánica</option>
                    <option value="Química">Ingeniería Química</option>
                  </select>
                </div>
              </div>
            </>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo institucional *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="tu.correo@std.uni.edu.ni"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={bloqueado}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Solo correos @std.uni.edu.ni</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={bloqueado}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!isLogin && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Mínimo 4 caracteres</p>
            )}
          </div>
          
          {error && (
            <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
              error.includes("Bloqueado") || error.includes("Demasiados") 
                ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" 
                : "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400"
            }`}>
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || bloqueado}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Cargando..." : (isLogin ? "Iniciar sesión" : "Registrarse")}
          </button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setPassword("");
              }}
              className="ml-1 text-emerald-600 font-semibold hover:underline"
              disabled={bloqueado}
            >
              {isLogin ? "Regístrate aquí" : "Inicia sesión aquí"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}