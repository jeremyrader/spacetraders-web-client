'use client'

import { Circle } from 'react-konva';
import { useState, useEffect, Fragment } from 'react';
import { getObject } from '../utils/indexeddb';

import { IWaypoint, ITrait } from '@/types'

interface WaypointProps {
  waypoint: IWaypoint;
  systemWaypoints: IWaypoint[]
  selectedTrait: string | null;
  metadatas: any[];
  zoomLevel: number;
  onWaypointClick: Function;
}

const Waypoint = ({waypoint, systemWaypoints, selectedTrait, metadatas, zoomLevel, onWaypointClick}: WaypointProps) => { //orbitalWaypoints
  const {symbol, orbits} = waypoint
  const [waypointRenderData, setWaypointRenderData] = useState<{color: string, radius: number}>({color: 'white', radius: 5})
  const [orbitalRenderData, setOrbitalRenderData] = useState<{x: number, y: number}>({x: 0, y: 0})
  const {color, radius} = waypointRenderData

  useEffect(() => {
    async function getWaypointRenderData() {
      const waypointRenderData = await getObject('waypointRenderStore', symbol)
      if (waypointRenderData) {
        setWaypointRenderData(waypointRenderData)
      }
    }
    getWaypointRenderData()
  }, []);

  useEffect(() => {
    const {symbol, orbits} = waypoint
  
    async function getOrbitalRenderData() {
      const orbitalRenderData = await getObject('orbitalRenderStore', symbol)
      if (orbitalRenderData) {
        setOrbitalRenderData(orbitalRenderData)
      }
    }

    if (orbits) {
      getOrbitalRenderData()
    }
  }, [waypoint]);

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


  const multiplier = getIsHighlighted(metadatas, selectedTrait) ? 3 : 1

  let orbitalWaypoints = 
    systemWaypoints
      .filter((waypoint: IWaypoint) =>  waypoint.orbits)

  return (
    <Fragment>
      {
        orbits ? (
          <Circle
            x={(waypoint.x + orbitalRenderData.x)}
            y={-waypoint.y + orbitalRenderData.y} // down on HTML canvas is positive
            radius={radius * multiplier}
            fill="white"
            onClick={() => { onWaypointClick(waypoint) }}
          />
        ) : (
          <Circle
            x={waypoint.x}
            y={-waypoint.y} // down on HTML canvas is positive
            radius={radius * multiplier}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={radius}
            fillRadialGradientColorStops={[0, '#258dbe', 1, '#25be49']}
            onClick={() => { onWaypointClick(waypoint) }}
          />
        )
      }
      {
        waypoint.orbitals.map((orbital, index) => {

          const orbitalWaypoint = orbitalWaypoints.find((waypoint: IWaypoint) => waypoint.symbol == orbital.symbol)

          return (
            <Waypoint
              key={index}
              waypoint={orbitalWaypoint as IWaypoint}
              systemWaypoints={systemWaypoints}
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