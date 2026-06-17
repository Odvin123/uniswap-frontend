import { createContext, useContext, useState, useEffect } from 'react';

const SecurityContext = createContext(null);

export function SecurityProvider({ children }) {
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const [ultimoIntento, setUltimoIntento] = useState(null);

  // Cargar estado desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('security_state');
    if (saved) {
      const data = JSON.parse(saved);
      setIntentosFallidos(data.intentosFallidos || 0);
      setBloqueado(data.bloqueado || false);
      setUltimoIntento(data.ultimoIntento || null);
      
      if (data.bloqueado && data.ultimoIntento) {
        const tiempoPasado = (Date.now() - data.ultimoIntento) / 1000;
        if (tiempoPasado < 10) {
          setTiempoRestante(Math.ceil(10 - tiempoPasado));
          iniciarContador(Math.ceil(10 - tiempoPasado));
        } else {
          // Desbloquear si ya pasaron 10 segundos
          resetearIntentos();
        }
      }
    }
  }, []);

  // Guardar estado en localStorage
  const guardarEstado = () => {
    localStorage.setItem('security_state', JSON.stringify({
      intentosFallidos,
      bloqueado,
      ultimoIntento
    }));
  };

  useEffect(() => {
    guardarEstado();
  }, [intentosFallidos, bloqueado, ultimoIntento]);

  const iniciarContador = (segundos) => {
    setTiempoRestante(segundos);
    const interval = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          resetearIntentos();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  };

  const registrarIntentoFallido = () => {
    const nuevosIntentos = intentosFallidos + 1;
    setIntentosFallidos(nuevosIntentos);
    setUltimoIntento(Date.now());

    if (nuevosIntentos >= 3) {
      // Bloquear por 10 segundos
      setBloqueado(true);
      iniciarContador(10);
      setIntentosFallidos(0);
      return true; // Está bloqueado
    }
    return false; // Aún no está bloqueado
  };

  const resetearIntentos = () => {
    setIntentosFallidos(0);
    setBloqueado(false);
    setTiempoRestante(0);
    setUltimoIntento(null);
    localStorage.removeItem('security_state');
  };

  return (
    <SecurityContext.Provider value={{
      intentosFallidos,
      bloqueado,
      tiempoRestante,
      registrarIntentoFallido,
      resetearIntentos
    }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}