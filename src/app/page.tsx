"use client"

import LoginForm from "@/components/LoginForm";
import { DataProvider } from '../contexts/DataContext';

export default function Home() {
  return (
    <DataProvider>
      <main className="flex min-h-screen flex-col p-24">
        <h1 className="font-bold text-2xl text-center">Space Traders</h1>
        <LoginForm></LoginForm>
      </main>
    </DataProvider>
  );
}
