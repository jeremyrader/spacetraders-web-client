export interface ITrait {
  symbol: string;
  name: string;
  description: string;
}

export interface IFaction {
  symbol: string;
  name: string;
  description: string;
  headquarters: string;
  isRecruiting: boolean;
  traits: ITrait[];
}

export interface IAgent {
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

export interface IContract {
  id: string;
  factionSymbol: string;
  type: string;
  terms: ContractTerms;
  accepted: boolean;
  fulfilled: boolean;
  expiration: string;
  deadlineToAccept: string;
}

export interface IOrbital {
  symbol: string;
}

export interface IWaypoint {
  symbol: string;
  type: string;
  x: number;
  y: number;
  orbitals: IOrbital[]
  traits: ITrait[]
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

export interface IWaypointRender extends IWaypoint {
  renderData: {
    radius: number;
    drawOrbit: boolean;
    x?: number;
    y?: number;
    color1: string;
    color2: string;
  }
  orbitals: IWaypointRender[];
}

export interface ISystem {
  symbol: string;
  type: string;
  x: number;
  y: number;
  waypoints: IWaypoint[]
}

export interface ISystemRender extends ISystem {
  renderData: {
    radius: number;
    color: string;
  }
  waypoints: IWaypointRender[];
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
  symbol: string;
  systemSymbol: string;
  type: string;
  x: number;
  y: number;
}

export interface IShip {
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

export interface IShipRender extends IShip {
  renderData: {
    x: number;
    y: number;
    color: string;
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

export type TWaypointType = 
  | 'PLANET'
  | 'GAS_GIANT'
  | 'MOON'
  | 'ORBITAL_STATION'
  | 'JUMP_GATE'
  | 'ASTEROID_FIELD'
  | 'ASTEROID'
  | 'ENGINEERED_ASTEROID'
  | 'ASTEROID_BASE'
  | 'NEBULA'
  | 'DEBRIS_FIELD'
  | 'GRAVITY_WELL'
  | 'ARTIFICIAL_GRAVITY_WELL'
  | 'FUEL_STATION';

export type TWaypointRenderDataMap = Record<TWaypointType, { radius: number, drawOrbit: boolean}>;