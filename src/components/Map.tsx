'use client';

import React, { ReactNode } from 'react';
import Konva from 'konva';
import { Stage, Layer, Text, Group, Circle } from 'react-konva';
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

const generateStars = (count: number) => {
  const stars = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 2000 - 1000; // Random x between -1000 and 1000
    const y = Math.random() * 2000 - 1000; // Random y between -1000 and 1000
    stars.push({ x, y });
  }
  return stars;
};

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
  const layerRef = useRef<Konva.Layer>(null);

  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const handleWheel = (wheelEvent: Konva.KonvaEventObject<WheelEvent>) => {
    wheelEvent.evt.preventDefault();

    const scaleBy = 1.1; // Zoom factor
    const stage = stageRef.current;

    if (stage) {
      const oldScale = stage.scaleX();

      // Determine the new scale factor based on scroll direction
      let newScale = oldScale;
      if (wheelEvent.evt.deltaY < 0) {
        // Zoom in (scrolling up)
        newScale = oldScale * scaleBy;
      } else if (wheelEvent.evt.deltaY > 0) {
        // Zoom out (scrolling down)
        newScale = oldScale / scaleBy;
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

  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.cache();
      layerRef.current.clearBeforeDraw(false);
      layerRef.current.getLayer().batchDraw();
    }
  }, []);

  useEffect(() => {
    const stars = generateStars(10000); // Adjust the number of stars as needed
    const layer = new Konva.Layer();

    stars.forEach((star) => {
      const konvaCircle = new Konva.Circle({
        x: star.x,
        y: star.y,
        radius: 1,
        shadowBlur: 10,
        shadowColor: 'white',
        shadowOpacity: 1,
        opacity: 0.15,
        fillRadialGradientStartPoint: { x: 0, y: 0 },
        fillRadialGradientStartRadius: 0,
        fillRadialGradientEndPoint: { x: 0, y: 0 },
        fillRadialGradientEndRadius: 1,
        fillRadialGradientColorStops: [0.2, 'white', 0.6, 'blue', 0.8, 'black'],
      });
      layer.add(konvaCircle);
      layer.moveToBottom();
    });

    if (stageRef) {
      const stage = stageRef.current?.getStage();
      if (stage) {
        stage.add(layer);
      }
    }
  }, []);

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
        {children}
      </Stage>
      {/* Fixed text */}
      {!isLoading ? <MapControls /> : null}
    </div>
  );
};

export default Map;
