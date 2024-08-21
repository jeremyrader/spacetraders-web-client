'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

  const handleLogin = (event: { preventDefault: () => void }) => {
    event.preventDefault();

    const callsign = inputRef.current?.value;

    if (callsign) {
      const token = window.localStorage.getItem(callsign);
      if (token) {
        router.push(`/dashboard?callsign=${callsign}`);
      } else {
        setLoginStatus('No agent found');
      }
    }
  };

  const handleRegister = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    router.push('/register');
  };

  return (
    <div>
      <div className="flex flex-col space-x-2 mt-4">
        <div className="flex">
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Sign In</span>
            </div>
            <input
              type="text"
              ref={inputRef}
              placeholder="Call sign"
              className="input input-bordered w-full max-w-xs"
            />
          </label>
          <button onClick={handleLogin} className="btn btn-primary">
            Sign In
          </button>
          {loginStatus}
        </div>

        <p className="my-4"> or </p>

        <div>
          <button onClick={handleRegister} className="btn btn-primary">
            Register New Agent
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
