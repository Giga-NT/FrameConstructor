import React from 'react';
import { ControlProps } from '../../types/types';

const TubeControls: React.FC<ControlProps> = ({ params, onChange }) => {
  return (
    <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '15px' }}>
      <h3>Размеры труб</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Стойки: </label>
        <select 
          value={params.pillarTubeSize} 
          onChange={(e) => onChange('pillarTubeSize', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="40x40">40×40 мм</option>
          <option value="50x50">50×50 мм</option>
          <option value="60x60">60×60 мм</option>
          <option value="80x80">80×80 мм</option>
          <option value="100x100">100×100 мм</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Кровля: </label>
        <select 
          value={params.roofTubeSize} 
          onChange={(e) => onChange('roofTubeSize', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="40x40">40×40 мм</option>
          <option value="50x50">50×50 мм</option>
          <option value="60x60">60×60 мм</option>
          <option value="80x80">80×80 мм</option>
          <option value="100x100">100×100 мм</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Фермы: </label>
        <select 
          value={params.trussTubeSize} 
          onChange={(e) => onChange('trussTubeSize', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="40x40">40×40 мм</option>
          <option value="50x50">50×50 мм</option>
          <option value="60x60">60×60 мм</option>
          <option value="80x80">80×80 мм</option>
          <option value="100x100">100×100 мм</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Обрешетка: </label>
        <select 
          value={params.lathingTubeSize} 
          onChange={(e) => onChange('lathingTubeSize', e.target.value)}
          style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="40x20">40×20 мм</option>
          <option value="40x40">40×40 мм</option>
          <option value="50x50">50×50 мм</option>
          <option value="60x60">60×60 мм</option>
        </select>
      </div>
    </div>
  );
};

export default TubeControls;