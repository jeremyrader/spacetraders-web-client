'use client'

import { DataProvider } from '../contexts/DataContext';
import LoginForm from "@/components/LoginForm";
import Navbar from '@/components/Navbar';



export default function Home() {

  const callsign = localStorage.getItem('callsign')

  return (
    <DataProvider>
      <Navbar></Navbar>
      <main className="flex min-h-screen flex-col p-24">
        <h1 className="font-bold text-2xl text-center">Space Traders</h1>
        {
          !callsign ? (
            <LoginForm></LoginForm>
          ) : (
            <div>Signed in</div>
          )
          
        }
      </main>
    </DataProvider>
  );
}
