interface Trait {
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
  }

  interface WaypointWithTraits {
    symbol: string;
    type: string;
    x: number;
    y: number;
    orbitals: Orbital[];
    traits: Trait[];
  }

  interface System {
    symbol: string;
    type: string;
    x: number;
    y: number;
    size: number;
    color: string;
    orbitals: Orbital[]
    waypoints: Waypoint[]
  }