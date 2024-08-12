"use client";

import { useState, useEffect } from 'react';
import { DataProvider } from '../../contexts/DataContext';
import fetchResource from '../../utils/v2';

import UniverseMap from '@/components/UniverseMap';
import SystemMap from '@/components/SystemMap';

function Dashboard() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selectedMap, setSelectedMap] = useState("universe")
  const [selectedSystem, setSelectedSystem] = useState<System |  null>(null)

  useEffect(() => {

    async function fetchAgent() {
      const result = await fetchResource('my/agent')
      setAgent(result.data)
    }

    async function fetchContracts() {
      const result = await fetchResource('my/contracts')

      // only handles the first page for now
      setContracts(result.data);
    }

    fetchAgent();
    fetchContracts();
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
    <main className="flex min-h-screen flex-col p-24">
      Dashboard
      <div className="mb-24">
        <p>Account ID: {agent?.accountId}</p>
        <p>Symbol: {agent?.symbol}</p>
        <p>Headquarters: {agent?.headquarters}</p>
        <p>Credits: {agent?.credits}</p>
        <p>Starting Faction: {agent?.startingFaction}</p>
        <p>Ship Count: {agent?.shipCount}</p>

        <p className="mt-8">Contracts:</p>

        {
          contracts.map((contract, index) => (
            <div className="mt-4" key={index}>
              <p>Type: {contract.type}</p>
              <p>
                Terms:
              </p>
              <p>Deadline: {contract.terms.deadline}</p>
              <p>Payment on Accept: {contract.terms.payment.onAccepted}</p>
              <p>Payment on Fulfillment: {contract.terms.payment.onFulfilled}</p>

              <p>Deliveries:</p>

              {
                contract.terms.deliver.map((delivery, index) => (
                  <div className="my-4" key={index}>
                    <p>Trade Symbol: {delivery.tradeSymbol}</p>
                    <p>Trade Destination: {delivery.destinationSymbol}</p>
                    <p>Units Required: {delivery.unitsRequired}</p>
                    <p>Units Fulfilled: {delivery.unitsFulfilled}</p>
                  </div>
                ))
              }

              <p>Accepted: {contract.accepted ? 'Yes': 'No'}</p>
              <p>Fulfilled: {contract.fulfilled ? 'Yes': 'No'}</p>
              <p>Expiration: {contract.expiration}</p>
              <p>Deadline to Accept: {contract.deadlineToAccept}</p>

            </div>
          ))
        }
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
