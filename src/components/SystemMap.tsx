"use client";

import { Layer } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import React from 'react';

import Map from './Map'
import Waypoint from '@/components/Waypoint'
import Orbit from '@/components/Orbit'
import SystemStar from '@/components/SystemStar'

import { fetchResource } from '../utils/v2'

interface SystemMapProps {
  system: any;
  onSelectMap: Function;
}

function SystemMap({system, onSelectMap}: SystemMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState(1);

  const handleSelectBack = () => {
    onSelectMap('universe')
  };

  useEffect(() => {

    async function fetchWaypoints() {
      const result = await fetchResource(`systems/${system.symbol}/waypoints`)
      console.log(result.data)
    }

    fetchWaypoints()

  }, []);

  let { color } = system

  const orbitals = system.waypoints.filter((waypoint: Waypoint) => {
    return waypoint.orbitals
  }).reduce((acc: Orbital[], waypoint: Waypoint) => {
    return acc.concat(waypoint.orbitals);
  }, []);

  const nonOrbitalWaypoints = system.waypoints.filter((waypoint: Waypoint) => {
    return !orbitals.find((orbital: Orbital) => orbital.symbol == waypoint.symbol)
  })

  return <div ref={containerRef} className='border-4 border-white'>
    <button onClick={handleSelectBack} className="btn btn-primary">Back to System Map</button>
    <Map
      containerRef={containerRef}
      maxZoom={1.5}
      onZoom={(zoomLevel: number) => setZoomLevel(zoomLevel)}
    >
      {/* Orbits Layer */}
      <Layer>
        {
          nonOrbitalWaypoints.map((nonOrbitalWaypoint: Waypoint, index: number) => {

            let { x, y, type } = nonOrbitalWaypoint

            let drawOrbit = false

            if (['PLANET', 'GAS_GIANT', 'JUMP_GATE'].includes(type)) {
              drawOrbit = true
            }

            const distanceFromOrigin = Math.sqrt(x ** 2 + y ** 2);

            return drawOrbit ? (
              <React.Fragment key={index}>
                { nonOrbitalWaypoint.orbitals.map((orbital: Orbital, index: number) => (
                    <Orbit 
                      key={'orbital-' + index}
                      x={x}
                      y={y}
                      radius={6}
                    />
                  ))
                }
                <Orbit 
                  key={'waypoint-' + index}
                  x={0}
                  y={0}
                  radius={distanceFromOrigin}
                />
                </React.Fragment>
            ) : null
          })
        }
      </Layer>

      {/* Waypoints Layer */}
      <Layer>
        {/* System Star */}
        <SystemStar
          x={0}
          y={0}
          radius={800}
          color={color}
        />
        {/* System Waypoints*/}
        {
          nonOrbitalWaypoints.map((waypoint: Waypoint, index: number) => {
            return <Waypoint key={index} waypoint={waypoint} zoomLevel={zoomLevel} />
          })
        }
      </Layer>
    </Map>
  </div>
}

export default SystemMap;