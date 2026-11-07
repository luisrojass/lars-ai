'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { EsquemaGeometrico } from '@/types';

interface Canvas3DThreeProps {
  esquema: EsquemaGeometrico;
  valoresSliders: Record<string, number>;
}

// Visualizador de Vector en 3D
const Vector3D: React.FC<{
  start: [number, number, number];
  end: [number, number, number];
  color: string;
  dashed?: boolean;
  label?: string;
}> = ({ start, end, color, dashed = false, label }) => {
  const dir = new THREE.Vector3(...end).sub(new THREE.Vector3(...start));
  const len = dir.length();

  return (
    <group>
      <Line
        points={[start, end]}
        color={color}
        lineWidth={dashed ? 2.5 : 4}
        dashed={dashed}
      />
      {/* Cono punta de flecha */}
      {len > 0.1 && (
        <mesh position={end} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.12, 0.3, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      )}
      {label && (
        <Text
          position={[end[0] + 0.2, end[1] + 0.2, end[2]]}
          fontSize={0.25}
          color="#334155"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
};

// Superficie Paramétrica en 3D
const SuperficieParametrica: React.FC<{
  valoresSliders: Record<string, number>;
}> = ({ valoresSliders }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const k = valoresSliders['k'] || 2;
  const a = valoresSliders['a'] || 1.5;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial
        color="#0284C7"
        wireframe={true}
        roughness={0.4}
      />
    </mesh>
  );
};

/**
 * Lienzo 3D con Three.js / React Three Fiber en Modo Claro Proyector (#F8FAFC)
 */
export const Canvas3DThree: React.FC<Canvas3DThreeProps> = ({
  esquema,
  valoresSliders
}) => {
  const factorLambda = valoresSliders['lambda'] ?? 1.8;
  const vx = valoresSliders['vx'] ?? 2;
  const vy = valoresSliders['vy'] ?? 1;

  return (
    <div
      className="w-full h-full relative"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <Canvas
        camera={{ position: [5, 4, 6], fov: 45 }}
        style={{ background: '#F8FAFC' }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} />
        
        {/* Cuadrícula de Proyector Alto Contraste */}
        <Grid
          args={[12, 12]}
          cellColor="#CBD5E1"
          sectionColor="#334155"
          sectionSize={1}
          fadeDistance={25}
          fadeStrength={1}
        />

        {/* Ejes de Referencia */}
        <axesHelper args={[4]} />

        {/* Vectores 3D de Alto Contraste */}
        <Vector3D
          start={[0, 0, 0]}
          end={[vx, vy, 0.5]}
          color="#334155"
          label="v"
        />

        {/* Vector Solución: Cian #0284C7 */}
        <Vector3D
          start={[0, 0, 0]}
          end={[vx * factorLambda, vy * factorLambda, 0.5 * factorLambda]}
          color="#0284C7"
          label="T(v) = λv"
        />

        {/* Vector Diagnóstico Error: Rojo Carmesí Punteado #E11D48 */}
        <Vector3D
          start={[0, 0, 0]}
          end={[-vy, vx, 1]}
          color="#E11D48"
          dashed={true}
          label="Diagnóstico Error"
        />

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export default Canvas3DThree;
