'use client';

import { Circle } from 'react-konva';

interface NebulaProps {
  x: number;
  y: number;
  radius: number;
  color1: string;
  color2: string;
  zoomLevel: number;
}

const Nebula = ({ x, y, radius, color1, color2, zoomLevel }: NebulaProps) => {
  const calculateOpacity = (scale: number) => {
    if (scale >= 1) return 1;
    if (scale <= 0.02) return 0;
    return (scale - 0.005) / (0.2 - 0.005); // Linear interpolation
  };

  return (
    <Circle
      x={x}
      y={y}
      radius={radius}
      opacity={calculateOpacity(zoomLevel)}
      fillRadialGradientStartPoint={{ x: 0, y: 0 }}
      fillRadialGradientStartRadius={0}
      fillRadialGradientEndPoint={{ x: 0, y: 0 }}
      fillRadialGradientEndRadius={radius}
      fillRadialGradientColorStops={[
        0,
        color1, // Center color
        1,
        color2, // Fade to transparent
      ]}
    />
  );
};

export default Nebula;
