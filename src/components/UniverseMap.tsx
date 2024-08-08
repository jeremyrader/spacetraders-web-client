"use client";

import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import Konva from 'konva';

function UniverseMap() {

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === containerRef.current) {
          const { width, height } = entry.contentRect;
          setStageSize({ width, height });
        }
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const originX = stageSize.width / 2;
  const originY = stageSize.height / 2;

  // Points to plot (example points)
  const points = [
    { x: 50, y: 50 },
    { x: -50, y: -50 },
    { x: 100, y: -100 },
    { x: -100, y: 100 },
  ];

  return <div ref={containerRef}>
    <Stage width={window.innerWidth} height={window.innerHeight} style={{ backgroundColor: 'white' }} ref={stageRef}>
      <Layer>
        {/* X-axis */}
        <Line
          points={[0, originY, stageSize.width, originY]}
          stroke="black"
          strokeWidth={2}
        />
        {/* Y-axis */}
        <Line
          points={[originX, 0, originX, stageSize.height]}
          stroke="black"
          strokeWidth={2}
        />
        {/* Plot points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            x={originX + point.x}
            y={originY - point.y}
            radius={5}
            fill="red"
          />
        ))}
        {/* Point labels */}
        {points.map((point, index) => (
          <Text
            key={index}
            x={originX + point.x + 5}
            y={originY - point.y + 5}
            text={`(${point.x}, ${point.y})`}
            fontSize={15}
          />
        ))}
      </Layer>
    </Stage>
  </div>;
}

export default UniverseMap;
