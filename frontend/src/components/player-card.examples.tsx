/**
 * PlayerCard Component Usage Examples
 * 
 * This file demonstrates various ways to use the NBA Player Card component
 */

import { PlayerCard } from "@/components/player-card";

// Example 1: Basic player card with minimal data
export const BasicPlayerExample = () => {
  return (
    <PlayerCard
      id={1}
      name="LeBron James"
      team="Los Angeles Lakers"
      position="Forward"
    />
  );
};

// Example 2: Player card with physical attributes
export const PlayerWithPhysicalAttributesExample = () => {
  return (
    <PlayerCard
      id={2}
      name="Stephen Curry"
      team="Golden State Warriors"
      position="Guard"
      height="6-2"
      weight="185 lbs"
    />
  );
};

// Example 3: Complete player card with statistics
export const CompletePlayerExample = () => {
  return (
    <PlayerCard
      id={3}
      name="Kevin Durant"
      team="Phoenix Suns"
      position="Forward"
      height="6-10"
      weight="240 lbs"
      stats={{
        pointsPerGame: 29.1,
        assistsPerGame: 5.0,
        reboundsPerGame: 6.7,
      }}
    />
  );
};

// Example 4: Grid of multiple player cards
export const PlayerGridExample = () => {
  const players = [
    {
      id: 1,
      name: "LeBron James",
      team: "Los Angeles Lakers",
      position: "Forward",
      height: "6-9",
      weight: "250 lbs",
      stats: { pointsPerGame: 25.7, assistsPerGame: 7.3, reboundsPerGame: 7.3 },
    },
    {
      id: 2,
      name: "Stephen Curry",
      team: "Golden State Warriors",
      position: "Guard",
      height: "6-2",
      weight: "185 lbs",
      stats: { pointsPerGame: 29.4, assistsPerGame: 6.1, reboundsPerGame: 6.3 },
    },
    {
      id: 3,
      name: "Giannis Antetokounmpo",
      team: "Milwaukee Bucks",
      position: "Forward",
      height: "6-11",
      weight: "242 lbs",
      stats: { pointsPerGame: 31.1, assistsPerGame: 5.7, reboundsPerGame: 11.8 },
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {players.map((player) => (
        <PlayerCard key={player.id} {...player} />
      ))}
    </div>
  );
};

// Example 5: Custom styled player card
export const CustomStyledPlayerExample = () => {
  return (
    <PlayerCard
      id={4}
      name="Luka Dončić"
      team="Dallas Mavericks"
      position="Guard"
      height="6-7"
      weight="230 lbs"
      stats={{
        pointsPerGame: 32.4,
        assistsPerGame: 8.6,
        reboundsPerGame: 8.0,
      }}
      className="max-w-sm mx-auto shadow-xl border-2 border-blue-200"
    />
  );
};

// Example 6: Rookie player without stats
export const RookiePlayerExample = () => {
  return (
    <PlayerCard
      id={5}
      name="Victor Wembanyama"
      team="San Antonio Spurs"
      position="Center"
      height="7-4"
      weight="210 lbs"
      stats={{
        pointsPerGame: 0,
        assistsPerGame: 0,
        reboundsPerGame: 0,
      }}
    />
  );
};
