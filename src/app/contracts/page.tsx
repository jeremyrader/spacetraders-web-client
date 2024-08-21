'use client'

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { DataProvider } from '../../contexts/DataContext';
import { fetchResourcePaginated } from '../../utils/v2';

import Navbar from '@/components/Navbar';
import { IContract } from '@/types'

function Dashboard() {
  const [contracts, setContracts] = useState<IContract[]>([])

  useEffect(() => {
    async function fetchContracts() {
      const result = await fetchResourcePaginated('my/contracts')
        setContracts(result);
    }

    fetchContracts();
  }, []);

  return <DataProvider>
    <Navbar></Navbar>
    <main className="flex min-h-screen flex-col p-24">
      <h1 className="text-xl text-center">Contracts</h1>
      <div className="mb-24">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
            <tr>
                <th>Type</th>
                <th>Accepted</th>
                <th>Fulfilled</th>
                <th>Expiration</th>
                <th>Deadline to Fulfill</th>
                <th>Actions</th>
            </tr>
            </thead>
              <tbody>
                {
                  contracts.map((contract, index) => (
                    <Fragment key={index}>
                        <tr>
                          <th>{contract.type}</th>
                          <th>{contract.accepted ? 'Yes': 'No'}</th>
                          <th>{contract.fulfilled ? 'Yes': 'No'}</th>
                          <th>{contract.expiration}</th>
                          <th>{contract.deadlineToAccept}</th>
                        </tr>
                        <tr>
                          <th colSpan={5}>
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
                          {
                            contracts.map((contract, index) => (
                              <div className="mt-4" key={index}>
                                <p>
                                  Terms:
                                </p>    
                                <p>Deadline: {contract.terms.deadline}</p>
                                <p>Payment on Accept: {contract.terms.payment.onAccepted}</p>
                                <p>Payment on Fulfillment: {contract.terms.payment.onFulfilled}</p>
                              </div>
                            ))
                          }
                          </th>
                        </tr>
                    </Fragment>
                  ))
                }
              </tbody>
          </table>
        </div>

        
      </div>

    </main>
  </DataProvider>
}

export default Dashboard;
