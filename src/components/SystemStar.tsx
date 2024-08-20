
import { Circle } from 'react-konva';
import { IWaypointRender } from '@/types';

interface SystemStarProps {
  x: number;
  y: number;
  radius: number;
  color: string;
  isWaypointSelected: boolean;
}

const SystemStar = ({x, y, radius, color, isWaypointSelected}: SystemStarProps) => {
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
      opacity={isWaypointSelected ? 0.3 : 1}
    />
  )
}

export default SystemStar