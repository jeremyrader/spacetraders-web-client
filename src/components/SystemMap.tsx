"use client";

import { Layer, Circle } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import React from 'react';

import Map from './Map'
import Waypoint from '@/components/Waypoint'

import fetchResource from '../utils/v2'

function SystemMap({system, onSelectMap}) {
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


  let { type, color, size } = system

  const orbitalWaypoints = system.waypoints.filter(waypoint => {
    return waypoint.orbitals
  }).reduce((acc, waypoint) => {
    return acc.concat(waypoint.orbitals);
  }, []);

  const waypoints = system.waypoints.filter(waypoint => {
    return !orbitalWaypoints.find(orbitalWaypoint => orbitalWaypoint.symbol == waypoint.symbol)
  })

  return <div ref={containerRef} className='border-4 border-white'>
    <button onClick={handleSelectBack} className="btn btn-primary">Back to System Map</button>
    <Map
      containerRef={containerRef}
      maxZoom={1.5}
      onZoom={(zoomLevel: number) => setZoomLevel(zoomLevel)}
    >
      <Layer>
        {
          waypoints.map((waypoint, index) => {

            let drawOrbit = false

            if (['PLANET', 'GAS_GIANT', 'JUMP_GATE'].includes(waypoint.type)) {
              drawOrbit = true
            }

            const distanceFromOrigin = Math.sqrt(waypoint.x ** 2 + waypoint.y ** 2);

            return drawOrbit ? (
              <React.Fragment key={index}>
                { waypoint.orbitals.map((orbital, index) => {
                    <Circle
                      key={'waypoint-orbit-' + index}
                      x={waypoint.x}
                      y={-waypoint.y}
                      radius={5 + 1}
                      stroke="gray" // Circle outline color
                      strokeWidth={1}
                      fill="transparent" // No fill color
                    />
                  })
                }
                <Circle
                  key={'waypoint-orbital-orbit-' + index}
                  x={0}
                  y={0}
                  radius={distanceFromOrigin}
                  stroke="gray" // Circle outline color
                  strokeWidth={1}
                  fill="transparent" // No fill color
                />
                </React.Fragment>
            ) : null
          })
        }
      </Layer>
      <Layer>
      <Circle
        x={0}
        y={0}
        radius={800}
        // fill={fill}
        // opacity={(Math.random() * 0.7 + 0.3) * .5} 
        fillRadialGradientStartPoint={{ x: 0, y: 0 }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndPoint={{ x: 0, y: 0 }}
        fillRadialGradientEndRadius={800}
        fillRadialGradientColorStops={[.001, 'white', .01, color, .8, 'rgba(0, 0, 255, 0)']}
      />
        {
          waypoints.map((waypoint: Waypoint, index: number) => {
            return <Waypoint key={index} waypoint={waypoint} zoomLevel={zoomLevel} />
          })
        }
      </Layer>
    </Map>
  </div>
}

export default SystemMap;