
import { Circle } from 'react-konva';

interface OrbitProps {
  x: number;
  y: number;
  radius: number;
  color: string;
}

const Orbit = ({x, y, radius, color}: OrbitProps) => {
  return (
    <Circle
      x={x}
      y={y}
      radius={radius}
      fillRadialGradientStartPoint={{ x: 0, y: 0 }}
      fillRadialGradientStartRadius={0}
      fillRadialGradientEndPoint={{ x: 0, y: 0 }}
      fillRadialGradientEndRadius={radius}
      fillRadialGradientColorStops={[.001, 'white', .01, color, .8, 'rgba(0, 0, 255, 0)']}
    />
  )
}

export default Orbit