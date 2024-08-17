'use client'

import React, { useState, useEffect } from 'react';
import { fetchResource } from '../utils/v2'

import { Commodity } from '../types'

interface MarketProps {
  systemSymbol: string;
  waypointSymbol: string;
}

const MarketUI = ({systemSymbol, waypointSymbol}: MarketProps) => {
  const [exchanges, setExchanges] = useState<Commodity[]>([])
  const [tradeImports, setTradeImports] = useState<Commodity[]>([])
  const [tradeExports, setTradeExports] = useState<Commodity[]>([])

  useEffect(() => {
    async function getMarketData() {
      const response = await fetchResource(`systems/${systemSymbol}/waypoints/${waypointSymbol}/market`)

      if (response.data?.exchange) {
        setExchanges(response.data?.exchange)
      }
      if (response.data?.imports) {
        setTradeImports(response.data?.imports)
      }
      if (response.data?.exports) {
        setTradeExports(response.data?.exports)
      }
    }

    getMarketData()
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="table">
        {/* head */}
        <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
        </thead>
        <tbody>
          {
            exchanges.map((exchange: Commodity, index: number) => {
              return (
                <tr key={index}>
                  <th>{exchange.name}</th>
                  <td>{exchange.description}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      <table className="table">
        {/* head */}
        <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
        </thead>
        <tbody>
          {
            tradeImports.map((tradeImport: Commodity, index: number) => {
              return (
                <tr key={index}>
                  <th>{tradeImport.name}</th>
                  <td>{tradeImport.description}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
      <table className="table">
        {/* head */}
        <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
        </tr>
        </thead>
        <tbody>
          {
            tradeExports.map((tradeExport: Commodity, index: number) => {
              return (
                <tr key={index}>
                  <th>{tradeExport.name}</th>
                  <td>{tradeExport.description}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

export default MarketUI