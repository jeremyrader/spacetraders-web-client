"use client"

import { useState } from 'react';
import { DataProvider } from '../../contexts/DataContext';

import UniverseMap from '@/components/UniverseMap';
import SystemMap from '@/components/SystemMap';
import Navbar from '@/components/Navbar';

import { IAgent, ISystemRender } from '@/types'

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

  return <DataProvider>
    <Navbar></Navbar>
    <main className="flex min-h-screen flex-col p-24">
      {
        selectedMap == 'universe' ? (
          <UniverseMap onSelectMap={handleSelectMap}></UniverseMap>
        ) : (
          <SystemMap system={selectedSystem} onSelectMap={handleSelectMap}></SystemMap>
        )
      }
    </main>
  </DataProvider>
}

export default Map;
