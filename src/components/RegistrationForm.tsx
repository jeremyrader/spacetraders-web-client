"use client";

import { useRef, useState } from 'react';

function RegistrationForm() {
  const [registrationStatus, setRegistrationStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

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
        faction: "COSMIC",
      }),
    };
    
    const response = await fetch('https://api.spacetraders.io/v2/register', options)
    const result = await response.json();

    if (result.data) {
      localStorage.setItem('api-token', result.data.token)
      setRegistrationStatus('Agent successfully registered')
    }
    else {
      console.log('error')
      setRegistrationStatus(`${result.error.message}: ${result.error.data.symbol} `)
    }
  }

  return <div>
    <input 
      ref={inputRef}
      type="text"
      placeholder="Call sign" 
      className="input input-bordered w-full max-w-xs" 
    />
    <button onClick={fetchData} className="btn btn-primary">Register Agent</button>
    <p>{registrationStatus}</p>
    </div>;
}

export default RegistrationForm;
