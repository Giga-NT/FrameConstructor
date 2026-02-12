// RoofControls.tsx
import React from 'react';
import { FrameParams } from '../../types/types';
import ControlGroup from '../UI/ControlGroup';

interface RoofControlsProps {
  params: FrameParams;
  onChange: (params: FrameParams) => void;
}

const RoofControls: React.FC<RoofControlsProps> = React.memo(({ params, onChange }) => {
  const handleChange = (field: keyof FrameParams, value: any) => {
    onChange({ ...params, [field]: value });
  };

  // Цвета по умолчанию для материалов
  const getDefaultColor = (material: string) => {
    switch(material) {
      case 'polycarbonate': return '#80b3ff';
      case 'metal': return '#c0c0c0';
      case 'tile': return '#8b0000';
      default: return '#ffffff';
    }
  };

  return (
    <div className="roof-controls">
      <h2>Параметры крыши</h2>

      <ControlGroup label="Тип кровли:">
		<select
		  value={params.roofType}
		  onChange={(e) => handleChange('roofType', e.target.value as 'flat' | 'gable' | 'arched')}
		>
		  <option value="flat">Плоская</option>
		  <option value="gable">Двускатная</option>
		  <option value="arched">Арочная</option>
		</select>
      </ControlGroup>

      <ControlGroup label="Материал кровли:">
        <select
          value={params.roofMaterial}
          onChange={(e) => {
            const material = e.target.value;
            handleChange('roofMaterial', material);
            handleChange('roofColor', getDefaultColor(material));
          }}
        >
          <option value="polycarbonate">Поликарбонат</option>
          <option value="metal">Металл</option>
          <option value="tile">Черепица</option>
        </select>
      </ControlGroup>

      <ControlGroup label="Толщина кровли (м):">
        <input
          type="number"
          value={params.roofThickness}
          min="0.01"
          max="0.1"
          step="0.001"
          onChange={(e) => handleChange('roofThickness', parseFloat(e.target.value))}
        />
      </ControlGroup>

      {params.roofMaterial === 'polycarbonate' && (
        <>
          <ControlGroup label="Цвет:">
            <input
              type="color"
              value={params.roofColor}
              onChange={(e) => handleChange('roofColor', e.target.value)}
            />
          </ControlGroup>

          <ControlGroup label="Прозрачность:">
            <input
              type="range"
              value={params.roofOpacity}
              min="0"
              max="1"
              step="0.1"
              onChange={(e) => handleChange('roofOpacity', parseFloat(e.target.value))}
            />
          </ControlGroup>
        </>
      )}

      {(params.roofMaterial === 'metal' || params.roofMaterial === 'tile') && (
        <ControlGroup label="Цвет:">
          <input
            type="color"
            value={params.roofColor}
            onChange={(e) => handleChange('roofColor', e.target.value)}
          />
        </ControlGroup>
      )}

		{(params.roofType === 'arched') && (
		  <ControlGroup label="Высота арки (м):">
			<input
			  type="number"
			  value={params.archHeight || 1.5}
			  min="0.5"
			  max="5"
			  step="0.1"
			  onChange={(e) => handleChange('archHeight', parseFloat(e.target.value))}
			/>
		  </ControlGroup>
		)}

      <h3>Свесы</h3>

      <ControlGroup label="Передний (м):">
        <input
          type="number"
          value={params.frontOverhang}
          min="0"
          max="2"
          step="0.1"
          onChange={(e) => handleChange('frontOverhang', parseFloat(e.target.value))}
        />
      </ControlGroup>

      <ControlGroup label="Задний (м):">
        <input
          type="number"
          value={params.rearOverhang}
          min="0"
          max="2"
          step="0.1"
          onChange={(e) => handleChange('rearOverhang', parseFloat(e.target.value))}
        />
      </ControlGroup>

      <ControlGroup label="Левый (м):">
        <input
          type="number"
          value={params.leftSideOverhang}
          min="0"
          max="2"
          step="0.1"
          onChange={(e) => handleChange('leftSideOverhang', parseFloat(e.target.value))}
        />
      </ControlGroup>

      <ControlGroup label="Правый (м):">
        <input
          type="number"
          value={params.rightSideOverhang}
          min="0"
          max="2"
          step="0.1"
          onChange={(e) => handleChange('rightSideOverhang', parseFloat(e.target.value))}
        />
      </ControlGroup>
    </div>
  );
});

export default RoofControls;