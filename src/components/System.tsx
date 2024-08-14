'use client'

import { Circle, Rect, Text, Group } from 'react-konva';
import { useState, Fragment } from 'react';

interface SystemProps {
  system: System;
  zoomLevel: number;
  onSystemClick: Function;
}

const System = ({system, zoomLevel, onSystemClick}: SystemProps) => {

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
        onClick={() => onSystemClick(system)}
      />
    </Fragment>
  )
}

export default System