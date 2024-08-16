'use client'

import { useState, useEffect } from 'react';
import { DataProvider } from '../../contexts/DataContext';
import { fetchResource } from '../../utils/v2';
import { Ship } from '../../types';

import Navbar from '@/components/Navbar';

function Ships() {
  const [ships, setShips] = useState<Ship[]>([])

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
      <h1>My Ships</h1>
      <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Frame</th>
            <th>Role</th>
            <td>Carry Capacity</td>
            <td>Fuel</td>
            <td>Flight Mode</td>
            <td>Status</td>
            <td>System</td>
            <td>Waypoint</td>
          </tr>
        </thead>
        <tbody>
          {
            ships.map((ship, index) => (
              <tr key={index}>
                <th>{ship.symbol}</th>
                <th>{ship.frame.name}</th>
                <th>{ship.registration.role}</th>
                <th>{ship.cargo?.capacity}</th>
                <th>{ship.fuel?.current} / {ship.fuel?.capacity}</th>
                <th>{ship.nav.flightMode}</th>
                <th>{ship.nav.status}</th>
                <th>{ship.nav.systemSymbol}</th>
                <th>{ship.nav.waypointSymbol}</th>
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
