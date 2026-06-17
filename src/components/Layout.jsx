import { Link, useLocation } from "react-router-dom";
import { BookOpen, Search, PlusCircle, User, Repeat, Home, Leaf, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginModal from "./LoginModal";
import SistemaNotificaciones from "./SistemaNotificaciones";
import ThemeToggle from "./ThemeToggle";

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const auth = useAuth();
  const user = auth?.user || null;
  const logout = auth?.logout || (() => {});
  
  const navLinks = [
    { path: "/", name: "Inicio", icon: Home, protected: false },
    { path: "/catalogo", name: "Catálogo", icon: Search, protected: false },
    { path: "/publicar", name: "Publicar", icon: PlusCircle, protected: true },
    { path: "/mis-intercambios", name: "Mis Intercambios", icon: Repeat, protected: true },
    { path: "/perfil", name: "Perfil", icon: User, protected: true },
  ];
  
const handleLogout = async () => {
  if (logout) {
    await logout();
    // No necesitas window.location.href aquí porque ya está en el logout
  }
};
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-emerald-100 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">
                  UNISWAP
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 ml-1 font-medium">beta</span>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                if (link.protected && !user) {
                  return (
                    <button
                      key={link.path}
                      onClick={() => setShowLogin(true)}
                      className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <Icon size={18} />
                      {link.name}
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-700 dark:hover:text-emerald-400'
                    }`}
                  >
                    <Icon size={18} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* User section */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notificaciones */}
              <SistemaNotificaciones />
              
              {user ? (
                <div className="flex items-center gap-3">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${user.name}`} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition text-red-600 dark:text-red-400"
                    title="Cerrar sesión"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLogin(true)}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition"
                >
                  Iniciar sesión
                </button>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 dark:text-white" /> : <Menu className="w-6 h-6 dark:text-white" />}
            </button>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                
                if (link.protected && !user) {
                  return (
                    <button
                      key={link.path}
                      onClick={() => {
                        setShowLogin(true);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 rounded-lg transition mb-2 flex items-center gap-3 text-gray-400 dark:text-gray-500"
                    >
                      <Icon size={20} />
                      {link.name}
                    </button>
                  );
                }
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition mb-2 flex items-center gap-3 ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={20} />
                    {link.name}
                  </Link>
                );
              })}
              
              {/* Mobile theme toggle */}
              <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-gray-600 dark:text-gray-400">Modo oscuro</span>
                  <ThemeToggle />
                </div>
              </div>
              
              {/* Mobile user section */}
              <div className="pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || `https://ui-avatars.com/api/?background=0D9488&color=fff&name=${user.name}`} 
                        alt={user.name} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                    </div>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition text-red-600 dark:text-red-400"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setShowLogin(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Iniciar sesión
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-xl">UNISWAP</span>
              </div>
              <p className="text-gray-400 text-sm">Economía circular colaborativa para la comunidad universitaria</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/catalogo" className="hover:text-emerald-400 transition">Explorar materiales</Link></li>
                <li><Link to="/publicar" className="hover:text-emerald-400 transition">Publicar material</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Comunidad</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-emerald-400 transition">Centro de ayuda</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition">Términos y condiciones</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <p className="text-sm text-gray-400">Ecotrío - UNI 2026</p>
              <p className="text-sm text-gray-400">Innovación ambiental</p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2026 UNISWAP - Transformando residuos en recursos ♻️
          </div>
        </div>
      </footer>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)}
        onSuccess={() => {
          setShowLogin(false);
          window.location.reload();
        }}
      />
    </div>
  );
}