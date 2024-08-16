import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { saveData, getData, saveState, getState, getTimestamp, setTimestamp } from '../utils/indexeddb';
import { rateLimiter, burstLimiter } from '../utils/ratelimiter'
import { getRandomInt, getRandomOrange, getRandomRed, getRandomBlue, getRandomStarColor, generatePointsOnCircle } from '../utils/canvasUtils'

interface DataContextProps {
  getSystems: () => Promise<any[]>;
  getSystemsRenderData: () => Promise<any[]>;
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
      await saveData('systemsStore', result.data)

      const systems = result.data

      for (const system of systems) {
        const { x, y, symbol, type, waypoints } = system;
        let color = "white"
        let radius = 30

        let types = [
          'BLACK_HOLE',
          'ORANGE_STAR',
          'BLUE_STAR',
          'RED_STAR',
          'YOUNG_STAR',
          'WHITE_DWARF',
          'HYPERGIANT',
          'UNSTABLE',
          'NEUTRON_STAR'
        ]

        if (type == 'BLACK_HOLE') {
          color = "gray"
          radius = getRandomInt(5,10)
        }

        if (type == 'ORANGE_STAR') {
          color = getRandomOrange()
          radius = getRandomInt(15,20)
        }

        if (type == 'BLUE_STAR') {
          color = getRandomBlue()
          radius = getRandomInt(25,28)
        }

        if (type == 'RED_STAR') {
          color = getRandomRed()
          radius = getRandomInt(15, 25)
        }

        if (type == 'YOUNG_STAR') {
          color = getRandomStarColor()
          radius = getRandomInt(20,25)
        }

        if (type == 'WHITE_DWARF') {
          color = 'white'
          radius = getRandomInt(10,15)
        }

        if (type == 'HYPERGIANT') {
          color = getRandomStarColor()
          radius = getRandomInt(28,30)
        }

        if (type == 'UNSTABLE') {
          color = getRandomStarColor()
          radius = 15
        }

        if (type == 'NEUTRON_STAR') {
          color = "white"
          radius = getRandomInt(10,15)
        }

        await saveData('systemRenderStore', [{ symbol: symbol, color: color, radius: radius }])

        // Orbital waypoints have the same coordinates as their parent waypoints
        // New pseudo coordinates are created here so that they're rendered in an orbit on the map
        for (const waypoint of waypoints) {
          const { symbol, type, orbitals } = waypoint

          let radius = 1
          let color = 'white'
          let drawOrbit = false

          if (['ASTEROID', 'ENGINEERED_ASTEROID', 'ASTEROID_BASE'].includes(type)) {
            color = 'gray'
            radius = 2
          }

          if (type == 'MOON') {
            color = 'white'
            radius = 3
            drawOrbit = true
          }

          if (type == 'PLANET') {
            color = '#126f1e'
            radius = 3
            drawOrbit = true
          }

          if (type == 'GAS_GIANT') {
            color = 'green'
            radius = 5
            drawOrbit = true
          }

          if (type == 'JUMP_GATE' || type == 'FUEL_STATION') {
            color = 'blue'
            radius = 2
            drawOrbit = true
          }

          await saveData('waypointRenderStore', [{ symbol: symbol, color: color, radius: radius, drawOrbit: drawOrbit }])

          if (orbitals.length > 0) {
            const orbitalDistance = 3
            const orbitalCoordinates = generatePointsOnCircle(radius + orbitalDistance, orbitals.length);
            for (const [index, orbital] of orbitals.entries()) {
              await saveData('orbitalRenderStore', [{ symbol: orbital.symbol, x: orbitalCoordinates[index].x, y: orbitalCoordinates[index].y }])
            }
          }
        }
      }

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

    if (savedData.length > 849 && isCacheValid) {
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

  const getSystemsRenderData = async (): Promise<any[]> => {
    return await getData('systemRenderStore');
  };

  useEffect(() => {

    // Load initial data after reset
    if (true) {
      loadData()
    }
    
  }, []);

  return (
    <DataContext.Provider value={{ getSystems, getSystemsRenderData, isLoading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
