'use client';

import { Circle } from 'react-konva';
import { Fragment } from 'react';

import SystemMetadata from '@/components/SystemMetadata';
import { ISystemRender } from '@/types';

interface SystemProps {
  system: ISystemRender;
  zoomLevel: number;
  onSystemClick: Function;
  isSelected: boolean;
  selectedSystem: ISystemRender | null;
}

const System = ({
  system,
  zoomLevel,
  onSystemClick,
  isSelected,
  selectedSystem,
}: SystemProps) => {
  const { color, radius } = system.renderData;
  const { x, y } = system;

  function calculateColorFill(zoomLevel: number) {
    if (zoomLevel >= 1) {
      return 0.5;
    }

    if (zoomLevel <= 0.03) {
      return 0.3;
    }

    return 0.5;
  }

  return (
    <Fragment>
      {/* System star */}
      <Circle
        system
        x={x}
        y={-y} // down on HTML canvas is positive
        radius={radius}
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={radius}
        fillRadialGradientColorStops={[
          0.3,
          'white',
          calculateColorFill(zoomLevel),
          color,
          1,
          'rgba(0, 0, 255, 0)',
        ]}
        opacity={!selectedSystem || isSelected ? 1 : 0.2}
        onClick={() => onSystemClick(system)}
      />
      {isSelected ? (
        <SystemMetadata x={x} y={y} system={system} isSelected={isSelected} />
      ) : null}
    </Fragment>
  );
};

export default System;
