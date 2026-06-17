import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SecurityProvider } from "./context/SecurityContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Catalogo from "./pages/Catalogo";
import Publicar from "./pages/Publicar";
import MisIntercambios from "./pages/MisIntercambios";
import Perfil from "./pages/Perfil";

function App() {
  return (
    <Router>
      <ThemeProvider>
        <SecurityProvider>
          <AuthProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route 
                  path="/publicar" 
                  element={
                    <ProtectedRoute>
                      <Publicar />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/mis-intercambios" 
                  element={
                    <ProtectedRoute>
                      <MisIntercambios />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/perfil" 
                  element={
                    <ProtectedRoute>
                      <Perfil />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Layout>
          </AuthProvider>
        </SecurityProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;