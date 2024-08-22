'use client';

import { useState, useEffect, use } from 'react';

import { DataProvider } from '../contexts/DataContext';
import LoginForm from '@/components/LoginForm';
import Navbar from '@/components/Navbar';
import ServerStatusCard from '@/components/ServerStatusCard';
import AnnouncementsCard from '@/components/AnnouncementsCard';
import LinksCard from '@/components/LinksCard';
import StatsCard from '@/components/StatsCard';
import LeaderboardCard from '@/components/LeaderBoardCard';
import AgentCard from '@/components/AgentCard';

import { fetchResource } from '@/utils/v2';

import { IServerStatus, IAgent } from '@/types';

export default function Home() {
  const [status, setStatus] = useState<IServerStatus | null>(null);
  const [agent, setAgent] = useState<IAgent | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const callsign = window.localStorage.getItem('callsign');
    setLoggedIn(!!callsign);
  }, []);

  useEffect(() => {
    async function getStatus() {
      const status = await fetchResource('');
      setStatus(status);
    }
    getStatus();
  }, []);

  useEffect(() => {
    async function fetchAgent() {
      const result = await fetchResource('my/agent');

      if (result.data) {
        setAgent(result.data);
      }
    }

    fetchAgent();
  }, []);

  return (
    <DataProvider>
      <Navbar></Navbar>
      <main className="flex min-h-screen flex-col p-24">
        {!loggedIn ? (
          <LoginForm></LoginForm>
        ) : (
          <div className="flex w-full">
            <div className="flex flex-col w-1/3 p-4">
              {status && (
                <ServerStatusCard
                  status={status.status}
                  version={status.version}
                  lastResetDate={status.resetDate}
                  nextResetDate={status.serverResets.next}
                />
              )}
              {status && (
                <AnnouncementsCard announcements={status.announcements} />
              )}
              {status && <LinksCard links={status.links} />}
            </div>

            <div className="divider divider-horizontal"></div>

            <div className="flex flex-col w-2/3 p-4">
              {agent && <AgentCard agent={agent} />}
              {status && <LeaderboardCard leaderBoards={status.leaderboards} />}
              {status && <StatsCard stats={status.stats} />}
            </div>
          </div>
        )}
      </main>
    </DataProvider>
  );
}
