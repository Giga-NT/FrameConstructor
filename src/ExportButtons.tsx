// ExportButtons.tsx
import React from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';

const ExportButtons = () => {
  const { scene } = useThree(); // Получаем сцену из контекста

  const exportToSTL = (scene: THREE.Scene) => {
    const exporter = new STLExporter();
    const result = exporter.parse(scene);
    const blob = new Blob([result], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'model.stl';
    link.click();
  };

  return (
    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 100 }}>
      <button onClick={() => exportToSTL(scene)}>Экспортировать как STL</button>
    </div>
  );
};

export default ExportButtons;