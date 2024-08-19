'use client'

import { Circle } from 'react-konva';

interface OrbitProps {
  x: number;
  y: number;
  radius: number
}

const Orbit = ({x, y, radius}: OrbitProps) => {
  return (
    <Circle
      x={x}
      y={-y}
      radius={radius}
      stroke="gray"
      strokeWidth={.5}
      opacity={.4}
    />
  )
}

export default Orbit