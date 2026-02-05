/**
 * NBA Stadiums Page
 * 
 * Displays NBA stadium information including:
 * - Stadium name and location
 * - Team affiliation
 * - Capacity and opening year
 * - Stadium images
 * 
 * Features:
 * - Server-side data fetching
 * - Responsive card grid layout
 * - Hover effects and animations
 * - Error handling
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Calendar } from "lucide-react";
import Image from "next/image";

interface Stadium {
  id: number;
  name: string;
  team: string;
  location: string;
  capacity: number;
  opened: number;
  imageUrl?: string;
}

interface StadiumsResponse {
  stadiums: Stadium[];
}

async function fetchStadiums(): Promise<Stadium[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    const res = await fetch(`${apiUrl}/api/stadiums`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    const data: StadiumsResponse = await res.json();
    return data.stadiums || [];
  } catch (err) {
    console.error('Error fetching stadiums:', err);
    throw err;
  }
}

export default async function StadiumsPage() {
  let stadiums: Stadium[] = [];
  let error = "";
  
  try {
    stadiums = await fetchStadiums();
  } catch (e: any) {
    error = e.message || "Failed to fetch stadiums data.";
  }

  // Error State
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-red-50 border-red-200 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-700 font-semibold mb-2">Error Loading Stadiums</p>
            <p className="text-red-600 text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Empty State
  if (!stadiums || stadiums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="bg-blue-50 border-blue-200 max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No stadium information available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State - Display Stadiums
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-center bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          NBA Stadiums
        </h1>
        <p className="text-center text-gray-600">
          Explore the iconic arenas of the NBA
        </p>
      </div>

      {/* Stadiums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stadiums.map((stadium) => (
          <Card
            key={stadium.id}
            className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105 hover:-translate-y-2 group cursor-pointer"
          >
            {/* Stadium Image */}
            {stadium.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                <Image
                  src={stadium.imageUrl}
                  alt={stadium.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-2">
                  {stadium.name}
                </CardTitle>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors shrink-0">
                  {stadium.team}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-purple-500" />
                <span className="font-medium">{stadium.location}</span>
              </div>

              {/* Capacity */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-blue-500" />
                <span>
                  <span className="font-semibold text-gray-900">
                    {stadium.capacity.toLocaleString()}
                  </span>{" "}
                  capacity
                </span>
              </div>

              {/* Opened Year */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-green-500" />
                <span>
                  Opened in{" "}
                  <span className="font-semibold text-gray-900">
                    {stadium.opened}
                  </span>
                </span>
              </div>

              {/* Stadium ID - for development */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400">Stadium ID: {stadium.id}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-gray-500">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-12 text-center">
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <p className="text-lg text-gray-700">
              <span className="font-bold text-purple-600">{stadiums.length}</span>{" "}
              NBA stadiums • Total capacity:{" "}
              <span className="font-bold text-purple-600">
                {stadiums.reduce((sum, s) => sum + s.capacity, 0).toLocaleString()}
              </span>{" "}
              fans
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
