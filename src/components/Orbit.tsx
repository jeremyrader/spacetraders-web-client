'use client';

import { Circle } from 'react-konva';

interface OrbitProps {
  x: number;
  y: number;
  radius: number;
  isWaypointSelected: boolean;
}

const Orbit = ({ x, y, radius, isWaypointSelected }: OrbitProps) => {
  return (
    <Circle
      x={x}
      y={-y}
      radius={radius}
      stroke="gray"
      strokeWidth={0.5}
      opacity={isWaypointSelected ? 0.1 : 0.2}
    />
  );
};

export default Orbit;
