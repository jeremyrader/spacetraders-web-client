'use client'

import { IAgent } from '@/types'

interface AgentCardProps {
  agent: IAgent
}

const AgentCard = ({agent}: AgentCardProps) => {
  const { symbol, headquarters, credits, startingFaction, shipCount } = agent

  return (
    <div className="card shadow-xl">
      <div className="card-body">
        <h2 className="card-title">My Agent</h2>
        <div>
          <p>Symbol: {symbol}</p>
          <p>Headquarters: {headquarters}</p>
          <p>Credits: {credits}</p>
          <p>Starting Faction: {startingFaction}</p>
          <p>Ship Count: {shipCount}</p>
        </div>
      </div>
    </div>
  )
}

export default AgentCard