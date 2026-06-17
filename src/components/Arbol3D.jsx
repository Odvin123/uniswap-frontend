import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Cone, Box, OrbitControls, Environment, Sparkles } from '@react-three/drei';

// Componente del tronco
function Tronco() {
  return (
    <Cylinder 
      args={[0.3, 0.5, 1.5, 8]} 
      position={[0, -1.5, 0]}
    >
      <meshStandardMaterial color="#8B4513" roughness={0.8} />
    </Cylinder>
  );
}

// Componente de las hojas (copas)
function Hojas() {
  const colores = ['#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A'];
  
  return (
    <>
      {[0, 0.8, 1.2, 0.5, -0.5].map((offset, index) => (
        <Cone
          key={index}
          args={[1.2 - index * 0.15, 0.8, 8]}
          position={[index * 0.1, 0.8 + index * 0.5, offset * 0.3]}
          rotation={[0.1, index * 0.2, 0.05]}
        >
          <meshStandardMaterial 
            color={colores[index % colores.length]} 
            roughness={0.6}
            metalness={0.1}
          />
        </Cone>
      ))}
    </>
  );
}

// Componente de las raíces
function Raices() {
  return (
    <>
      {[-0.6, 0.6].map((x, i) => (
        <Cylinder
          key={i}
          args={[0.1, 0.2, 0.6, 4]}
          position={[x, -2.2, 0]}
          rotation={[0.3, x * 0.2, 0]}
        >
          <meshStandardMaterial color="#6D4C41" roughness={0.9} />
        </Cylinder>
      ))}
    </>
  );
}

// Componente principal del árbol
function Arbol() {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Rotación suave del árbol
      groupRef.current.rotation.y += 0.001;
      
      // Movimiento de flotación
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });
  
  return (
    <group 
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      <Tronco />
      <Hojas />
      <Raices />
      
      {/* Detalles decorativos - frutas */}
      <Sphere position={[0.4, 1.8, 0.3]} args={[0.08, 8, 8]}>
        <meshStandardMaterial color="#FF6F00" emissive="#FF6F00" emissiveIntensity={0.3} />
      </Sphere>
      <Sphere position={[-0.3, 2.0, -0.2]} args={[0.07, 8, 8]}>
        <meshStandardMaterial color="#FF6F00" emissive="#FF6F00" emissiveIntensity={0.2} />
      </Sphere>
    </group>
  );
}

// Componente principal para exportar
export default function Arbol3D() {
  return (
    <div className="w-full h-[400px] md:h-[500px] relative">
      <Canvas
        camera={{ position: [3, 2, 5], fov: 45 }}
        className="rounded-2xl"
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, 5]} intensity={0.3} color="#4CAF50" />
        <Environment preset="forest" />
        
        {/* Base de tierra */}
        <Cylinder args={[2.5, 2.5, 0.1, 32]} position={[0, -2.5, 0]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#4E342E" roughness={1} />
        </Cylinder>
        
        <Arbol />
        
        {/* Partículas decorativas */}
        <Sparkles 
          count={100}
          scale={5}
          size={0.1}
          color="#4CAF50"
          opacity={0.6}
        />
        
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={Math.PI / 4}
          autoRotate={false}
        />
      </Canvas>
      
      {/* Texto flotante */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm font-medium bg-black/30 backdrop-blur-sm py-2 px-4 mx-auto max-w-xs rounded-full">
        🌱 Crece con nosotros
      </div>
    </div>
  );
}