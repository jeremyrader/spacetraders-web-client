'use client'

import { Circle, Rect, Text, Group } from 'react-konva';
import { useState, Fragment } from 'react';

import Tooltip from './Tooltip';

interface SystemProps {
  system: System;
  zoomLevel: number;
  onSystemClick: Function;
}

const System = ({system, zoomLevel, onSystemClick}: SystemProps) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: ''
  });

  function calculateColorFill(zoomLevel: number) {
    if (zoomLevel >= 1) {
      return .5
    }

    if (zoomLevel <= .03) {
      return .3
    }

    return .5
  }

  const { x, y, size, color, symbol, type, waypoints } = system

  return (
    <Fragment>
      {/* System star */}
      <Circle
        x={x}
        y={-y}  // down on HTML canvas is positive
        radius={size}
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={system.size}
        fillRadialGradientColorStops={[.3, 'white', calculateColorFill(zoomLevel), color, 1, 'rgba(0, 0, 255, 0)']}
        onMouseEnter={(event) => {
          const stage = event.target.getStage();
          if (stage) {
              const pointerPosition = stage.getPointerPosition();
              if (pointerPosition) {
              setTooltip({
                  visible: true,
                  x: x + (20 / zoomLevel),
                  y: -y + (20 / zoomLevel),
                  text: `Name: ${symbol}\nWaypoints: ${waypoints.length}\nType: ${type}`,
              });
              }
          }
        }}
        onMouseLeave={() => {
          setTooltip({
              ...tooltip,
              visible: false,
          });
        }}
        onClick={() => onSystemClick(system)}
      />
      {/* Tooltip */}
      {
        tooltip.visible && (
          <Tooltip
            x={tooltip.x}
            y={tooltip.y}
            text={tooltip.text}
          />
        )
      }
    </Fragment>
  )
}

export default System