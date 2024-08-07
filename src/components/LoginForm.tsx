"use client";

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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

function LoginForm() {
  const router = useRouter();
  const [registrationStatus, setRegistrationStatus] = useState('');
  const [factions, setFactions] = useState<Faction[]>([])
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null)
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    router.push('/dashboard');
  };

  const handleRegister = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    router.push('/register');
  };

  return <div>
    <div className="flex flex-col space-x-2 mt-4">

    <div className="flex">
      <label className="form-control w-full max-w-xs">
        <div className="label">
          <span className="label-text">Sign In</span>
        </div>
        <input type="text" placeholder="Call sign" className="input input-bordered w-full max-w-xs" />
      </label>
      <button onClick={handleLogin} className="btn btn-primary">Sign In</button>
    </div>

    <p className="my-4"> or </p>

    <div>
      <button onClick={handleRegister} className="btn btn-primary">Register New Agent</button>
    </div>
    
    </div>
  </div>;
}

export default LoginForm;
