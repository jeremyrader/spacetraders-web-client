'use client'

import { Layer, Circle, Line, Group } from 'react-konva';
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
import Ship from './FleetLayer'

import { getObject, getData, saveData } from '../utils/indexeddb';
import { fetchResourcePaginated } from '../utils/v2'
import { ISystemRender, IWaypointRender, IShipRender, ITrait, IRoute, IWaypointLocation } from '../types'

interface SystemMapProps {
  system: ISystemRender;
  onSelectMap: Function;
}

const maxZoom = 3

function SystemMap({system, onSelectMap}: SystemMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const waypointLayerRef = useRef<Konva.Layer>(null);

  const [zoomLevel, setZoomLevel] = useState(maxZoom);
  const [selectedWaypoint, setSelectedWaypoint] = useState<IWaypointRender | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null)
  const [isShipyardSelected, setIsShipyardSelected] = useState<boolean>(false)
  const [isMarketplaceSelected, setIsMarketplaceSelected] = useState<boolean>(false)
  const [mapCenter, setMapCenter] = useState<{x: number, y: number}>({x: 0, y: 0})
  const [ships, setShips] = useState<IShipRender[]>([])

  const fetchWaypoints = async(manual: boolean = false) => {
    setIsLoading(true)
    // check the db for the first waypoint in the list
    // this avoids fetching waypoints every time the system is loaded
    // I'd like to find a better way to do this in case the system was only
    // partially loaded before

    const currentSystem = await getObject('systemsStore', system.symbol)

    if (currentSystem.waypoints.length > 0 && !currentSystem.waypoints[0].traits || manual) {
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

  function getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  const SystemMapControls = () => {
    const hasShipyard = selectedWaypoint && !!selectedWaypoint.traits && !!selectedWaypoint.traits.find((trait: ITrait) => trait.symbol == 'SHIPYARD')
    const hasMarketplace = selectedWaypoint && !!selectedWaypoint?.traits && !!selectedWaypoint.traits.find((trait: ITrait) => trait.symbol == 'MARKETPLACE')

    return (
      <MapControls onSelectMap={onSelectMap}>
        <div className="flex flex-col">
          <button
            onClick={handleSelectBack}
            type="button"
            className="
              px-4 py-2 
              rounded 
              bg-blue-700 
              hover:bg-blue-800
              click:bg-blue-900
              text-lg font-semibold 
              text-white 
              tracking-wide 
              uppercase 
              transition-colors 
              duration-300
              mb-2
            "
          >
            View Universe Map
          </button>
          <button
            onClick={() => {fetchWaypoints(true) }}
            type="button"
            className="
              px-4 py-2 
              rounded 
              bg-blue-700
              hover:bg-blue-800
              click:bg-blue-900
              text-lg font-semibold 
              text-white 
              tracking-wide 
              uppercase 
              transition-colors 
              duration-300
              mb-8
            "
          >
            Re-fetch Waypoints
          </button>
          <button
            onClick={() => {highlightTrait('MARKETPLACE')}}
            type="button"
            className="
              px-4 py-2 
              rounded 
              bg-blue-700
              hover:bg-blue-800
              click:bg-blue-900
              text-lg font-semibold 
              text-white 
              tracking-wide 
              uppercase 
              transition-colors 
              duration-300
              mb-2
            "
          >
            Marketplaces
          </button>
          <button
            onClick={() => {highlightTrait('SHIPYARD')}}
            type="button"
            className="
              px-4 py-2 
              rounded 
              bg-blue-700
              hover:bg-blue-800
              click:bg-blue-900
              text-lg font-semibold 
              text-white 
              tracking-wide 
              uppercase 
              transition-colors 
              duration-300
            "
          >
            Shipyards
          </button>
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
      </MapControls>
    )
  }

  const handleSelectBack = () => {
    onSelectMap('universe')
  };

  const handleWaypointClick = (newWaypoint: IWaypointRender, waypointRef: React.RefObject<Konva.Circle>) => {
    const x = waypointRef?.current?.x()
    const y = waypointRef?.current?.y()
    const radius = waypointRef?.current?.radius()

    if (x !== undefined && y !== undefined && radius !== undefined) {
      setMapCenter({x: x, y: -y})
    }

    setSelectedWaypoint(newWaypoint)
    
  }

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isWaypoint = !!e.target.attrs.waypoint
    const isWaypointMetadata = e.target.name() == 'waypoint-metadata'
    
    if (!(isWaypoint || isWaypointMetadata)) {
      setSelectedWaypoint(null)
    }

  }

  function getCurrentLocation(route: IRoute): IWaypointLocation {
    const currentTime = new Date().getTime();
    const departureTime = new Date(route.departureTime).getTime();
    const arrivalTime = new Date(route.arrival).getTime();
    const currentTimeMillis = new Date(currentTime).getTime();
  
    if (currentTimeMillis <= departureTime) {
      return route.origin;
    } else if (currentTimeMillis >= arrivalTime) {
      return route.destination;
    } else {
      const progress = (currentTimeMillis - departureTime) / (arrivalTime - departureTime);
      const currentX = route.origin.x + progress * (route.destination.x - route.origin.x);
      const currentY = route.origin.y + progress * (route.destination.y - route.origin.y);
      return { ...route.origin, x: currentX, y: currentY };
    }
  }

  useEffect(() => {
    const getShips = async () => {
      const ships: IShipRender[] = await getData('shipStore')
      const inSystemShips = ships.filter(ship => ship.nav.route.destination.systemSymbol == system.symbol)

      for (const inSystemShip of inSystemShips) {
        const waypoint = await getObject('waypointStore', inSystemShip.nav.route.destination.symbol)
        if (waypoint) {

          inSystemShip.renderData = {
            x: waypoint.renderData.x || waypoint.x,
            y: waypoint.renderData.y || waypoint.y,
            color: 'white'
          }
        }
      }

      setShips(inSystemShips)
    }

    async function loadData() {
      await fetchWaypoints()
      await getShips()
    }

    loadData()
    
  }, [system]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedWaypoint(null)
      }
    };

    // Attach the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <div ref={containerRef}>
    <Map
      containerRef={containerRef}
      isLoading={isLoading}
      maxZoom={maxZoom}
      onZoom={(zoomLevel: number) => setZoomLevel(zoomLevel)}
      onStageClick={handleStageClick}
      mapCenter={mapCenter}
      MapControls={SystemMapControls}
    >
      {/* Orbits Layer */}
      <Layer>
        {
          system.waypoints.map((waypoint: IWaypointRender, index: number) => {
            let { x, y, renderData } = waypoint
            const { drawOrbit } = renderData

            return drawOrbit ? (
              <React.Fragment key={index}>
                {
                  waypoint.orbitals.length > 0 ? (
                    <Orbit 
                      x={x}
                      y={y}
                      radius={getDistance(x, y, waypoint.orbitals[0].renderData.x || 0, waypoint.orbitals[0].renderData.y || 0)}
                      isWaypointSelected={!!selectedWaypoint}
                    />
                  ) : null
                }
                
                <Orbit 
                  key={'waypoint-' + index}
                  x={0}
                  y={0}
                  radius={getDistance(0, 0, x, y)}
                  isWaypointSelected={!!selectedWaypoint}
                />
                </React.Fragment>
            ) : null
          })
        }
      </Layer>
      {/* System Star */}
      <Layer>
        <SystemStar
          x={0}
          y={0}
          radius={800}
          color={system.renderData.color} // hard code for now. TODO: pull in color from system
          isWaypointSelected={!!selectedWaypoint}
        />
      </Layer>
      <Ship ships={ships} isWaypointSelected={!!selectedWaypoint} />
      {/* Waypoints Layer */}
      <Layer ref={waypointLayerRef}>
        {
          system.waypoints
            .filter((waypoint: IWaypointRender) => !waypoint.orbits)
            .sort((a,b) => b.x - a.x)
            .map((waypoint: IWaypointRender, index: number) => {
              return <Waypoint
                key={index}
                waypoint={waypoint}
                selectedTrait={selectedTrait}
                onWaypointClick={handleWaypointClick}
                zoomLevel={zoomLevel}
                selectedWaypoint={selectedWaypoint}
              />
            })
        }
      </Layer>
    </Map>
  </div>
}

export default SystemMap;