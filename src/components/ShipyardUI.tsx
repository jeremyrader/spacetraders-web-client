'use client'

import { useState, useEffect } from 'react';
import { fetchResource, postRequest } from '../utils/v2'

import { Ship } from '../types'

interface ShipyardProps {
  systemSymbol: string;
  waypointSymbol: string;
}

const ShipyardUI = ({systemSymbol, waypointSymbol}: ShipyardProps) => {

  const [shipTypes, setShipTypes] = useState<{type: string}[]>([])
  const [ships, setShips] = useState<Ship[]>([])
  const [transactions, setTransactions] = useState<any[]>([])

  async function handlePurchaseShip(type: string) {
    const response = await postRequest('my/ships', {
      shipType: type,
      waypointSymbol: waypointSymbol,
    })
  }

  useEffect(() => {
    async function getShipyardData() {
      const response = await fetchResource(`systems/${systemSymbol}/waypoints/${waypointSymbol}/shipyard`)

      if (response.data?.ships) {
        setShips(response.data?.ships)
      }

      if (response.data?.shipTypes) {
        setShipTypes(response.data?.shipTypes)
      }

      if (response.data?.transactions) {
        setShipTypes(response.data?.transactions)
      }
    }

    getShipyardData()
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="table">
          {/* head */}
          <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
          </thead>
          <tbody>
            {
              ships.map((ship: Ship, index: number) => {
                return (
                  <tr key={index}>
                    <th>{ship.name}</th>
                    <td>{ship.description}</td>
                    <td>{ship.purchasePrice}</td>
                    <td>
                      <button className="btn" onClick={() => {
                        handlePurchaseShip(ship.type)
                      }}>
                        Purchase
                      </button>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
      </table>
    </div>
  )
}

export default ShipyardUI