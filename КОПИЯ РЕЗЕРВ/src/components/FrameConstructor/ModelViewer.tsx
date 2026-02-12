// ModelViewer.tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import FrameModel from './FrameModel';
import { FrameParams, FoundationParams, WeldingParams } from '../../types/types';

interface ModelViewerProps {
    frameParams: FrameParams;
    foundationParams: FoundationParams;
    weldingParams: WeldingParams;
}

const ModelViewer: React.FC<ModelViewerProps> = React.memo(({
    frameParams,
    foundationParams,
    weldingParams
}) => {
    return (
        <Canvas
            shadows
            camera={{ position: [15, 10, 15], fov: 60 }}
            gl={{
                antialias: true,
                powerPreference: "high-performance",
                alpha: true
            }}
            dpr={[1, 2]}
        >
            <color attach="background" args={['#f0f0f0']} />
            <ambientLight intensity={0.6} />
            <directionalLight
                position={[10, 20, 10]}
                intensity={0.8}
                castShadow
                shadow-mapSize={1024}
            />

            {foundationParams.showEnvironment && (
                <>
                    <Sky
                        distance={10000}
                        sunPosition={[1, 1, 1]}
                        inclination={0}
                        azimuth={0.25}
                        turbidity={10}
                        rayleigh={2}
                        mieCoefficient={0.005}
                        mieDirectionalG={0.8}
                    />
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                        <circleGeometry args={[100, 32]} />
                        <meshStandardMaterial color="#3a5f0b" roughness={1} metalness={0} />
                    </mesh>
                </>
            )}

            <FrameModel
                frameParams={frameParams}
                foundationParams={foundationParams}
                weldingParams={weldingParams}
            />

            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                target={[
                    frameParams.length / 2,
                    frameParams.height + (frameParams.trussHeightLeft + frameParams.trussHeightRight) / 2,
                    0
                ]}
            />
        </Canvas>
    );
});

export default ModelViewer;