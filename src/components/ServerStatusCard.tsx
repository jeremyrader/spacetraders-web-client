'use client'

interface ServerStatusCardProps {
  status: string;
  version: string;
  lastResetDate: string;
  nextResetDate: string;
}

const ServerStatusCard = ({status, version, lastResetDate, nextResetDate}: ServerStatusCardProps) => {
  return (
    <div className="card w-96 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Server Status</h2>
        <span>{status}</span>
        <span>Version: {version}</span>
        <span>Last Reset: {lastResetDate}</span>  
        <span>Next Reset: {nextResetDate}</span>
      </div>
    </div>
  )
}

export default ServerStatusCard