/**
 * NBA Player Card Component
 * 
 * Features:
 * - Player information display (name, team, position)
 * - Player statistics (points, assists, rebounds per game)
 * - Hover effects with smooth transitions
 * - Responsive design
 * - Physical attributes (height, weight)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlayerStats {
  pointsPerGame?: number;
  assistsPerGame?: number;
  reboundsPerGame?: number;
}

interface PlayerCardProps {
  id: number;
  name: string;
  team: string;
  position: string;
  height?: string;
  weight?: string;
  stats?: PlayerStats;
  className?: string;
}

export const PlayerCard = ({
  id,
  name,
  team,
  position,
  height,
  weight,
  stats,
  className,
}: PlayerCardProps) => {
  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-in-out",
        "hover:shadow-2xl hover:scale-105 hover:-translate-y-2",
        "hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-white",
        "cursor-pointer group",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {name}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">{team}</p>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
          >
            {position}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Physical Attributes */}
        {(height || weight) && (
          <div className="flex gap-4 text-sm">
            {height && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Height:</span>
                <span className="font-semibold text-gray-700">{height}</span>
              </div>
            )}
            {weight && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">Weight:</span>
                <span className="font-semibold text-gray-700">{weight}</span>
              </div>
            )}
          </div>
        )}

        {/* Player Statistics */}
        {stats && (
          <div className="pt-3 border-t border-gray-200">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Season Stats
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {/* Points Per Game */}
              <div className="text-center p-2 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.pointsPerGame?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PPG</p>
              </div>

              {/* Assists Per Game */}
              <div className="text-center p-2 rounded-lg bg-gray-50 group-hover:bg-green-50 transition-colors">
                <p className="text-2xl font-bold text-green-600">
                  {stats.assistsPerGame?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">APG</p>
              </div>

              {/* Rebounds Per Game */}
              <div className="text-center p-2 rounded-lg bg-gray-50 group-hover:bg-purple-50 transition-colors">
                <p className="text-2xl font-bold text-purple-600">
                  {stats.reboundsPerGame?.toFixed(1) || '0.0'}
                </p>
                <p className="text-xs text-gray-500 mt-1">RPG</p>
              </div>
            </div>
          </div>
        )}

        {/* Player ID - for development/debugging */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">Player ID: {id}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-500">Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
