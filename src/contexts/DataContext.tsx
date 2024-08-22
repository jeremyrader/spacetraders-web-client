import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  saveData,
  getData,
  saveState,
  getState,
  getTimestamp,
  setTimestamp,
} from '../utils/indexeddb';
import { rateLimiter, burstLimiter } from '../utils/ratelimiter';
import {
  getRandomInt,
  getRandomOrange,
  getRandomRed,
  getRandomBlue,
  getRandomStarColor,
  generatePointsOnCircle,
} from '../utils/canvasUtils';
import {
  ISystemRender,
  IWaypoint,
  IWaypointRender,
  TWaypointType,
  TWaypointRenderDataMap,
} from '@/types';
import { fetchResourcePaginated } from '../utils/v2';

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

const planetChoiceMap: { [key: number]: string[] } = {
  1: ['#D6D1B1', '#6A89CC'],
  2: ['#7FB77E', '#D4C7E8'],
  3: ['#E5E5E5', '#C19FA5'],
  4: ['#8E9A9A', '#C1B4A3'],
  5: ['#F2D4C6', '#8FBFBF'],
  6: ['#8E9775', '#E0D1B5'],
  7: ['#DEC2C8', '#8998B3'],
  8: ['#CAC3BC', '#B4C8A8'],
  9: ['#A8B0B2', '#C3A6A6'],
  10: ['#ECE0C7', '#A9879E'],
};

const asteroidChoiceMap: { [key: number]: string[] } = {
  1: ['#4E4B4A', '#8B7E74'],
  2: ['#9A9E78', '#3D3D3D'],
  3: ['#B7A99A', '#5A5C64'],
};

const satelliteChoiceMap: { [key: number]: string[] } = {
  1: ['#3A7BD5', '#606060'],
  2: ['#E2C044', '#4A6A8A'],
  3: ['#2F4F4F', '#B0B0B0'],
};

function getRandomPlanetColors(): string[] {
  const keys = Object.keys(planetChoiceMap);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return planetChoiceMap[parseInt(randomKey)];
}

function getRandomAsteroidColors(): string[] {
  const keys = Object.keys(asteroidChoiceMap);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return asteroidChoiceMap[parseInt(randomKey)];
}

function getRandomSatelliteColors(): string[] {
  const keys = Object.keys(satelliteChoiceMap);
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return satelliteChoiceMap[parseInt(randomKey)];
}

