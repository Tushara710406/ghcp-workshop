/**
 * NBA Teams Page
 * 
 * Displays NBA teams information including:
 * - Team name
 * - City
 * - Conference (Eastern/Western)
 * 
 * Features:
 * - Client-side data fetching
 * - Real-time search filtering by name or city
 * - Responsive card grid layout
 * - Conference-based color coding
 * - Hover effects and animations
 * - Error handling
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Trophy, Search, X } from "lucide-react";

interface Team {
  id: number;
  name: string;
  city: string;
  conference: string;
}

interface TeamsResponse {
  teams: Team[];
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch teams on component mount
  useEffect(() => {
    async function fetchTeams() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const res = await fetch(`${apiUrl}/api/teams`, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        
        const data: TeamsResponse = await res.json();
        setTeams(data.teams || []);
        setLoading(false);
      } catch (err: any) {
        console.error('Error fetching teams:', err);
        setError(err.message || "Failed to fetch teams data.");
        setLoading(false);
      }
    }

    fetchTeams();
  }, []);

  // Filter teams based on search query
  const filteredTeams = teams.filter((team) => {
    const query = searchQuery.toLowerCase();
    return (
      team.name.toLowerCase().includes(query) ||
      team.city.toLowerCase().includes(query)
    );
  });

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-blue-50 border-blue-200 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Loading teams...</p>
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
            <p className="text-red-700 font-semibold mb-2">Error Loading Teams</p>
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty State
  if (!teams || teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-blue-50 border-blue-200 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No teams information available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Helper function to get conference colors
  const getConferenceColors = (conference: string) => {
    return conference === "Eastern"
      ? {
          badge: "bg-blue-100 text-blue-800 hover:bg-blue-200",
          gradient: "from-blue-500 to-indigo-500",
          icon: "text-blue-500",
        }
      : {
          badge: "bg-orange-100 text-orange-800 hover:bg-orange-200",
          gradient: "from-orange-500 to-red-500",
          icon: "text-orange-500",
        };
  };

  // Separate filtered teams by conference
  const easternTeams = filteredTeams.filter((t) => t.conference === "Eastern");
  const westernTeams = filteredTeams.filter((t) => t.conference === "Western");

  // Success State - Display Teams
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
          NBA Teams
        </h1>
        <p className="text-center text-gray-600">
          All {teams.length} teams across Eastern and Western conferences
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search teams by name or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-6 text-lg border-2 focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-2 text-center">
            Found {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        )}
      </div>

      {/* Conference Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-blue-600">{easternTeams.length}</p>
            <p className="text-sm text-gray-600">Eastern Conference</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <p className="text-2xl font-bold text-orange-600">{westernTeams.length}</p>
            <p className="text-sm text-gray-600">Western Conference</p>
          </CardContent>
        </Card>
      </div>

      {/* No Results Message */}
      {filteredTeams.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Card className="bg-gray-50 border-gray-200 max-w-md mx-auto">
            <CardContent className="p-8">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 font-semibold mb-2">No teams found</p>
              <p className="text-gray-500 text-sm">
                Try searching with a different team name or city
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Eastern Conference Section */}
      {easternTeams.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Eastern Conference ({easternTeams.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {easternTeams.map((team) => {
            const colors = getConferenceColors(team.conference);
            return (
              <Card
                key={team.id}
                className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 group cursor-pointer border-blue-200"
              >
                {/* Team Header with Gradient */}
                <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {team.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* City */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className={`w-4 h-4 ${colors.icon}`} />
                    <span className="font-medium">{team.city}</span>
                  </div>

                  {/* Conference Badge */}
                  <div className="pt-2">
                    <Badge
                      variant="secondary"
                      className={`${colors.badge} transition-colors text-xs`}
                    >
                      {team.conference} Conference
                    </Badge>
                  </div>

                  {/* Team ID */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Team ID: {team.id}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      )}

      {/* Western Conference Section */}
      {westernTeams.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-orange-600 flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Western Conference ({westernTeams.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {westernTeams.map((team) => {
            const colors = getConferenceColors(team.conference);
            return (
              <Card
                key={team.id}
                className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-105 group cursor-pointer border-orange-200"
              >
                {/* Team Header with Gradient */}
                <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                    {team.name}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* City */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className={`w-4 h-4 ${colors.icon}`} />
                    <span className="font-medium">{team.city}</span>
                  </div>

                  {/* Conference Badge */}
                  <div className="pt-2">
                    <Badge
                      variant="secondary"
                      className={`${colors.badge} transition-colors text-xs`}
                    >
                      {team.conference} Conference
                    </Badge>
                  </div>

                  {/* Team ID */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">Team ID: {team.id}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
