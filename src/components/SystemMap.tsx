'use client'

import { Layer, Circle } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import Konva from 'konva';

import Map from './Map'
import MapControls from './MapControls';
import Waypoint from '@/components/Waypoint'
import Orbit from '@/components/Orbit'
import SystemStar from '@/components/SystemStar'
import ShipyardUI from './ShipyardUI';
import MarketUI from './MarketUI'

import { getObject, getData, saveData } from '../utils/indexeddb';
import { fetchResourcePaginated } from '../utils/v2'
import { ISystemRender, IWaypoint, IWaypointRender, IShip, IShipRender, ITrait } from '../types'

interface SystemMapProps {
  system: ISystemRender;
  onSelectMap: Function;
}

function SystemMap({system, onSelectMap}: SystemMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedWaypoint, setSelectedWaypoint] = useState<IWaypoint | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null)
  const [waypointMetadatas, setWaypointMetadatas] = useState<any[]>([])
  const [isShipyardSelected, setIsShipyardSelected] = useState<boolean>(false)
  const [isMarketplaceSelected, setIsMarketplaceSelected] = useState<boolean>(false)
  const [selectedWaypointOutline, setSelectedWaypointOutline] = useState<{x: number, y: number, radius: number} | null>(null)
  const [mapCenter, setMapCenter] = useState<{x: number, y: number}>({x: 0, y: 0})
  const [ships, setShips] = useState<IShipRender[]>([])

  const fetchWaypoints = async(manual: boolean = false) => {
    setIsLoading(true)
    // check the db for the first waypoint in the list
    // this avoids fetching waypoints every time the system is loaded
    // I'd like to find a better way to do this in case the system was only
    // partially loaded before

    const currentSystem = await getObject('systemsStore', system.symbol)
    const firstWaypoint = currentSystem.waypoints[0]
    if (!firstWaypoint.traits || manual) {
      const symbolParts = system.symbol.split('-')
      const results = await fetchResourcePaginated(`systems/${symbolParts[0]}-${symbolParts[1]}/waypoints`)

      type accType = Record<string, typeof results[string]>

      const waypointsIndexedBySymbol = results.reduce((acc: accType, result: IWaypointRender) => {
        acc[result.symbol] = result;
        return acc;
      }, {} as accType);

      function updateTraits(waypoint: IWaypointRender, getTraits: (symbol: string) => ITrait[]): IWaypointRender {
        waypoint.traits = getTraits(waypoint.symbol);
        waypoint.orbitals = waypoint.orbitals.map(orbital => updateTraits(orbital, getTraits));
      
        saveData('waypointStore', [waypoint])

        return waypoint;
      }

      const getTraits = (symbol: string) => {
        return waypointsIndexedBySymbol[symbol].traits
      };
      
      for (let waypoint of currentSystem.waypoints) {
        waypoint = updateTraits(waypoint, getTraits);
      }

      saveData('systemsStore', [currentSystem])

    }
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

    const hasShipyard = selectedWaypoint?.traits.find((trait: ITrait) => trait.symbol == 'SHIPYARD')
    const hasMarketplace = selectedWaypoint?.traits.find((trait: ITrait) => trait.symbol == 'MARKETPLACE')

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
          selectedWaypoint && isMarketplaceSelected && hasMarketplace ? (
            <MarketUI systemSymbol={system.symbol} waypointSymbol={selectedWaypoint.symbol}/>
          ) : null
        }
        {
          selectedWaypoint && isShipyardSelected && hasShipyard ? (
            <ShipyardUI systemSymbol={system.symbol} waypointSymbol={selectedWaypoint.symbol}/>
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
                selectedWaypoint.traits.map((trait: ITrait, index: number) => {
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

  const handleWaypointClick = async (waypoint: IWaypointRender, waypointRef: React.RefObject<Konva.Circle>) => {

    const x = waypointRef?.current?.x()
    const y = waypointRef?.current?.y()
    const radius = waypointRef?.current?.radius()

    if (x !== undefined && y !== undefined && radius !== undefined) {
      setSelectedWaypointOutline({x: x, y: y, radius: radius})
      setMapCenter({x: x, y: -y})
    }

    setSelectedWaypoint(waypoint)
  }

  useEffect(() => {
    fetchWaypoints()
  }, [system]);

  useEffect(() => {
    const getShips = async () => {
      const ships: IShipRender[] = await getData('shipStore')
      const inSystemShips = ships.filter(ship => ship.nav.route.destination.systemSymbol == system.symbol)

      for (const inSystemShip of inSystemShips) {
        const waypoint = await getObject('waypointStore', inSystemShip.nav.route.destination.symbol)
        if (waypoint) {

          inSystemShip.renderData = {
            x: waypoint.renderData.x || waypoint.x,
            y: waypoint.renderData.y || waypoint.y
          }
        }
        
      }

      setShips(inSystemShips)
    }

    getShips()
  }, [system]);

  return <div ref={containerRef} className='border-4 border-white'>
    <Map
      containerRef={containerRef}
      isLoading={isLoading}
      maxZoom={2.5}
      onZoom={(zoomLevel: number) => setZoomLevel(zoomLevel)}
      mapCenter={mapCenter}
      MapControls={SystemMapControls}
    >
      {/* Orbits Layer */}
      <Layer>
        {
          system.waypoints.map((waypoint: IWaypoint, index: number) => {

            let { x, y, type } = waypoint

            let drawOrbit = false

            if (['PLANET', 'GAS_GIANT', 'JUMP_GATE'].includes(type)) {
              drawOrbit = true
            }

            const distanceFromOrigin = Math.sqrt(x ** 2 + y ** 2);

            return drawOrbit ? (
              <React.Fragment key={index}>
                { waypoint.orbitals.map((_, index: number) => (
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
      <Layer>
        {/* System Star */}
        <SystemStar
          x={0}
          y={0}
          radius={800}
          color={"white"} // hard code for now. TODO: pull in color from system
        />
      </Layer>
      <Layer>
        {/* Selected waypoint outline */}
        {
          !!(selectedWaypoint && selectedWaypointOutline) && (
            <Circle
              x={selectedWaypointOutline.x}
              y={selectedWaypointOutline.y}
              radius={selectedWaypointOutline.radius + 2}
              stroke={selectedWaypoint.type.includes('ASTEROID') ? 'white' : 'black'}
              strokeWidth={1}
              opacity={0.7}
            />
        )}
      </Layer>
      {/* Waypoints Layer */}
      <Layer>
        {
          system.waypoints
            .filter((waypoint: IWaypointRender) => !waypoint.orbits )
            .map((waypoint: IWaypointRender, index: number) => {
              return <Waypoint
                key={index}
                waypoint={waypoint}
                selectedTrait={selectedTrait}
                onWaypointClick={handleWaypointClick}
                zoomLevel={zoomLevel}
              />
            })
        }
      </Layer>
      {/* System ships */}
      <Layer>
        {
          ships.map((ship: IShipRender, index: number) => {
            if (ship.renderData) {
              const { x, y } = ship.renderData
              return (
                <Circle
                  key={index}
                  x={x}
                  y={-y}
                  radius={1}
                  stroke="black"
                  strokeWidth={.5}
                  fill="white"
                />
              )
            }
          })
        }
      </Layer>
    </Map>
  </div>
}

export default SystemMap;