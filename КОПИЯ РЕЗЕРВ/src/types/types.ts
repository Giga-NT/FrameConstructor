export interface FrameParams {
  length: number;
  width: number;
  height: number;
  numColumns: number;
  columnSection: number;
  trussSection: number;
  purlinSection: number;
  trussHeightLeft: number;
  trussHeightRight: number;
  bayLengthLeft: number;
  bayLengthRight: number;
  numBaysLeft: number;
  numBaysRight: number;
  trussCount: number;
  topPurlinSpacing: number;
  frontOverhang: number;
  rearOverhang: number;
  leftSideOverhang: number;
  rightSideOverhang: number;
  roofType: 'flat' | 'gable' | 'arched'; 
  roofMaterial: 'polycarbonate' | 'metal' | 'tile';
  roofColor: string;
  roofOpacity: number;
  roofThickness: number;
  archHeight?: number;
}

// Остальные интерфейсы без изменений
export interface FoundationParams {
    showFoundation: boolean;
    slabThickness: number;
    slabExtension: number;
    rebarThickness: number;
    rebarRows: number;
    rebarSpacing: number;
    gravelThickness: number;
    smallGravelThickness: number;
    sandThickness: number;
    showEnvironment?: boolean;
}

export interface WeldingParams {
    weldType: number;
    weldCost: number;
    showWelds: boolean;
}

export interface MaterialPrices {
    profileTubes: Record<string, number>;
    rebar: Record<string, number>;
    welding: Record<string, number>;
}