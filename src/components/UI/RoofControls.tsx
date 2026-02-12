// RoofControls.tsx
import React from 'react';
import { FrameParams } from '../../types/types';
import ControlGroup from '../UI/ControlGroup';

interface RoofControlsProps {
  params: FrameParams;
  onChange: (params: FrameParams) => void;
}

const RoofControls: React.FC<RoofControlsProps> = ({ params, onChange }) => {
  const handleChange = (field: keyof FrameParams, value: any) => {
    onChange({ ...params, [field]: value });
  };

  return (
    <>
      <ControlGroup label="Материал кровли:">
        <select
          value={params.roofMaterial}
          onChange={(e) => handleChange('roofMaterial', e.target.value)}
        >
          <option value="polycarbonate">Поликарбонат</option>
          <option value="metal">Металл</option>
          <option value="tile">Черепица</option>
        </select>
      </ControlGroup>

      {/* Другие контролы */}
    </>
  );
};

export default RoofControls;