'use client'

import { useState, useEffect } from 'react';
import { DataProvider } from '../../contexts/DataContext';
import { fetchResource } from '../../utils/v2';
import { Ship, Inventory } from '../../types';

import Navbar from '@/components/Navbar';

function Ships() {
  const [ships, setShips] = useState<Ship[]>([])
  const [inventory, setInventory] = useState<Inventory[]>([])

  async function handleViewCargo (shipSymbol?: string) {
    const response = await fetchResource(`my/ships/${shipSymbol}/cargo`)
    setInventory(response.data.inventory)
  }

  useEffect(() => {
    async function getMyShips() {
      const response = await fetchResource('my/ships')
      setShips(response.data)
    }

    getMyShips()
  }, []);

  return <DataProvider>
    <Navbar></Navbar>
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-xl text-center mb-8">My Ships</h1>
      <div className="overflow-x-auto">
      <table className="table mb-8">
        {/* head */}
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Frame</th>
            <th>Role</th>
            <td>Cargo</td>
            <td>Fuel</td>
            <td>Flight Mode</td>
            <td>Status</td>
            <td>System</td>
            <td>Waypoint</td>
            <td>Actions</td>
          </tr>
        </thead>
        <tbody>
          {
            ships.map((ship, index) => (
              <tr key={index}>
                <th>{ship.symbol}</th>
                <th>{ship.frame.name}</th>
                <th>{ship.registration.role}</th>
                <th>{ship.cargo?.units} / {ship.cargo?.capacity}</th>
                <th>{ship.fuel?.current} / {ship.fuel?.capacity}</th>
                <th>{ship.nav.flightMode}</th>
                <th>{ship.nav.status}</th>
                <th>{ship.nav.systemSymbol}</th>
                <th>{ship.nav.waypointSymbol}</th>
                <th>
                  <button className="btn" onClick={() => {
                    handleViewCargo(ship.symbol)
                  }}>
                    View Cargo
                  </button>
                </th>
              </tr>
            ))
          }
        </tbody>
      </table>
      <h2 className="text-lg text-center mb-4">Cargo</h2>
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Units</th>
          </tr>
        </thead>
        <tbody>
          {
            inventory.map((item, index) => (
              <tr key={index}>
                <th>{item.name}</th>
                <th>{item.description}</th>
                <th>{item.units}</th>
              </tr>
            ))
          }
        </tbody>
      </table>


    </div>
    </main>
  </DataProvider>
}

export default Ships;
