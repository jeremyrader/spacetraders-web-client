'use client'

import { Layer, Circle } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import React from 'react';

import Map from './Map'
import MapControls from './MapControls';
import Waypoint from '@/components/Waypoint'
import Orbit from '@/components/Orbit'
import SystemStar from '@/components/SystemStar'
import ShipyardUI from './ShipyardUI';
import MarketUI from './MarketUI'

import { getObject, getData, saveData } from '../utils/indexeddb';
import { fetchResourcePaginated } from '../utils/v2'
import { Trait } from '../types'

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
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null)
  const [waypointMetadatas, setWaypointMetadatas] = useState<any[]>([])
  const [isShipyardSelected, setIsShipyardSelected] = useState<boolean>(false)
  const [isMarketplaceSelected, setIsMarketplaceSelected] = useState<boolean>(false)

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

  const fetchWaypointMetadata = async () => {
    setIsLoading(true)
  
    const waypointMetadatas = await getData('waypointStore')

    const filteredMetadatas = waypointMetadatas.filter((metadata: any) =>  {
      const metadataParts = metadata.symbol.split('-')
      return `${metadataParts[0]}-${metadataParts[1]}` == system.symbol
    })

    setWaypointMetadatas(filteredMetadatas)

    setIsLoading(false)
  }

  const highlightTrait = (trait: string) => {
    if (selectedTrait == trait) {
      setSelectedTrait(null)
    }
    else {
      setSelectedTrait(trait)
    }
  }

  const handleSelectShipyard = () => {
    setIsShipyardSelected(true)
  }

  const handleSelectMarketplace = () => {
    setIsMarketplaceSelected(true)
  }

  const handleCloseShipyardUI = () => {
    setIsShipyardSelected(false)
  }

  const handleCloseMarketUI = () => {
    setIsMarketplaceSelected(false)
  }

  const SystemMapControls = () => {

    const hasShipyard = traits.find((trait: Trait) => trait.symbol == 'SHIPYARD')
    const hasMarketplace = traits.find((trait: Trait) => trait.symbol == 'MARKETPLACE')

    return (
      <MapControls onSelectMap={onSelectMap}>
        <button onClick={handleSelectBack} className="btn btn-primary mr-2">Back to Galaxy Map</button>
        <button onClick={() => {fetchWaypoints(true) }} className="btn btn-primary">Rescan System</button>
        <div className="flex">
          <button onClick={() => {highlightTrait('MARKETPLACE')}} className="btn btn-primary mr-2">Marketplaces</button>
          <button onClick={() => {highlightTrait('SHIPYARD')}} className="btn btn-primary">Shipyards</button>
        </div>
        {
          isLoading ? (
            <>
              <span>Loading waypoints...</span>
              <span className="loading loading-spinner loading-md"></span>
            </>
          ): null
        }
        {
          isMarketplaceSelected && hasMarketplace ? (
            <MarketUI systemSymbol={system.symbol} waypointSymbol={selectedWaypoint?.symbol}/>
          ) : null
        }
        {
          isShipyardSelected && hasShipyard ? (
            <ShipyardUI systemSymbol={system.symbol} waypointSymbol={selectedWaypoint?.symbol}/>
          ) : null
        }
        { isShipyardSelected && hasShipyard ? (
            <button className="btn" onClick={handleCloseShipyardUI}>Close Shipyard UI</button>
          ) : null
        }

        { isMarketplaceSelected && hasMarketplace ? (
            <button className="btn" onClick={handleCloseMarketUI}>Close Market UI</button>
          ) : null
        }
        {
          selectedWaypoint && !isShipyardSelected && !isMarketplaceSelected ? (
            <>
              <>
                <p>Symbol: {selectedWaypoint.symbol}</p>
                <p>Type: {selectedWaypoint.type}</p>
              </>
              {
                traits.map((trait: Trait, index: number) => {
                  if (trait.symbol === 'SHIPYARD') {
                    return (
                      <button key={index} onClick={handleSelectShipyard}>Shipyard</button>
                    )
                  }
                  else if (trait.symbol === 'MARKETPLACE') {
                    return (
                      <button key={index} onClick={handleSelectMarketplace}>Marketplace</button>
                    )
                  }
                  else {
                    return (
                      <p key={index}>{trait.name}</p>
                    )
                  }
                })
              }
            </>
          ) : null
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

  useEffect(() => {
    fetchWaypointMetadata()
  }, [system]);

  let { color } = system

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
          system.waypoints.map((waypoint: Waypoint, index: number) => {

            let { x, y, type } = waypoint

            let drawOrbit = false

            if (['PLANET', 'GAS_GIANT', 'JUMP_GATE'].includes(type)) {
              drawOrbit = true
            }

            const distanceFromOrigin = Math.sqrt(x ** 2 + y ** 2);

            return drawOrbit ? (
              <React.Fragment key={index}>
                { waypoint.orbitals.map((orbital: Orbital, index: number) => (
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
          color={"white"} // hard code for now. TODO: pull in color from system
        />
        {/* System Waypoints*/}
        {
          system.waypoints
            .filter((waypoint: Waypoint) => !waypoint.orbits )
            .map((waypoint: Waypoint, index: number) => {
              return <Waypoint
                key={index}
                waypoint={waypoint}
                systemWaypoints={system.waypoints}
                selectedTrait={selectedTrait}
                metadatas={waypointMetadatas}
                onWaypointClick={handleWaypointClick}
                zoomLevel={zoomLevel}
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