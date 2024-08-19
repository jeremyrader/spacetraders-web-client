'use client'

import { Circle } from 'react-konva';
import { Fragment } from 'react';

import { ISystemRender } from '@/types'

interface SystemProps {
  system: ISystemRender;
  zoomLevel: number;
  onSystemClick: Function;
}

const System = ({system, zoomLevel, onSystemClick}: SystemProps) => {
  const { color, radius } = system.renderData
  const { x, y } = system

  function calculateColorFill(zoomLevel: number) {
    if (zoomLevel >= 1) {
      return .5
    }

    if (zoomLevel <= .03) {
      return .3
    }

    return .5
  }

  return (
    <Fragment>
      {/* System star */}
      <Circle
        x={x}
        y={-y}  // down on HTML canvas is positive
        radius={radius}
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={radius}
        fillRadialGradientColorStops={[.3, 'white', calculateColorFill(zoomLevel), color, 1, 'rgba(0, 0, 255, 0)']}
        onClick={() => onSystemClick(system)}
      />
    </Fragment>
  )
}

export default System