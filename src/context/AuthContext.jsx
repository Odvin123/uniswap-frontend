import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../config/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
      }
      setLoading(false);
    });

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Registro
  const register = async (name, email, password, carrera) => {
    if (!email.endsWith("@std.uni.edu.ni")) {
      throw new Error("Debes usar tu correo institucional @std.uni.edu.ni");
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          carrera
        }
      }
    });

    if (error) throw error;
    
    // Crear perfil en la tabla perfiles
    if (data.user) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.session?.access_token}`
        },
        body: JSON.stringify({
          nombre: name,
          email,
          carrera,
          avatar_url: `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${name}`
        })
      });
    }
    
    return data.user;
  };

  // Inicio de sesión
  const login = async (email, password) => {
    if (!email.endsWith("@std.uni.edu.ni")) {
      throw new Error("Solo correos @std.uni.edu.ni pueden acceder");
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data.user;
  };
// Cerrar sesión
const logout = async () => {
  // Limpiar localStorage
  localStorage.clear();
  
  // Limpiar sessionStorage
  sessionStorage.clear();
  
  // Cerrar sesión en Supabase
  await supabase.auth.signOut();
  
  // Limpiar el estado del usuario
  setUser(null);
  
  // Redirigir al landing
  window.location.href = '/';
};
  // Actualizar usuario
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}