const getWaypointColors = (type: string) => {
  if (['PLANET', 'GAS_GIANT', 'MOON'].includes(type)) {
    return getRandomPlanetColors();
  }

  if (['ASTEROID', 'ASTEROID_FIELD', 'ENGINEERED_ASTEROID'].includes(type)) {
    return getRandomAsteroidColors();
  }

  if (
    ['JUMP_GATE', 'ORBITAL_STATION', 'ASTEROID_BASE', 'DEBRIS_FIELD'].includes(
      type,
    )
  ) {
    return getRandomSatelliteColors();
  }

  if (type == 'NEBULA') {
    return ['#6BC1C5', '#5D3FD3'];
  }

  if (['GRAVITY_WELL', 'ARTIFICIAL_GRAVITY_WELL'].includes(type)) {
    return ['#00A6FF', '#2E1A6B'];
  }

  return ['white', 'white'];
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSystemsData = useCallback(async (page: number): Promise<void> => {
    try {
      const result = await burstLimiter.scheduleRequest(() =>
        rateLimiter.scheduleRequest(() =>
          fetch(`https://api.spacetraders.io/v2/systems?page=${page}`).then(
            (res) => res.json(),
          ),
        ),
      );

      await saveState(page);

      const systems: ISystemRender[] = result.data;

      for (const system of systems) {
        const { type, waypoints } = system;
        let color = 'white';
        let systemRadius = 30;

        if (type == 'BLACK_HOLE') {
          color = 'gray';
          systemRadius = getRandomInt(5, 10);
        }

        if (type == 'ORANGE_STAR') {
          color = getRandomOrange();
          systemRadius = getRandomInt(15, 20);
        }

        if (type == 'BLUE_STAR') {
          color = getRandomBlue();
          systemRadius = getRandomInt(25, 28);
        }

        if (type == 'RED_STAR') {
          color = getRandomRed();
          systemRadius = getRandomInt(15, 25);
        }

        if (type == 'YOUNG_STAR') {
          color = getRandomStarColor();
          systemRadius = getRandomInt(20, 25);
        }

        if (type == 'WHITE_DWARF') {
          color = 'white';
          systemRadius = getRandomInt(10, 15);
        }

        if (type == 'HYPERGIANT') {
          color = getRandomStarColor();
          systemRadius = getRandomInt(28, 30);
        }

        if (type == 'UNSTABLE') {
          color = getRandomStarColor();
          systemRadius = 15;
        }

        if (type == 'NEUTRON_STAR') {
          color = 'white';
          systemRadius = getRandomInt(10, 15);
        }

        system.renderData = {
          radius: systemRadius,
          color: color,
        };

        const waypointRenderDataMap: TWaypointRenderDataMap = {
          PLANET: {
            radius: 4,
            drawOrbit: true,
          },
          GAS_GIANT: {
            radius: 6,
            drawOrbit: true,
          },
          MOON: {
            radius: 1,
            drawOrbit: true,
          },
          ORBITAL_STATION: {
            radius: 1,
            drawOrbit: true,
          },
          JUMP_GATE: {
            radius: 1,
            drawOrbit: true,
          },
          ASTEROID_FIELD: {
            radius: 3,
            drawOrbit: false,
          },
          ASTEROID: {
            radius: 2,
            drawOrbit: false,
          },
          ENGINEERED_ASTEROID: {
            radius: 1,
            drawOrbit: true,
          },
          ASTEROID_BASE: {
            radius: 2,
            drawOrbit: false,
          },
          NEBULA: {
            radius: 1,
            drawOrbit: false,
          },
          DEBRIS_FIELD: {
            radius: 1,
            drawOrbit: true,
          },
          GRAVITY_WELL: {
            radius: 1,
            drawOrbit: false,
          },
          ARTIFICIAL_GRAVITY_WELL: {
            radius: 1,
            drawOrbit: false,
          },
          FUEL_STATION: {
            radius: 1,
            drawOrbit: true,
          },
        };

        const systemWaypoints: IWaypointRender[] = waypoints;

        let parentOrbitalWaypoints = systemWaypoints.filter(
          (waypoint: IWaypoint) => !waypoint.orbits,
        );

        let childOrbitalWaypoints = systemWaypoints.filter(
          (waypoint: IWaypoint) => waypoint.orbits,
        );

        for (const waypoint of parentOrbitalWaypoints) {
          const { type, orbitals, x, y } = waypoint;

          const waypointRenderData =
            waypointRenderDataMap[type as TWaypointType];
          const { radius, drawOrbit } = waypointRenderData;

          const waypointColors = getWaypointColors(type);

          waypoint.renderData = {
            color1: waypointColors[0],
            color2: waypointColors[1],
            radius: radius,
            drawOrbit: drawOrbit,
          };

          waypoint.orbitals = getOrbitalWaypoints(
            orbitals,
            { x: x, y: y },
            radius,
            childOrbitalWaypoints,
            waypointRenderDataMap,
          );
        }

        system.waypoints = parentOrbitalWaypoints;
      }

      function getOrbitalWaypoints(
        orbitals: IWaypointRender[],
        parentWaypointCoords: { x: number; y: number },
        parentWaypointRadius: number,
        childOrbitalWaypoints: IWaypointRender[],
        waypointRenderDataMap: TWaypointRenderDataMap,
      ) {
        const waypointOrbitals: IWaypointRender[] = orbitals;

        const orbitalDistance = 4;
        const orbitalCoordinates = generatePointsOnCircle(
          parentWaypointRadius + orbitalDistance,
          orbitals.length,
        );

        for (let [index, orbital] of waypointOrbitals.entries()) {
          const completeOrbitalData = childOrbitalWaypoints.find(
            (waypoint: IWaypoint) => waypoint.symbol == orbital.symbol,
          );

          if (completeOrbitalData) {
            const { type } = completeOrbitalData;

            Object.assign(orbital, completeOrbitalData);

            const waypointRenderData =
              waypointRenderDataMap[type as TWaypointType];
            const { radius, drawOrbit } = waypointRenderData;

            // Orbital waypoints have the same coordinates as their parent waypoints
            // New pseudo coordinates are created here so that they're rendered in an orbit on the map
            const x = parentWaypointCoords.x + orbitalCoordinates[index].x;
            const y = parentWaypointCoords.y + orbitalCoordinates[index].y;

            const waypointColors = getWaypointColors(type);

            orbital.renderData = {
              x: x,
              y: y,
              color1: waypointColors[0],
              color2: waypointColors[1],
              radius: radius,
              drawOrbit: drawOrbit,
            };
            orbital.orbitals = getOrbitalWaypoints(
              orbital.orbitals,
              { x: x, y: y },
              radius,
              childOrbitalWaypoints,
              waypointRenderDataMap,
            );
          }
        }

        return waypointOrbitals;
      }

      await saveData('systemsStore', systems);

      if (result.data.length == result.meta.limit) {
        return fetchSystemsData(page + 1);
      } else {
        await setTimestamp(Date.now()); // Save timestamp to local storage
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }, []);

  const loadData = useCallback(async () => {
    if (isFetching) return;
    isFetching = true;

    const savedData = await getData('systemsStore');
    const savedState = await getState();
    const savedTimestamp = await getTimestamp();
    const isCacheValid =
      savedTimestamp && Date.now() - savedTimestamp < CACHE_EXPIRATION;

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
  }, [fetchSystemsData]);

  const getSystems = async (): Promise<any[]> => {
    return await getData('systemsStore');
  };

  useEffect(() => {
    async function getShips() {
      const response = await fetchResourcePaginated(`my/ships/`);
      await saveData('shipStore', response);
    }

    getShips();
  }, []);

  useEffect(() => {
    // Load initial data after reset
    if (true) {
      loadData();
    }
  }, [loadData]);

  return (
    <DataContext.Provider value={{ getSystems, isLoading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
