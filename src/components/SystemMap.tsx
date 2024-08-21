'use client';

import { Layer } from 'react-konva';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Konva from 'konva';

import Map from './Map';
import MapControls from './MapControls';
import Waypoint from '@/components/Waypoint';
import Orbit from '@/components/Orbit';
import SystemStar from '@/components/SystemStar';
import FleetLayer from './FleetLayer';
import MapButton from './MapButton';

import { getObject, getData, saveData } from '../utils/indexeddb';
import { fetchResourcePaginated } from '../utils/v2';
import {
  ISystemRender,
  IWaypointRender,
  IShipRender,
  ITrait,
  ISystem,
} from '../types';

interface SystemMapProps {
  system: ISystemRender;
  onSelectMap: Function;
}

const maxZoom = 3;

function SystemMap({ system, onSelectMap }: SystemMapProps) {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const waypointLayerRef = useRef<Konva.Layer>(null);

  const [zoomLevel, setZoomLevel] = useState(maxZoom);
  const [selectedWaypoint, setSelectedWaypoint] =
    useState<IWaypointRender | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTrait, setSelectedTrait] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [ships, setShips] = useState<IShipRender[]>([]);

  const fetchWaypoints = async (manual: boolean = false) => {
    setIsLoading(true);
    // check the db for the first waypoint in the list
    // this avoids fetching waypoints every time the system is loaded
    // I'd like to find a better way to do this in case the system was only
    // partially loaded before

    const currentSystem = await getObject('systemsStore', system.symbol);

    if (
      (currentSystem.waypoints.length > 0 &&
        !currentSystem.waypoints[0].traits) ||
      manual
    ) {
      const symbolParts = system.symbol.split('-');
      const results = await fetchResourcePaginated(
        `systems/${symbolParts[0]}-${symbolParts[1]}/waypoints`,
      );

      type accType = Record<string, (typeof results)[string]>;

      function updateWaypoint(waypoint: IWaypointRender): IWaypointRender {
        const waypointsIndexedBySymbol = results.reduce(
          (acc: accType, result: IWaypointRender) => {
            acc[result.symbol] = result;
            return acc;
          },
          {} as accType,
        );

        waypoint.traits = waypointsIndexedBySymbol[waypoint.symbol].traits;
        waypoint.chart = waypointsIndexedBySymbol[waypoint.symbol].chart;
        waypoint.faction = waypointsIndexedBySymbol[waypoint.symbol].faction;

        waypoint.orbitals = waypoint.orbitals.map((orbital) =>
          updateWaypoint(orbital),
        );

        saveData('waypointStore', [waypoint]);

        return waypoint;
      }

      for (let waypoint of currentSystem.waypoints) {
        waypoint = updateWaypoint(waypoint);
      }

      saveData('systemsStore', [currentSystem]);
    }
    setIsLoading(false);
  };

  const highlightTrait = (trait: string) => {
    if (selectedTrait == trait) {
      setSelectedTrait(null);
    } else {
      setSelectedTrait(trait);
    }
  };

  const handleSelectShipyard = (
    systemSymbol: string,
    waypointSymbol: string,
  ) => {
    router.push(
      `/shipyard?systemSymbol=${systemSymbol}&waypointSymbol=${waypointSymbol}`,
    );
  };

  const handleSelectMarketplace = (
    systemSymbol: string,
    waypointSymbol: string,
  ) => {
    router.push(
      `/marketplace?systemSymbol=${systemSymbol}&waypointSymbol=${waypointSymbol}`,
    );
  };

  function getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  const SystemMapControls = () => {
    const hasShipyard =
      selectedWaypoint &&
      !!selectedWaypoint.traits &&
      !!selectedWaypoint.traits.find(
        (trait: ITrait) => trait.symbol == 'SHIPYARD',
      );
    const hasMarketplace =
      selectedWaypoint &&
      !!selectedWaypoint?.traits &&
      !!selectedWaypoint.traits.find(
        (trait: ITrait) => trait.symbol == 'MARKETPLACE',
      );

    return (
      <MapControls onSelectMap={onSelectMap}>
        <div className="flex flex-col">
          <MapButton onClick={handleSelectBack} text="View Universe Map" />
          <MapButton
            onClick={() => {
              fetchWaypoints(true);
            }}
            text="Re-fetch Waypoints"
          />
          {!selectedWaypoint ? (
            <MapButton
              onClick={() => {
                highlightTrait('MARKETPLACE');
              }}
              isSelected={selectedTrait == 'MARKETPLACE'}
              text="Marketplaces"
            />
          ) : null}
          {!selectedWaypoint ? (
            <MapButton
              onClick={() => {
                highlightTrait('SHIPYARD');
              }}
              isSelected={selectedTrait == 'SHIPYARD'}
              text="Shipyards"
            />
          ) : null}
          {selectedWaypoint && hasMarketplace ? (
            <MapButton
              onClick={() =>
                handleSelectMarketplace(system.symbol, selectedWaypoint.symbol)
              }
              text="Go to Marketplace"
            />
          ) : null}
          {selectedWaypoint && hasShipyard ? (
            <MapButton
              onClick={() =>
                handleSelectShipyard(system.symbol, selectedWaypoint.symbol)
              }
              text="Go to Shipyard"
            />
          ) : null}
        </div>
        {isLoading ? (
          <>
            <span>Loading waypoints...</span>
            <span className="loading loading-spinner loading-md"></span>
          </>
        ) : null}
      </MapControls>
    );
  };

  const handleSelectBack = () => {
    onSelectMap('universe');
  };

  const handleWaypointClick = (
    newWaypoint: IWaypointRender,
    waypointRef: React.RefObject<Konva.Circle>,
  ) => {
    const x = waypointRef?.current?.x();
    const y = waypointRef?.current?.y();
    const radius = waypointRef?.current?.radius();

    if (x !== undefined && y !== undefined && radius !== undefined) {
      setMapCenter({ x: x, y: -y });
    }

    setSelectedWaypoint(newWaypoint);
  };

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const isWaypoint = !!e.target.attrs.waypoint;
    const isWaypointMetadata = e.target.name() == 'waypoint-metadata';

    if (!(isWaypoint || isWaypointMetadata)) {
      setSelectedWaypoint(null);
    }
  };

  useEffect(() => {
    const getShips = async () => {
      const ships: IShipRender[] = await getData('shipStore');
      const inSystemShips = ships.filter(
        (ship) => ship.nav.route.destination.systemSymbol == system.symbol,
      );

      for (const inSystemShip of inSystemShips) {
        const waypoint = await getObject(
          'waypointStore',
          inSystemShip.nav.route.destination.symbol,
        );
        if (waypoint) {
          inSystemShip.renderData = {
            color: 'white',
          };
        }
      }

      setShips(inSystemShips);
    };

    async function loadData() {
      await fetchWaypoints();
      await getShips();
    }

    loadData();
  }, [system]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedWaypoint(null);
      }
    };

    // Attach the event listener
    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef}>
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
          {system.waypoints.map((waypoint: IWaypointRender, index: number) => {
            let { x, y, renderData } = waypoint;
            const { drawOrbit } = renderData;

            return drawOrbit ? (
              <React.Fragment key={index}>
                {waypoint.orbitals.length > 0 ? (
                  <Orbit
                    x={x}
                    y={y}
                    radius={getDistance(
                      x,
                      y,
                      waypoint.orbitals[0].renderData.x || 0,
                      waypoint.orbitals[0].renderData.y || 0,
                    )}
                    isWaypointSelected={!!selectedWaypoint}
                  />
                ) : null}

                <Orbit
                  key={'waypoint-' + index}
                  x={0}
                  y={0}
                  radius={getDistance(0, 0, x, y)}
                  isWaypointSelected={!!selectedWaypoint}
                />
              </React.Fragment>
            ) : null;
          })}
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
        <FleetLayer ships={ships} isWaypointSelected={!!selectedWaypoint} />
        {/* Waypoints Layer */}
        <Layer ref={waypointLayerRef}>
          {system.waypoints
            .filter((waypoint: IWaypointRender) => !waypoint.orbits)
            .sort((a, b) => b.x - a.x)
            .map((waypoint: IWaypointRender, index: number) => {
              return (
                <Waypoint
                  key={index}
                  waypoint={waypoint}
                  selectedTrait={selectedTrait}
                  onWaypointClick={handleWaypointClick}
                  zoomLevel={zoomLevel}
                  selectedWaypoint={selectedWaypoint}
                />
              );
            })}
        </Layer>
      </Map>
    </div>
  );
}

export default SystemMap;
