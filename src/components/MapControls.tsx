import React, { ReactNode } from 'react';

interface MapControlsProps {
  children: ReactNode;
  onSelectMap: Function;
}
const MapControls: React.FC<MapControlsProps> = ({children, onSelectMap: Function}: MapControlsProps) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        fontSize: '24px',
      }}
    >
      { children }
    </div>
  )
}

export default MapControls