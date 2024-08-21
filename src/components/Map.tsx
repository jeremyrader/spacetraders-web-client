'use client';

import React, { ReactNode } from 'react';
import Konva from 'konva';
import { Stage, Layer, Text } from 'react-konva';
import { useState, useRef, useEffect } from 'react';

interface MapProps {
  containerRef: any;
  isLoading: boolean;
  children: ReactNode;
  maxZoom: number;
  onZoom: any;
  onStageClick: Function;
  mapCenter: {
    x: number;
    y: number;
  };
  MapControls: React.ComponentType;
}

const moveAmount = 10;

// document.addEventListener('keydown', (event) => {
//   const stage = stageRef.current;

//   if (stage) {

//     const key = event.key;

//     // Get the current position of the stage
//     const position = stage.position();

//     switch (key) {
//       case 'w': // Move up
//         stage.position({ x: position.x, y: position.y + moveAmount });
//         break;
//       case 'a': // Move left
//         stage.position({ x: position.x + moveAmount, y: position.y });
//         break;
//       case 's': // Move down
//         stage.position({ x: position.x, y: position.y - moveAmount });
//         break;
//       case 'd': // Move right
//         stage.position({ x: position.x - moveAmount, y: position.y });
//         break;
//     }
//   }
// });

const Map: React.FC<MapProps> = ({
  containerRef,
  isLoading,
  children,
  maxZoom,
  onZoom,
  onStageClick,
  mapCenter = { x: 0, y: 0 },
  MapControls,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const handleWheel = (wheelEvent: Konva.KonvaEventObject<WheelEvent>) => {
    wheelEvent.evt.preventDefault();

    const scaleBy = 1.2; // Zoom factor
    const stage = stageRef.current;

    if (stage) {
      const oldScale = stage.scaleX();

      const scaleFactor = 1 + Math.log(1 + scaleBy) / 10;

      // Determine the new scale factor based on scroll direction
      let newScale = oldScale;
      if (wheelEvent.evt.deltaY < 0) {
        // Zoom in (scrolling up)
        newScale = oldScale * scaleFactor;
      } else if (wheelEvent.evt.deltaY > 0) {
        // Zoom out (scrolling down)
        newScale = oldScale / scaleFactor;
      }

      newScale = Math.min(newScale, maxZoom);

      // Center of the screen in stage coordinates
      const center = {
        x: stageSize.width / 2,
        y: stageSize.height / 2,
      };

      // Center point in stage coordinates considering the current scale
      const centerPointTo = {
        x: (center.x - stage.x()) / oldScale,
        y: (center.y - stage.y()) / oldScale,
      };

      // Calculate the new position to maintain the center point
      const newPos = {
        x: center.x - centerPointTo.x * newScale,
        y: center.y - centerPointTo.y * newScale,
      };

      onZoom(newScale);

      // Apply the new scale and position
      stage.scale({ x: newScale, y: newScale });
      stage.position(newPos);

      stage.batchDraw();
    }
  };

  useEffect(() => {
    const stage = stageRef.current;

    if (stage) {
      stage.scale({ x: maxZoom, y: maxZoom });
      const scale = stage.scale();

      if (scale) {
        stage.position({
          x: stageSize.width / 2 - mapCenter.x * scale.x,
          y: stageSize.height / 2 + mapCenter.y * scale.y,
        });

        stage.batchDraw();
      }
    }
  }, [stageSize, mapCenter]);

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
  }, [containerRef]);

  return (
    <div className="relative">
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={850}
        style={{ backgroundColor: 'black' }}
        onWheel={handleWheel}
        onClick={(event) => {
          onStageClick(event);
        }}
        draggable
      >
        {isLoading ? (
          <Layer>
            <Text
              text="Loading map..."
              fontSize={15}
              offsetX={50}
              fill="white"
            />
          </Layer>
        ) : (
          children
        )}
      </Stage>
      {/* Fixed text */}
      {!isLoading ? <MapControls /> : null}
    </div>
  );
};

export default Map;
