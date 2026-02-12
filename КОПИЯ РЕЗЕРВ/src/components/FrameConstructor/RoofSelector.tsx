import React from 'react';
import RoofControls from './RoofControls';
import { FrameParams } from '../../types/types';

interface RoofSelectorProps {
  params: FrameParams;
  onChange: (params: FrameParams) => void;
}

const RoofSelector: React.FC<RoofSelectorProps> = ({ params, onChange }) => {
  return (
    <div className="roof-selector">
      <h2>Кровля</h2>
      <RoofControls params={params} onChange={onChange} />
    </div>
  );
};

export default React.memo(RoofSelector);