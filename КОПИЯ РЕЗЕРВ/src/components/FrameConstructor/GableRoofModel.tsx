// GableRoofModel.tsx
import React from 'react';
import FrameModel from './FrameModel';

const GableRoofModel: React.FC<{frameParams: any, foundationParams: any, weldingParams: any}> = (props) => {
  const params = {
    ...props.frameParams,
    roofType: 'gable'
  };
  return <FrameModel frameParams={params} foundationParams={props.foundationParams} weldingParams={props.weldingParams} />;
};

export default GableRoofModel;