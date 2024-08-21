'use client';

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { DataProvider } from '../../contexts/DataContext';
import { fetchResourcePaginated } from '../../utils/v2';

import Navbar from '@/components/Navbar';
import { IContract } from '@/types';

function Dashboard() {
  const [contracts, setContracts] = useState<IContract[]>([]);

  useEffect(() => {
    async function fetchContracts() {
      const result = await fetchResourcePaginated('my/contracts');
      setContracts(result);
    }

    fetchContracts();
  }, []);

  return (
    <DataProvider>
      <Navbar></Navbar>
      <main className="flex min-h-screen flex-col p-24">
        <h1 className="text-xl text-center p-8">Contracts</h1>

        {contracts &&
          contracts.map((contract, index) => (
            <div key={index} className="collapse collapse-arrow bg-base-200">
              <input type="radio" name="my-accordion-2" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Accepted</th>
                      <th>Fulfilled</th>
                      <th>Expiration</th>
                      <th>Deadline to Fulfill</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>{contract.type}</th>
                      <th>{contract.accepted ? 'Yes' : 'No'}</th>
                      <th>{contract.fulfilled ? 'Yes' : 'No'}</th>
                      <th>{contract.expiration}</th>
                      <th>{contract.deadlineToAccept}</th>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="collapse-content flex">
                <div className="p-4">
                  <p className="font-bold">Payment</p>
                  <p>On Accepted: {contract.terms.payment.onAccepted}</p>
                  <p>On Fulfilled: {contract.terms.payment.onFulfilled}</p>
                </div>
                <div className="p-4">
                  <p className="font-bold">Deadline</p>
                  <p>{contract.terms.deadline}</p>
                </div>
                {contract.terms.deliver.map((delivery, index) => (
                  <div className="p-4" key={index}>
                    <p className="font-bold">Delivery</p>
                    <p>Trade Symbol: {delivery.tradeSymbol}</p>
                    <p>Trade Destination: {delivery.destinationSymbol}</p>
                    <p>Units Required: {delivery.unitsRequired}</p>
                    <p>Units Fulfilled: {delivery.unitsFulfilled}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </main>
    </DataProvider>
  );
}

export default Dashboard;
