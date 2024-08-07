"use client";

import { useRouter, useSearchParams } from 'next/navigation';

function RegistrationForm() {
  const searchParams = useSearchParams();

  const callsign = searchParams.get('callsign')

  if (callsign) {
    const token = localStorage.getItem(callsign)
    console.log(token)
  }
  
 
  return <main className="flex min-h-screen flex-col p-24">
    Dashboard
  </main>;
}

export default RegistrationForm;
