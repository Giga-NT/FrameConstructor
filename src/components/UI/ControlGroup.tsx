import React from 'react';

interface ControlGroupProps {
  label: string;
  children: React.ReactNode;
}

const ControlGroup: React.FC<ControlGroupProps> = ({ label, children }) => {
  return (
    <div className="control-group">
      <label>{label}</label>
      <div className="control">{children}</div>
    </div>
  );
};

export default ControlGroup;