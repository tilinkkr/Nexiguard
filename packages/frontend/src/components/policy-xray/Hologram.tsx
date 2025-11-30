import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

function PolicyHologram({ riskLevel }: { riskLevel: 'SAFE' | 'MODERATE' | 'HIGH' }) {
    const meshRef = useRef<THREE.Group>(null!);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    const color = riskLevel === 'SAFE' ? '#10b981' : riskLevel === 'MODERATE' ? '#fbbf24' : '#ef4444';

    return (
        <group ref={meshRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Core Policy Structure */}
                <mesh>
                    <icosahedronGeometry args={[1.5, 0]} />
                    <meshStandardMaterial color={color} wireframe transparent opacity={0.3} />
                </mesh>
                <mesh>
                    <icosahedronGeometry args={[1.4, 0]} />
                    <meshStandardMaterial color={color} transparent opacity={0.1} side={THREE.DoubleSide} />
                </mesh>

                {/* Inner Data Nodes */}
                <mesh position={[0.8, 0.8, 0]}>
                    <boxGeometry args={[0.2, 0.2, 0.2]} />
                    <meshStandardMaterial color="cyan" emissive="cyan" emissiveIntensity={2} />
                </mesh>
                <mesh position={[-0.8, -0.5, 0.5]}>
                    <sphereGeometry args={[0.1]} />
                    <meshStandardMaterial color="magenta" emissive="magenta" emissiveIntensity={2} />
                </mesh>

                {/* Orbiting Rings */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[2.2, 0.02, 16, 100]} />
                    <meshStandardMaterial color="white" transparent opacity={0.1} />
                </mesh>
            </Float>
        </group>
    );
}

export default function HologramScene({ riskLevel }: { riskLevel: 'SAFE' | 'MODERATE' | 'HIGH' }) {
    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="cyan" />
            <PolicyHologram riskLevel={riskLevel} />
            <Environment preset="city" />
        </>
    );
}
