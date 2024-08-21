'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { fetchResource } from '@/utils/v2'
import { IShip, IShipyard } from '@/types'

import Navbar from '@/components/Navbar';
import { TShipType } from '@/types'

const ShipyardUI = () => {
  const searchParams = useSearchParams();
  const [shipyardData, setShipyardData] = useState<IShipyard>()
  const [selectedView, setSelectedView] = useState<string>('Ships')

  const shipTypeNameMapping = {
    'SHIP_PROBE': 'Probe',
    'SHIP_MINING_DRONE': 'Mining Drone',
    'SHIP_SIPHON_DRONE': 'Siphon Drone',
    'SHIP_INTERCEPTOR': 'Interceptor',
    'SHIP_LIGHT_HAULER': 'Light Hauler',
    'SHIP_COMMAND_FRIGATE': 'Command Frigate',
    'SHIP_EXPLORER': 'Explorer',
    'SHIP_HEAVY_FREIGHTER': 'Heavy Freighter',
    'SHIP_LIGHT_SHUTTLE': 'Light Shuttle',
    'SHIP_ORE_HOUND': 'Ore Hound',
    'SHIP_REFINING_FREIGHTER': 'Refining Freighter',
    'SHIP_SURVEYOR': 'Surveyor'
  }

  useEffect(() => {
    async function getShipyardData() {
      const systemSymbol = searchParams.get('systemSymbol');
      const waypointSymbol = searchParams.get('waypointSymbol')

      const response = await fetchResource(`systems/${systemSymbol}/waypoints/${waypointSymbol}/shipyard`)
      setShipyardData(response.data)
    }
    
    getShipyardData()
  }, []);

  return (
    <div>
      <Navbar></Navbar>
      {
        shipyardData ? (
          <main className="flex min-h-screen flex-col p-24">
            <h1 className="text-xl text-center">Shipyard {shipyardData.symbol}</h1>
            <p className="text-lg text-center text-neutral-500 mb-10">Modifications Fee <span>{shipyardData.modificationsFee}</span></p>
            
            {
                !shipyardData.ships ? (
                  <div className="text-center">
                  This shipyard sells the following ship types:
                  {
                    shipyardData.shipTypes.map(shipType => (
                      <p>{shipTypeNameMapping[shipType.type as TShipType]}</p>
                    ))
                  }
                  </div>
                ) : null
            }
            {
              (shipyardData.ships && shipyardData.transactions) ? (
                <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box mb-8">
                  <li><a className={`${selectedView === 'Ships' ? 'bg-base-300' : 'bg-base-200'}`} onClick={() => { setSelectedView('Ships') }}>Ships</a></li>
                  <li><a className={`${selectedView === 'Transactions' ? 'bg-base-300' : 'bg-base-200'}`} onClick={() => { setSelectedView('Transactions') }}>Transactions</a></li>
                </ul>
              ) : null
            } 
            {
              (shipyardData.ships && selectedView === 'Ships') ? (
                <>
                <table className="table mb-8">
                  {/* head */}
                  <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                  </tr>
                  </thead>
                  <tbody>
                    {
                      shipyardData.ships.map((ship: IShip, index: number) => {
                        return (
                          <tr key={index}>
                            <th>{ship.name}</th>
                            <td>{ship.description}</td>
                            <td>{ship.purchasePrice}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
                </>
              ) : null
            }
            {
              (shipyardData.transactions && selectedView == 'Transactions') ? (
                <table className="table">
                  {/* head */}
                  <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Price</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Waypoint</th>
                  </tr>
                  </thead>
                  <tbody>
                    {
                      shipyardData.transactions.map((transaction: any, index: number) => {
                        return (
                          <tr key={index}>
                            <th>{transaction.agentSymbol}</th>
                            <td>{transaction.price}</td>
                            <td>{shipTypeNameMapping[transaction.shipType as TShipType]}</td>
                            <td>{transaction.timestamp}</td>
                            <td>{transaction.waypointSymbol}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              ) : null
            }
          </main>
        ):
        (
          <main className="flex min-h-screen flex-col p-24">
            <div className="flex w-full flex-col gap-4">
              <div className="skeleton h-32 w-full"></div>
              <div className="skeleton h-4 w-28"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-full"></div>
            </div>
          </main>
        )
      }
    </div>
  )
}

export default ShipyardUI