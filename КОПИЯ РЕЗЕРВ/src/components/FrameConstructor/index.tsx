// index.tsx
import React, { useState } from 'react';
import { Tabs, TabPanel } from '../UI/Tabs';
import FrameControls from './FrameControls';
import FoundationControls from './FoundationControls';
import WeldingControls from './WeldingControls';
import { FrameParams, FoundationParams, WeldingParams } from '../../types/types';
import FlatRoofModel from './FlatRoofModel';
import ArchedRoofModel from './ArchedRoofModel';
import GableRoofModel from './GableRoofModel';

const FrameConstructor: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'frame' | 'foundation' | 'welding'>('frame');
    const [roofType, setRoofType] = useState<'flat' | 'gable' | 'arched'>('flat');


	const [frameParams, setFrameParams] = useState<FrameParams>({
		length: 14,
		width: 10,
		height: 5,
		numColumns: 5,
		columnSection: 0.1,
		trussSection: 0.08,
		purlinSection: 0.04,
		trussHeightLeft: 1.2,
		trussHeightRight: 0.5,
		bayLengthLeft: 3,
		bayLengthRight: 1.5,
		numBaysLeft: 3,
		numBaysRight: 3,
		trussCount: 5,
		topPurlinSpacing: 1.0,
		frontOverhang: 0.4,
		rearOverhang: 0.2,
		leftSideOverhang: 0.3,
		rightSideOverhang: 0.3,
		roofType: 'flat',
		roofMaterial: 'polycarbonate',
		roofColor: '#72c5e0',
		roofOpacity: 0.5,
		roofThickness: 0.008,
		archHeight: 1.5
	});

    const [foundationParams, setFoundationParams] = useState<FoundationParams>({
        showFoundation: true,
        showEnvironment: true,
        slabThickness: 0.3,
        slabExtension: 0.5,
        rebarThickness: 12,
        rebarRows: 2,
        rebarSpacing: 0.2,
        gravelThickness: 0.4,
        smallGravelThickness: 0.2,
        sandThickness: 0.1
    });

    const [weldingParams, setWeldingParams] = useState<WeldingParams>({
        weldType: 2,
        weldCost: 25,
        showWelds: true
    });

    const handleTabChange = (tab: string) => {
        setActiveTab(tab as 'frame' | 'foundation' | 'welding');
    };

	const renderModelViewer = () => {
		switch(frameParams.roofType) {
			case 'flat':
				return <FlatRoofModel 
					frameParams={frameParams} 
					foundationParams={foundationParams} 
					weldingParams={weldingParams} 
				/>;
			case 'gable':
				return <GableRoofModel 
					frameParams={frameParams} 
					foundationParams={foundationParams} 
					weldingParams={weldingParams} 
				/>;
			case 'arched':
			  return <ArchedRoofModel 
				frameParams={{...frameParams, roofType: 'arched'}} // Явно указываем тип 'arched'
				foundationParams={foundationParams} 
				weldingParams={weldingParams} 
			  />;
			default:
				return <FlatRoofModel 
					frameParams={frameParams} 
					foundationParams={foundationParams} 
					weldingParams={weldingParams} 
				/>;
		}
	};

	const handleRoofTypeChange = (type: 'flat' | 'gable' | 'arched') => {
		setFrameParams(prev => ({
			...prev,
			roofType: type
		}));
	};

    return (
        <div className="frame-constructor">
            <div className="controls-panel">
                <div className="header">
                    "GigaNT" - Конструктор навесов 
                </div>

                <div className="roof-type-selector">
                    <button 
                        className={frameParams.roofType === 'flat' ? 'active' : ''} 
                        onClick={() => handleRoofTypeChange('flat')}
                    >
                        Односкатная
                    </button>
                    <button 
                        className={frameParams.roofType === 'gable' ? 'active' : ''} 
                        onClick={() => handleRoofTypeChange('gable')}
                    >
                        Двускатная
                    </button>
                    <button 
                        className={frameParams.roofType === 'arched' ? 'active' : ''} 
                        onClick={() => handleRoofTypeChange('arched')}
                    >
                        Арочная
                    </button>

                </div>

                <Tabs activeTab={activeTab} onChange={handleTabChange}>
                    <Tabs.Tab name="frame">Каркас</Tabs.Tab>
                    <Tabs.Tab name="foundation">Фундамент</Tabs.Tab>
                    <Tabs.Tab name="welding">Сварка</Tabs.Tab>
                </Tabs>

                <TabPanel name="frame" activeTab={activeTab}>
                    <FrameControls params={frameParams} onChange={setFrameParams} />
                </TabPanel>

                <TabPanel name="foundation" activeTab={activeTab}>
                    <FoundationControls params={foundationParams} onChange={setFoundationParams} />
                </TabPanel>

                <TabPanel name="welding" activeTab={activeTab}>
                    <WeldingControls params={weldingParams} onChange={setWeldingParams} />
                </TabPanel>
            </div>

            <div className="model-viewer">
                {renderModelViewer()}
            </div>
        </div>
    );
};

export default React.memo(FrameConstructor);
