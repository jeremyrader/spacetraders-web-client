import React, { createContext, useState, useEffect, useRef, ReactNode } from 'react';
import { saveData, getData, saveState, getState, getTimestamp, setTimestamp } from '../utils/indexeddb';
import { rateLimiter, burstLimiter } from '../utils/ratelimiter'

interface DataContextProps {
  getDataFromDB: () => Promise<any[]>; // Function to fetch data from IndexedDB
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

    if (savedData.length > 0 && isCacheValid) {
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

  const getDataFromDB = async (): Promise<any[]> => {
    const dbData = await getData('systemsStore');
    return dbData;
  };


  useEffect(() => {

    // Load initial data after reset
    if (false) {
      loadData()
    }
    
  }, []);

  return (
    <DataContext.Provider value={{ getDataFromDB, isLoading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;
