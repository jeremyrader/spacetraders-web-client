'use client'

import { Layer, Circle } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import React from 'react';

import Map from './Map'
import MapControls from './MapControls';
import Waypoint from '@/components/Waypoint'
import Orbit from '@/components/Orbit'
import SystemStar from '@/components/SystemStar'

import { getObject, saveData } from '../utils/indexeddb';

import { fetchResourcePaginated } from '../utils/v2'

interface SystemMapProps {
  system: any;
  onSelectMap: Function;
}

function SystemMap({system, onSelectMap}: SystemMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null);
  const [traits, setTraits] = useState<Trait[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const fetchWaypoints = async(manual: boolean = false) => {

    setIsLoading(true)
    // check the db for the first waypoint in the list
    // this avoids fetching waypoints every time the system is loaded
    // I'd like to find a better way to do this in case the system was only
    // partially loaded before
    const firstWaypoint = await getObject('waypointStore', system.waypoints[0].symbol)

    if (!firstWaypoint || manual) {
      const symbolParts = system.symbol.split('-')
      const results = await fetchResourcePaginated(`systems/${symbolParts[0]}-${symbolParts[1]}/waypoints`)
      saveData('waypointStore', results)
    }
    setIsLoading(false)
  }

  const SystemMapControls = () => {
    return (
      <MapControls onSelectMap={onSelectMap}>
        <button onClick={handleSelectBack} className="btn btn-primary mr-2">Back to Galaxy Map</button>
        <button onClick={() => {fetchWaypoints(true) }} className="btn btn-primary">Rescan System</button>
        {
          isLoading ? (
            <>
              <span>Loading waypoints...</span>
              <span className="loading loading-spinner loading-md"></span>
            </>
          ): null
        }
        {
          selectedWaypoint ? (
            <>
              <p>Symbol: {selectedWaypoint.symbol}</p>
              <p>Type: {selectedWaypoint.type}</p>
            </>
          ) : null
        }
        {
          traits.map((trait: Trait, index: number) => {
            return (
              <p key={index}>{trait.name}</p>
            )
          })
        }
      </MapControls>
    )
  }

  const handleSelectBack = () => {
    onSelectMap('universe')
  };

  const handleWaypointClick = async (waypoint: Waypoint) => {
    setSelectedWaypoint(waypoint)

    const waypointData = await getObject('waypointStore', waypoint.symbol)
    setTraits(waypointData.traits)
  }

  useEffect(() => {
    fetchWaypoints()
  }, [system]);

  let { color } = system

  const orbitals = system.waypoints.filter((waypoint: Waypoint) => {
    return waypoint.orbitals
  }).reduce((acc: Orbital[], waypoint: Waypoint) => {
    return acc.concat(waypoint.orbitals);
  }, []);

  const nonOrbitalWaypoints = 
    system.waypoints
      .filter((systemWaypoint: Waypoint) => {
        return !orbitals.find((orbital: Orbital) => orbital.symbol == systemWaypoint.symbol)
      })

  return <div ref={containerRef} className='border-4 border-white'>
    <Map
      containerRef={containerRef}
      maxZoom={1.5}
      onZoom={(zoomLevel: number) => setZoomLevel(zoomLevel)}
      mapCenter={{x: 0, y: 0}}
      MapControls={SystemMapControls}
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
          color={"white"} // hard code for now. TODO: pull in color from systm
        />
        {/* System Waypoints*/}
        {
          nonOrbitalWaypoints.map((systemWaypoint: Waypoint, index: number) => {

            let orbitalWaypoints = systemWaypoint.orbitals.map(orbital => {
              return system.waypoints.find((waypoint: Waypoint) => waypoint.symbol == orbital.symbol)
            })

            return <Waypoint
              key={index}
              waypoint={systemWaypoint}
              orbitalWaypoints={orbitalWaypoints}
              zoomLevel={zoomLevel}
              onWaypointClick={handleWaypointClick}
            />
          })
        }
        {/* Outline */}
        {
          selectedWaypoint && (
            <Circle
              x={selectedWaypoint.x}
              y={-selectedWaypoint.y}
              radius={10}
              stroke="white"
              strokeWidth={2}
              opacity={0.5}
            />
        )}
      </Layer>
    </Map>
  </div>
}

export default SystemMap;