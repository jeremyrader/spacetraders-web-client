"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import UniverseMap from '@/components/UniverseMap';

function Dashboard() {

  const width = window.innerWidth;
  const height = window.innerHeight;
  const originX = width / 2;
  const originY = height / 2;

  // Points to plot (example points)
  const points = [
    { x: 50, y: 50 },
    { x: -50, y: -50 },
    { x: 100, y: -100 },
    { x: -100, y: 100 },
  ];

  const searchParams = useSearchParams();

  interface Agent {
    accountId: string;
    symbol: string;
    headquarters: string;
    credits: number;
    startingFaction: string;
    shipCount: number;
  }

  interface ContractTerms {
    deadline: string;
    payment: {
      onAccepted: number;
      onFulfilled: number;
    };
    deliver: {
      tradeSymbol: string;
      destinationSymbol: string;
      unitsRequired: number;
      unitsFulfilled: number;
    }[]
  }

  interface Contract {
    id: string;
    factionSymbol: string;
    type: string;
    terms: ContractTerms;
    accepted: boolean;
    fulfilled: boolean;
    expiration: string;
    deadlineToAccept: string;
  }

  const [agent, setAgent] = useState<Agent | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])

  useEffect(() => {

    async function fetchAgent() {
      const callsign = searchParams.get('callsign')

      if (callsign) {
        const token = localStorage.getItem(callsign);

        if (token) {
          const options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          };
    
          const response = await fetch('https://api.spacetraders.io/v2/my/agent', options)
          const result = await response.json();
    
          setAgent(result.data);
        }
        else {
          console.error("Agent not found")
        }

      }
      else {
        console.error("missing callsign param")
      }
    }

    async function fetchContracts() {

      const callsign = searchParams.get('callsign')

      if (callsign) {
        const token = localStorage.getItem(callsign)

        if (token) {
          const options = {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
            };
      
            const response = await fetch('https://api.spacetraders.io/v2/my/contracts', options)
            const result = await response.json();
      
            // only handles the first page for now
            setContracts(result.data);
        }
        else {
          console.error("Agent not found")
        }
      }
      else {
        console.error("missing callsign param")
      }
    }

    fetchAgent();
    fetchContracts();
  }, []);

  return <main className="flex min-h-screen flex-col p-24">
    Dashboard

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

    <UniverseMap></UniverseMap>

  </main>
}

export default Dashboard;
