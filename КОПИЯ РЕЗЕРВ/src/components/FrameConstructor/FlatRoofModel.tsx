// FlatRoofModel.tsx
import React from 'react';
import FrameModel from './FrameModel';

const FlatRoofModel: React.FC<{frameParams: any, foundationParams: any, weldingParams: any}> = (props) => {
  const params = {
    ...props.frameParams,
    roofType: 'flat'
  };
  return <FrameModel frameParams={params} foundationParams={props.foundationParams} weldingParams={props.weldingParams} />;
};

export default FlatRoofModel;