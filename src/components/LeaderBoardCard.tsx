'use client'

import { useState } from 'react';

interface LeaderboardCardProps {
  leaderBoards: {
    mostCredits: {
      agentSymbol: string
      credits: number
    }[]
    mostSubmittedCharts : {
      agentSymbol: string
      chartCount: number
    }[]
  }
}

const LeaderboardCard = ({leaderBoards}: LeaderboardCardProps) => {
  const { mostCredits, mostSubmittedCharts } = leaderBoards
  const [selectedLeaderBoard, setSelectedLeaderBoard] = useState<string>('Credits')

  return (
    <div className="card shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-lg p-2 mb-2">Leaderboards</h2>

        <ul className="menu menu-vertical lg:menu-horizontal bg-base-200 rounded-box mb-2">
          <li><a className={`${selectedLeaderBoard === 'Credits' ? 'bg-base-300' : 'bg-base-200'}`} onClick={() => { setSelectedLeaderBoard('Credits') }}>Credits</a></li>
          <li><a className={`${selectedLeaderBoard === 'Charts' ? 'bg-base-300' : 'bg-base-200'}`} onClick={() => { setSelectedLeaderBoard('Charts') }}>Most Submitted Charts</a></li>
        </ul>
        {
          selectedLeaderBoard == 'Credits' && (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Agent</th>
                    <th>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    mostCredits.slice(0,5).map((entry, index) => (
                      <tr key={index}>
                        <th>{index + 1}</th>
                        <td>{entry.agentSymbol}</td>
                        <td>{entry.credits}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )
        }
        {
          selectedLeaderBoard == 'Charts' && (
            <div className="overflow-x-auto">
              <table className="table">
                {/* head */}
                <thead>
                  <tr>
                    <th></th>
                    <th>Agent</th>
                    <th>Charts</th>
                  </tr>
                </thead>
                <tbody>
                  
                  {
                    mostSubmittedCharts.map((entry, index) => (
                      <tr key={index}>
                        <th>{index + 1}</th>
                        <td>{entry.agentSymbol}</td>
                        <td>{entry.chartCount}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )
        }
      </div>
    </div>
  )
}

export default LeaderboardCard