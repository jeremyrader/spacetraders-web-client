'use client'

interface StatsCardProps {
  stats: {
    agents: number;
    ships: number;
    systems: number;
    waypoints: number;
  }
}

const StatsCard = ({stats}: StatsCardProps) => {
  const { agents, ships, systems, waypoints} = stats
  return (
    <div className="card shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Stats</h2>
        <span>Agents: {agents}</span>
        <span>Ships: {ships}</span>
        <span>Systems: {systems}</span>  
        <span>Waypoints: {waypoints}</span>
      </div>
    </div>
  )
}

export default StatsCard