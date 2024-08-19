'use client'

import { Circle } from 'react-konva';
import { useRef, Fragment } from 'react';
import Konva from 'konva'

import { IWaypointRender, ITrait } from '@/types'

interface WaypointProps {
  waypoint: IWaypointRender;
  selectedTrait: string | null;
  metadatas: any[];
  zoomLevel: number;
  onWaypointClick: Function;
}

const Waypoint = ({waypoint, selectedTrait, metadatas, zoomLevel, onWaypointClick}: WaypointProps) => {
  const { orbits } = waypoint
  const { x, y, radius } = waypoint.renderData
  const orbitalRef = useRef<Konva.Circle>(null);
  const waypointRef = useRef<Konva.Circle>(null);

  const getIsHighlighted = (metadatas: any[], selectedTrait: string | null) => {
    const waypointMetadata = metadatas.find((metadata) => metadata.symbol == waypoint.symbol)

    let highlighted = false
    if (waypointMetadata) {
      const hasSelectedTrait = waypointMetadata.traits.find((trait: ITrait) => {
        return trait.symbol == selectedTrait
      })
  
      if (hasSelectedTrait) {
        highlighted = true
      }
    }

    return highlighted
  }

  const handleMouseEnter = () => {
    document.body.style.cursor = 'pointer';
  };

  const handleMouseLeave = () => {
    document.body.style.cursor = 'default';
  };

  const multiplier = getIsHighlighted(metadatas, selectedTrait) ? 3 : 1

  return (
    <Fragment>
      {
        (orbits && x && y) ? (
          <Circle
            ref={orbitalRef}
            x={x}
            y={-y} // down on HTML canvas is positive
            radius={radius * multiplier}
            fill="white"
            stroke="black"
            strokeWidth={0.1}
            onClick={() => { onWaypointClick(waypoint, orbitalRef) }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        ) : (
          <Circle
            ref={waypointRef}
            x={waypoint.x}
            y={-waypoint.y} // down on HTML canvas is positive
            radius={radius * multiplier}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={radius}
            fillRadialGradientColorStops={[0, '#258dbe', 1, '#25be49']}
            stroke="black"
            strokeWidth={0.1}
            onClick={() => { onWaypointClick(waypoint, waypointRef) }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )
      }
      {
        waypoint.orbitals.map((orbital, index) => {
          return (
            <Waypoint
              key={index}
              waypoint={orbital}
              selectedTrait={selectedTrait}
              metadatas={metadatas}
              zoomLevel={zoomLevel}
              onWaypointClick={onWaypointClick}
            />
          )
        })
      }
    </Fragment>
  )

}

export default Waypoint