"use client";

import { useRef, useState, useEffect } from 'react';

function RegistrationForm() {
  const [registrationStatus, setRegistrationStatus] = useState('');
  const [factions, setFactions] = useState<Faction[]>([])
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null)
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchFactions() {

      const response = await fetch('https://api.spacetraders.io/v2/factions', {
        headers: {
          'Content-Type': 'application/json',
        },
      }
)
      const result = await response.json();

      setFactions(result.data);
      setSelectedFaction(result.data[0])
    }
    fetchFactions();
  }, []);

  async function fetchData() {
    const inputValue = inputRef.current?.value;

    if (!inputValue) {
      setRegistrationStatus('Input value is empty');
      return;
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: inputValue,
        faction: selectedFaction?.symbol,
      }),
    };
    
    const response = await fetch('https://api.spacetraders.io/v2/register', options)
    const result = await response.json();

    if (result.data) {
      localStorage.setItem('callsign', result.data.agent.symbol)
      localStorage.setItem(result.data.agent.symbol, result.data.token)
      setRegistrationStatus('Agent successfully registered')
    }
    else {
      console.log('error')
      setRegistrationStatus(`${result.error.message}: ${result.error.data.symbol} `)
    }
  }

  return <div>
    <main className="flex min-h-screen flex-col p-24">
      <div className="flex flex-row">
        <div>
          {
            factions ? (
              <ul className="menu bg-base-200 rounded-box w-56">
              {
                factions.map((faction, index) => (
                  <li key={index}>
                    <p onClick={() => { setSelectedFaction(faction)} }>{faction.name}</p>
                  </li>
                ))
              }
            </ul>
            ) : null
          }
        </div>
        {
          selectedFaction ? (
            <div className="p-4">
              <h2 className="font-bold text-xl mb-2">{selectedFaction.name}</h2>
              <p>{selectedFaction.description}</p>

              { selectedFaction.isRecruiting? (
                  <p className="mt-4">This faction is currently recruiting.</p>
                ): null
              }

              <h2 className="mt-4 font-bold text-xl mb-2">Traits</h2>
              <ul>
                {
                  selectedFaction.traits.map((trait, index) => (
                    <div key={index}>
                      {/* <p>{trait.symbol}</p> */}
                      <p className="font-bold my-2">{trait.name}</p>
                      <p>{trait.description}</p>
                    </div>
                  ))
                }
              </ul>
              <div className="flex space-x-2 mt-4">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Call sign" 
                  className="input input-bordered w-full max-w-xs" 
                />
                <button onClick={fetchData} className="btn btn-primary">Register Agent with {selectedFaction.name}</button>
                <p>{registrationStatus}</p>
              </div>
            </div>
          ) : null
        }
        
      </div>
    </main>
  </div>;
}

export default RegistrationForm;
