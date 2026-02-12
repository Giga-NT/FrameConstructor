import React, { memo } from 'react';

interface TabProps {
    name: string;
    isActive?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

const Tab: React.FC<TabProps> = memo(({ children }) => {
    return <>{children}</>;
});

export default Tab;