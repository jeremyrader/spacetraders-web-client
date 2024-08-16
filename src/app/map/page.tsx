"use client"

import { useState, useEffect } from 'react';
import { DataProvider } from '../../contexts/DataContext';
import { fetchResource } from '../../utils/v2';

import UniverseMap from '@/components/UniverseMap';
import SystemMap from '@/components/SystemMap';
import Navbar from '@/components/Navbar';

function Dashboard() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [selectedMap, setSelectedMap] = useState("universe")
  const [selectedSystem, setSelectedSystem] = useState<System |  null>(null)

  useEffect(() => {

    async function fetchAgent() {
      const result = await fetchResource('my/agent')
      setAgent(result.data)

      window.localStorage.setItem('map-center-symbol', result.data.headquarters)
    }

    fetchAgent();
  }, []);

  const handleSelectMap = (map: string, system: System) => {
    setSelectedMap(map)

    if (system) {
      setSelectedSystem(system)
    }
    else {
      setSelectedSystem(null)
    }
  }

  return <DataProvider>
    <Navbar></Navbar>
    <main className="flex min-h-screen flex-col p-24">
      Dashboard
      <div className="mb-24">
        <p>Account ID: {agent?.accountId}</p>
        <p>Symbol: {agent?.symbol}</p>
        <p>Headquarters: {agent?.headquarters}</p>
        <p>Credits: {agent?.credits}</p>
        <p>Starting Faction: {agent?.startingFaction}</p>
        <p>Ship Count: {agent?.shipCount}</p>
      </div>
      

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

export default Dashboard;
