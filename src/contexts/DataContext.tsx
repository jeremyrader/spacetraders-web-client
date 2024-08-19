import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { saveData, getData, saveState, getState, getTimestamp, setTimestamp } from '../utils/indexeddb';
import { rateLimiter, burstLimiter } from '../utils/ratelimiter'
import { getRandomInt, getRandomOrange, getRandomRed, getRandomBlue, getRandomStarColor, generatePointsOnCircle } from '../utils/canvasUtils'
import { ISystemRender, IWaypoint, IWaypointRender, TWaypointType, TWaypointRenderDataMap } from '@/types';

interface DataContextProps {
  getSystems: () => Promise<any[]>;
  isLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);
const CACHE_EXPIRATION = 60 * 60 * 1000 * 24; // 1 day  

interface DataProviderProps {
  children: ReactNode;
}

let isFetching = false;

const isErrorWithMessage = (error: unknown): error is { message: string } => {
  return typeof error === 'object' && error !== null && 'message' in error;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemsData = async (page: number): Promise<void> => {
    try {
      const result = await burstLimiter.scheduleRequest(() =>
        rateLimiter.scheduleRequest(() =>
          fetch(`https://api.spacetraders.io/v2/systems?page=${page}`).then(res => res.json())
        )
      );

      await saveState(page);

      const systems: ISystemRender[] = result.data

      for (const system of systems) {
        const { type, waypoints } = system;
        let color = "white"
        let systemRadius = 30

        if (type == 'BLACK_HOLE') {
          color = "gray"
          systemRadius = getRandomInt(5,10)
        }

        if (type == 'ORANGE_STAR') {
          color = getRandomOrange()
          systemRadius = getRandomInt(15,20)
        }

        if (type == 'BLUE_STAR') {
          color = getRandomBlue()
          systemRadius = getRandomInt(25,28)
        }

        if (type == 'RED_STAR') {
          color = getRandomRed()
          systemRadius = getRandomInt(15, 25)
        }

        if (type == 'YOUNG_STAR') {
          color = getRandomStarColor()
          systemRadius = getRandomInt(20,25)
        }

        if (type == 'WHITE_DWARF') {
          color = 'white'
          systemRadius = getRandomInt(10,15)
        }

        if (type == 'HYPERGIANT') {
          color = getRandomStarColor()
          systemRadius = getRandomInt(28,30)
        }

        if (type == 'UNSTABLE') {
          color = getRandomStarColor()
          systemRadius = 15
        }

        if (type == 'NEUTRON_STAR') {
          color = "white"
          systemRadius = getRandomInt(10,15)
        }

        system.renderData = {
          radius: systemRadius,
          color: color
        }

        const waypointRenderDataMap: TWaypointRenderDataMap = {
          'PLANET': {
            radius: 4,
            drawOrbit: true
          },
          'GAS_GIANT': {
            radius: 6,
            drawOrbit: true
          },
          'MOON': {
            radius: 1,
            drawOrbit: true
          },
          'ORBITAL_STATION': {
            radius: 1,
            drawOrbit: true
          },
          'JUMP_GATE': {
            radius: 1,
            drawOrbit: true
          },
          'ASTEROID_FIELD': {
            radius: 3,
            drawOrbit: false
          },
          'ASTEROID':  {
            radius: 2,
            drawOrbit: false
          },
          'ENGINEERED_ASTEROID':  {
            radius: 1,
            drawOrbit: true
          },
          'ASTEROID_BASE': {
            radius: 1,
            drawOrbit: false
          },
          'NEBULA': {
            radius: 1,
            drawOrbit: false
          },
          'DEBRIS_FIELD': {
            radius: 1,
            drawOrbit: true
          },
          'GRAVITY_WELL': {
            radius: 1,
            drawOrbit: false
          },
          'ARTIFICIAL_GRAVITY_WELL': {
            radius: 1,
            drawOrbit: false
          },
          'FUEL_STATION': {
            radius: 1,
            drawOrbit: true
          },
        }

        const systemWaypoints: IWaypointRender[] = waypoints

        let parentOrbitalWaypoints = 
          systemWaypoints
            .filter((waypoint: IWaypoint) => !waypoint.orbits)

        let childOrbitalWaypoints = 
          systemWaypoints
            .filter((waypoint: IWaypoint) => waypoint.orbits)

        for (const waypoint of parentOrbitalWaypoints) {
          const { type, orbitals, x, y } = waypoint

          const waypointRenderData = waypointRenderDataMap[type as TWaypointType]
          const { radius, drawOrbit } = waypointRenderData

          waypoint.renderData = {
            radius: radius,
            drawOrbit: drawOrbit
          }

          waypoint.orbitals = getOrbitalWaypoints(orbitals, { x: x, y: y}, radius, childOrbitalWaypoints, waypointRenderDataMap)
        }

        system.waypoints = parentOrbitalWaypoints

      }

      function getOrbitalWaypoints(
        orbitals: IWaypointRender[],
        parentWaypointCoords: { x: number, y: number },
        parentWaypointRadius: number,
        childOrbitalWaypoints: IWaypointRender[],
        waypointRenderDataMap: TWaypointRenderDataMap
      ) {
          const waypointOrbitals: IWaypointRender[] = orbitals

          const orbitalDistance = 4
          const orbitalCoordinates = generatePointsOnCircle(parentWaypointRadius + orbitalDistance, orbitals.length);
          
          for (let [index, orbital] of waypointOrbitals.entries()) {
            const completeOrbitalData = childOrbitalWaypoints.find((waypoint: IWaypoint) => waypoint.symbol == orbital.symbol)

            if (completeOrbitalData) {
              const { type } = completeOrbitalData

              Object.assign(orbital, completeOrbitalData)

              const waypointRenderData = waypointRenderDataMap[type as TWaypointType]
              const { radius, drawOrbit } = waypointRenderData
    
              // Orbital waypoints have the same coordinates as their parent waypoints
              // New pseudo coordinates are created here so that they're rendered in an orbit on the map
              const x = parentWaypointCoords.x + orbitalCoordinates[index].x
              const y = parentWaypointCoords.y + orbitalCoordinates[index].y

              orbital.renderData = {
                x: x,
                y: y,
                radius: radius,
                drawOrbit: drawOrbit
              }
              orbital.orbitals = getOrbitalWaypoints(orbital.orbitals, { x: x, y: y },radius, childOrbitalWaypoints, waypointRenderDataMap)
            }
          }

          return waypointOrbitals
      }

      await saveData('systemsStore', systems)

      if (result.data.length == result.meta.limit) {
        return fetchSystemsData(page + 1);
      }
      else {
        await setTimestamp(Date.now()); // Save timestamp to local storage
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  const loadData = async () => {
    if (isFetching) return;
    isFetching = true;

    const savedData = await getData('systemsStore');
    const savedState = await getState();
    const savedTimestamp = await getTimestamp();
    const isCacheValid = savedTimestamp && (Date.now() - savedTimestamp) < CACHE_EXPIRATION;

    const { currentSystemsPage } = savedState || { currentSystemsPage: 1 };

    if (false) {
      setIsLoading(false);
    } else {
      try {
        await fetchSystemsData(currentSystemsPage);
      } catch (err) {
        if (isErrorWithMessage(err)) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    }
  }

  const getSystems = async (): Promise<any[]> => {
    return await getData('systemsStore');
  };

  // useEffect(() => {

  //   // Load initial data after reset
  //   if (true) {
  //     loadData()
  //   }
    
  // }, []);

  return (
    <DataContext.Provider value={{ getSystems, isLoading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
