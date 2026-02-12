import React, { memo } from 'react';

interface TabPanelProps {
    name: string;
    activeTab: string;
    children: React.ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = memo(({ name, activeTab, children }) => {
    return name === activeTab ? <div className="tab-content">{children}</div> : null;
});

export default TabPanel;