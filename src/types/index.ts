export interface Trait {
  symbol: string;
  name: string;
  description: string;
}

interface Faction {
  symbol: string;
  name: string;
  description: string;
  headquarters: string;
  isRecruiting: boolean;
  traits: Trait[];
}

interface Agent {
  accountId: string;
  symbol: string;
  headquarters: string;
  credits: number;
  startingFaction: string;
  shipCount: number;
}

interface ContractTerms {
  deadline: string;
  payment: {
    onAccepted: number;
    onFulfilled: number;
  };
  deliver: {
    tradeSymbol: string;
    destinationSymbol: string;
    unitsRequired: number;
    unitsFulfilled: number;
  }[]
}

interface Contract {
  id: string;
  factionSymbol: string;
  type: string;
  terms: ContractTerms;
  accepted: boolean;
  fulfilled: boolean;
  expiration: string;
  deadlineToAccept: string;
}

interface Orbital {
  symbol: string;
}

interface Waypoint {
  symbol: string;
  type: string;
  x: number;
  y: number;
  orbitals: Orbital[]
  traits: Trait[]
  orbits: string
  modifiers: any[]
  chart: {
    submittedBy: string;
    submittedOn: string;
  }
  faction: {
    symbol: string;
  }
  isUnderConstruction: boolean;
}

interface System {
  symbol: string;
  type: string;
  x: number;
  y: number;
  orbitals: Orbital[]
  waypoints: Waypoint[]
}

interface Cargo {
  capacity: number;
  units: number;
  inventory: any[]
}

interface Fuel {
  capacity: number;
  consumed: {
    amount: number;
    timestamp: string;
  }
  current: number;
}

interface Location {
  arrival: string;
  departureTime: string;
  destination: {
    symbol: string;
    systemSymbol: string;
    type: string;
    x: number;
    y: number;
  }
}

export interface Ship {
  symbol?: string;
  type: string
  name: string
  description: string
  supply: string
  activity: string
  purchasePrice: number
  frame: Frame
  reactor: Reactor
  engine: Engine
  modules: Module[]
  mounts: Mount[]
  crew: Crew
  cargo?: Cargo
  fuel?: Fuel
  nav: {
    flightMode: string;
    route: {
      arrival: string;
      departureTime: string;
      destination: Location
      origin: Location
    }
    status: string;
    systemSymbol: string;
    waypointSymbol: string;
  }
  registration: {
    name: string;
    factionSymbol: string;
    role: string;
  }
}

interface Frame {
  symbol: string
  name: string
  description: string
  moduleSlots: number
  mountingPoints: number
  fuelCapacity: number
  quality: number
  requirements: Requirements
  condition: number
  integrity: number
}

interface Reactor {
  symbol: string
  name: string
  description: string
  powerOutput: number
  quality: number
  requirements: Requirements
  condition: number
  integrity: number
}

interface Requirements {
  crew: number
  power?: number
  slots?: number
}
  
interface Engine {
  symbol: string
  name: string
  description: string
  speed: number
  quality: number
  requirements: Requirements
  condition: number
  integrity: number
}

interface Module {
  symbol: string
  name: string
  description: string
  capacity?: number
  requirements: Requirements
}

interface Mount {
  symbol: string
  name: string
  description: string
  strength: number
  requirements: Requirements
}

interface Crew {
  required: number
  capacity: number
}

export interface Commodity {
  symbol: string;
  name: string;
  description: string;
}

interface Transaction {
  waypointSymbol: string;
  shipSymbol: string;
  tradeSymbol: string;
  type: string;
  units: number;
  pricePerUnit: number;
  totalPrice: number;
  timestamp: string;
}

export interface TradeGood {
  symbol: string;
  tradeVolume: string;
  type: string;
  supply: string;
  purchasePrice: number;
  sellPrice: number;
}

export interface Market {
  symbol: string;
  imports: any[];
  exports: any[]
  exchange: Commodity[]
  transactions: Transaction[]
  tradeGoods: TradeGood[]
}

export interface Inventory {
  symbol: string;
  name: string;
  description: string;
  units: number;
}

  