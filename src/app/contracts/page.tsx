"use client";

import { useState, useEffect } from 'react';
import { Fragment } from 'react';
import { DataProvider } from '../../contexts/DataContext';
import { fetchResource, fetchResourcePaginated, postRequest } from '../../utils/v2';

function Dashboard() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [refresh, setRefresh] = useState(false);

  const handleAcceptContract = async (contractId: string) => {
    const response = await postRequest(`my/contracts/${contractId}/accept`)
    console.log('response', response)

    // refresh if the status is okay
    // setRefresh(!refresh);
    
  }

  useEffect(() => {
    async function fetchAgent() {
      const result = await fetchResource('my/agent')
      setAgent(result.data)
    }

    async function fetchContracts() {
      const result = await fetchResourcePaginated('my/contracts')
        setContracts(result);
    }

    fetchAgent();
    fetchContracts();
  }, [refresh]);

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
                          <th>
                            {
                              !contract.accepted ? (
                                <button className="btn" onClick={() => {
                                  handleAcceptContract(contract.id)
                                }}>
                                  Accept
                                </button>
                              ) : null
                            }
                          </th>
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
