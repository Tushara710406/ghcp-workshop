/**
 * NBA Player Statistics Page
 * 
 * Displays top NBA players with their statistics:
 * - Player name and team
 * - Points, rebounds, assists per game
 * - Games played
 * 
 * Features:
 * - Client-side data fetching
 * - Sortable table columns
 * - Click column headers to sort
 * - Visual sort indicators
 * - Responsive design
 * - Error handling
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

interface PlayerStat {
  id: number;
  name: string;
  team: string;
  position: string;
  points: number;
  rebounds: number;
  assists: number;
  games: number;
}

interface PlayerStatsResponse {
  playerStats: PlayerStat[];
}

type SortField = "name" | "team" | "points" | "rebounds" | "assists" | "games";
type SortDirection = "asc" | "desc";

export default function PlayerStatsPage() {
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortField, setSortField] = useState<SortField>("points");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Fetch player stats on component mount
  useEffect(() => {
    async function fetchPlayerStats() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const res = await fetch(`${apiUrl}/api/player-stats`, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        const data: PlayerStatsResponse = await res.json();
        setPlayers(data.playerStats || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching player stats:', err);
        setError(err.message || "Failed to fetch player stats data.");
        setLoading(false);
      }
    }

    fetchPlayerStats();
  }, []);

  // Handle column sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New field, default to descending for numbers, ascending for text
      setSortField(field);
      setSortDirection(field === "name" || field === "team" ? "asc" : "desc");
    }
  };

  // Sort players based on current sort field and direction
  const sortedPlayers = [...players].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Get sort icon for column
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />
    );
  };

  // Get position badge color
  const getPositionColor = (position: string) => {
    const colors: Record<string, string> = {
      PG: "bg-blue-100 text-blue-800",
      SG: "bg-green-100 text-green-800",
      SF: "bg-yellow-100 text-yellow-800",
      PF: "bg-orange-100 text-orange-800",
      C: "bg-purple-100 text-purple-800",
    };
    return colors[position] || "bg-gray-100 text-gray-800";
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-blue-50 border-blue-200 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Loading player statistics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-red-50 border-red-200 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-700 font-semibold mb-2">Error Loading Player Stats</p>
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty State
  if (!players || players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-blue-50 border-blue-200 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No player statistics available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate averages
  const avgPoints = (players.reduce((sum, p) => sum + p.points, 0) / players.length).toFixed(1);
  const avgRebounds = (players.reduce((sum, p) => sum + p.rebounds, 0) / players.length).toFixed(1);
  const avgAssists = (players.reduce((sum, p) => sum + p.assists, 0) / players.length).toFixed(1);

  // Success State - Display Player Stats Table
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          NBA Player Statistics
        </h1>
        <p className="text-center text-gray-600">
          Top {players.length} players - Click column headers to sort
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{avgPoints}</p>
            <p className="text-sm text-gray-600">Avg Points Per Game</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{avgRebounds}</p>
            <p className="text-sm text-gray-600">Avg Rebounds Per Game</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold text-purple-600">{avgAssists}</p>
            <p className="text-sm text-gray-600">Avg Assists Per Game</p>
          </CardContent>
        </Card>
      </div>

      {/* Player Stats Table */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Player Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-bold text-gray-700">Rank</TableHead>
                <TableHead
                  className="font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Player
                    {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead
                  className="font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("team")}
                >
                  <div className="flex items-center">
                    Team
                    {getSortIcon("team")}
                  </div>
                </TableHead>
                <TableHead className="font-bold text-gray-700">Position</TableHead>
                <TableHead
                  className="font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors text-right"
                  onClick={() => handleSort("points")}
                >
                  <div className="flex items-center justify-end">
                    PPG
                    {getSortIcon("points")}
                  </div>
                </TableHead>
                <TableHead
                  className="font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors text-right"
                  onClick={() => handleSort("rebounds")}
                >
                  <div className="flex items-center justify-end">
                    RPG
                    {getSortIcon("rebounds")}
                  </div>
                </TableHead>
                <TableHead
                  className="font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors text-right"
                  onClick={() => handleSort("assists")}
                >
                  <div className="flex items-center justify-end">
                    APG
                    {getSortIcon("assists")}
                  </div>
                </TableHead>
                <TableHead
                  className="font-bold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors text-right"
                  onClick={() => handleSort("games")}
                >
                  <div className="flex items-center justify-end">
                    Games
                    {getSortIcon("games")}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPlayers.map((player, index) => (
                <TableRow
                  key={player.id}
                  className="hover:bg-blue-50 transition-colors"
                >
                  <TableCell className="font-medium text-gray-500">
                    #{index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {player.name}
                  </TableCell>
                  <TableCell className="text-gray-700">{player.team}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${getPositionColor(player.position)} text-xs font-semibold`}
                    >
                      {player.position}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-blue-600">
                    {player.points.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {player.rebounds.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-purple-600">
                    {player.assists.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right text-gray-600">
                    {player.games}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          PPG = Points Per Game • RPG = Rebounds Per Game • APG = Assists Per Game
        </p>
      </div>
    </div>
  );
}
