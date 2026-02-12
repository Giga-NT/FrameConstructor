import React, { memo, useCallback } from 'react';

interface TabProps {
    name: string;
    isActive?: boolean;
    onClick?: () => void;
    children: React.ReactNode;
}

export const Tab: React.FC<TabProps> = memo(({ name, isActive, onClick, children }) => {
    const handleClick = useCallback(() => {
        onClick?.();
    }, [onClick]);

    return (
        <button
            className={`tab ${isActive ? 'active' : ''}`}
            onClick={handleClick}
            data-tabname={name}
            aria-selected={isActive}
        >
            {children}
        </button>
    );
});

interface TabPanelProps {
    name: string;
    activeTab: string;
    children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = memo(({ name, activeTab, children }) => {
    return activeTab === name ? <div className="tab-panel" role="tabpanel">{children}</div> : null;
});

interface TabsProps {
    activeTab: string;
    onChange: (tab: string) => void;
    children: React.ReactElement<TabProps>[];
}

const TabsComponent: React.FC<TabsProps> = memo(({ activeTab, onChange, children }) => {
    const handleChange = useCallback((tab: string) => {
        onChange(tab);
    }, [onChange]);

    const enhancedChildren = React.Children.map(children, (child) => {
        if (React.isValidElement<TabProps>(child)) {
            return React.cloneElement(child, {
                isActive: activeTab === child.props.name,
                onClick: () => handleChange(child.props.name)
            });
        }
        return child;
    });

    return (
        <div className="tabs" role="tablist">
            {enhancedChildren}
        </div>
    );
});

export const Tabs = Object.assign(TabsComponent, { Tab, TabPanel });