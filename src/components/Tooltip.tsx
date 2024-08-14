'use client'

import { Group, Rect, Text } from 'react-konva';

interface TooltipProps {
  x: number;
  y: number;
  text: string;
}

const Tooltip = ({x, y, text}: TooltipProps) => {
  return (
    <Group x={x} y={y}>
      <Rect
        width={150}
        height={100}
        fill="lightblue"
        cornerRadius={5}
        shadowBlur={5}
      />
      <Text
        text={text}
        fontSize={14}
        x={5} // Padding inside the box
        y={5}
        width={150}
        height={100}
        fill="black"
      />
    </Group>
  )
}

export default Tooltip