'use client'

import { Circle } from 'react-konva';
import { useState, useEffect, Fragment } from 'react';
import { getObject } from '../utils/indexeddb';

interface WaypointProps {
  waypoint: Waypoint;
  orbitalWaypoints: Waypoint[]
  zoomLevel: number;
  onWaypointClick: Function;
}

const Waypoint = ({waypoint, orbitalWaypoints, zoomLevel, onWaypointClick}: WaypointProps) => {
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

  return (
    <Fragment>
      {
        orbits ? (
          <Circle
            x={waypoint.x + orbitalRenderData.x}
            y={-waypoint.y + orbitalRenderData.y} // down on HTML canvas is positive
            radius={radius}
            fill="white"
            onClick={() => { onWaypointClick(waypoint) }}
          />
        ) : (
          <Circle
            x={waypoint.x}
            y={-waypoint.y} // down on HTML canvas is positive
            radius={radius}
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
        orbitalWaypoints.map((orbital, index) => {
          return (
            <Waypoint
              key={index}
              waypoint={orbital}
              orbitalWaypoints={orbital.orbitals as Waypoint[]}
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