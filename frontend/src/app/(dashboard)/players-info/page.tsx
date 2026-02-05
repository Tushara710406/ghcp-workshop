import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerCard } from "@/components/player-card";

interface PlayerStats {
  pointsPerGame?: number;
  assistsPerGame?: number;
  reboundsPerGame?: number;
}

interface PlayerInfo {
  id: number;
  name: string;
  team: string;
  weight: string | number;
  height: string | number;
  position: string;
  stats?: PlayerStats;
}

async function fetchPlayers(): Promise<PlayerInfo[]> {
  try {
    const res = await fetch("http://localhost:8080/api/player-info", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    throw err;
  }
}

export default async function PlayersInfoPage() {
  let players: PlayerInfo[] = [];
  let error = "";
  try {
    players = await fetchPlayers();
  } catch (e: any) {
    error = e.message || "Failed to fetch player info.";
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 text-center">
            <p className="text-red-700 font-semibold">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-blue-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No player information available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          NBA Players Info
        </h1>
        <p className="text-center text-gray-600">
          Explore player statistics and information
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            id={player.id}
            name={player.name}
            team={player.team}
            position={player.position}
            height={String(player.height)}
            weight={String(player.weight)}
            stats={player.stats}
          />
        ))}
      </div>
    </div>
  );
}
