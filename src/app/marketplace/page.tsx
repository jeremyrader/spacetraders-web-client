'use client'

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import Navbar from '@/components/Navbar';

import { fetchResource } from '@/utils/v2'
import { IMarket, ICommodity, ITradeGood, ITransaction } from '@/types'

const MarketUI = () => {
  const searchParams = useSearchParams();
  const [marketData, setMarketData] = useState<IMarket | null>(null)
  const [selectedView, setSelectedView] = useState<string>('Exchange')

  useEffect(() => {
    async function getMarketData() {

      const systemSymbol = searchParams.get('systemSymbol');
      const waypointSymbol = searchParams.get('waypointSymbol')
      const response = await fetchResource(`systems/${systemSymbol}/waypoints/${waypointSymbol}/market`)

      if (response.data) {
        setMarketData(response.data)
      }
    }

    getMarketData()
  }, []);

  return (
    <div>
      <Navbar></Navbar>
      {
        marketData ? (
          <main className="flex min-h-screen flex-col p-24">
            <h1 className="text-xl text-center mb-10">Marketplace {marketData.symbol}</h1>
            <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box mb-8">
              {
                marketData.exchange && (<li><a className={`${selectedView === 'Exchange' ? 'bg-base-300' : 'bg-base-200'}`} onClick={() => { setSelectedView('Exchange') }}>Exchange</a></li>)
              }
              {
                marketData.imports && (<li><a className={`${selectedView === 'Imports' ? 'bg-base-300' : 'bg-base-200'}`} onClick={() => { setSelectedView('Imports') }}>Imports</a></li>)
              }
              {
                marketData.exports && (<li><a className={`${selectedView === 'Exports' ? 'bg-base-300' : 'bg-base-200'}`} onClick={() => { setSelectedView('Exports') }}>Exports</a></li>)
              }
              {
                marketData.tradeGoods && (<li><a className={`${selectedView === 'Trade Goods' ? 'bg-base-300' : 'bg-base-200'}`} onClick={() => { setSelectedView('Trade Goods') }}>Trade Goods</a></li>)
              }
              {
                marketData.transactions && (<li><a className={`${selectedView === 'Transactions' ? 'bg-base-300' : 'bg-base-200'}`} onClick={() => { setSelectedView('Transactions') }}>Transactions</a></li>)
              }
            </ul>

            {
              (marketData.exchange.length > 0 && selectedView == 'Exchange') && (
                <table className="table">
                  <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                  </tr>
                  </thead>
                  <tbody>
                    {
                      marketData?.exchange && marketData.exchange.map((exchange: ICommodity, index: number) => {
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
              )
            }
            {
              (marketData.imports.length > 0 && selectedView == 'Imports') && (
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
                      marketData?.imports && marketData.imports.map((tradeImport: ICommodity, index: number) => {
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
              )
            }
            {
              (marketData.exports.length > 0 && selectedView == 'Exports') && (
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
                      marketData?.exports && marketData?.exports.map((tradeExport: ICommodity, index: number) => {
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
              )
            }
            {
              (marketData.tradeGoods && marketData.tradeGoods.length > 0 && selectedView == 'Trade Goods') && (
                <table className="table">
                  <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Supply</th>
                    <th>Type</th>
                    <th>Trade Volume</th>
                    <th>Purchase Price</th>
                    <th>Sell Price</th>
                  </tr>
                  </thead>
                  <tbody>
                    {
                      marketData.tradeGoods.map((tradeGood: ITradeGood, index: number) => {
                        return (
                          <tr key={index}>
                            <th>{tradeGood.symbol}</th>
                            <td>{tradeGood.supply}</td>
                            <td>{tradeGood.type}</td>
                            <td>{tradeGood.tradeVolume}</td>
                            <td>{tradeGood.purchasePrice}</td>
                            <td>{tradeGood.sellPrice}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              )
            }
            {
              (marketData.transactions && marketData.transactions.length > 0 && selectedView == 'Transactions') && (
                <table className="table">
                  <thead>
                  <tr>
                    <th>Ship Symbol</th>
                    <th>Trade Symbol</th>
                    <th>Type</th>
                    <th>Price per Unit</th>
                    <th>Units</th>
                    <th>Total Price</th>
                    <th>Timestamp</th>

                  </tr>
                  </thead>
                  <tbody>
                    {
                      marketData.transactions.map((transaction: ITransaction, index: number) => {
                        return (
                          <tr key={index}>
                            <th>{transaction.shipSymbol}</th>
                            <td>{transaction.tradeSymbol}</td>
                            <td>{transaction.type}</td>
                            <td>{transaction.pricePerUnit}</td>
                            <td>{transaction.units}</td>
                            <td>{transaction.totalPrice}</td>
                            <td>{transaction.timestamp}</td>
                            
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              )
            }  
          </main>
        ) : (
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

export default MarketUI