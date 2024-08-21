"use client"

import { useState, useEffect } from 'react';
import { DataProvider } from '../../contexts/DataContext';

import UniverseMap from '@/components/UniverseMap';
import SystemMap from '@/components/SystemMap';
import Navbar from '@/components/Navbar';

import { ISystemRender } from '@/types'

function Map() {
  const [selectedMap, setSelectedMap] = useState("universe")
  const [selectedSystem, setSelectedSystem] = useState<ISystemRender>({
    symbol: '',
    type: '',
    x: 0,
    y: 0,
    renderData:{
      radius: 1,
      color: 'white'
    },
    waypoints: []
  })

  const handleSelectMap = (map: string, system: ISystemRender) => {
    setSelectedMap(map)

    if (system) {
      setSelectedSystem(system)
    }
  }
  
  useEffect(() => {
    const selectedMap = sessionStorage.getItem('selectedMap');
    const selectedSystem = sessionStorage.getItem('selectedSystem')

    if (selectedMap !== null) {
      setSelectedMap(selectedMap);
    }

    if (selectedSystem !== null) {
      setSelectedSystem(JSON.parse(selectedSystem));
    }
  }, []);

  useEffect(() => {
    if (selectedMap !== null) {
      sessionStorage.setItem('selectedMap', selectedMap)
    }

    if (selectedSystem !== null) {
      sessionStorage.setItem('selectedSystem', JSON.stringify(selectedSystem))
    }
  }, [selectedMap]);

  return <DataProvider>
    <div className="min-h-screen">
      <Navbar></Navbar>
      <main className="flex flex-col p-4">
        {
          selectedMap == 'universe' ? (
            <UniverseMap onSelectMap={handleSelectMap}></UniverseMap>
          ) : (
            <SystemMap system={selectedSystem} onSelectMap={handleSelectMap}></SystemMap>
          )
        }
      </main>
    </div>

  </DataProvider>
}

export default Map;
