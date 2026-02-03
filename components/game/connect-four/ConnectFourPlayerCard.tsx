"use client";

interface ConnectFourPlayerCardProps {
  player: 1 | 2;
  isActive: boolean;
  discsPlaced: number;
}

export function ConnectFourPlayerCard({
  player,
  isActive,
  discsPlaced
}: ConnectFourPlayerCardProps) {
  const playerColor = player === 1 ? 'red' : 'yellow';
  const bgColor = player === 1 
    ? 'from-red-500/20 to-red-600/20' 
    : 'from-yellow-500/20 to-yellow-600/20';
  const borderColor = player === 1 ? 'border-red-500' : 'border-yellow-500';
  const discColor = player === 1
    ? 'bg-gradient-to-br from-red-400 to-red-600'
    : 'bg-gradient-to-br from-yellow-300 to-yellow-500';

  return (
    <div
      className={`relative p-2 rounded-lg border-2 transition-all ${
        isActive
          ? `${borderColor} bg-gradient-to-br ${bgColor} shadow-lg scale-105`
          : 'border-gray-300 bg-gray-50'
      }`}
    >
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      )}

      <div className="flex items-center gap-1.5">
        {/* Player disc */}
        <div className={`w-8 h-8 rounded-full shadow-lg ${discColor}`} />

        {/* Player info */}
        <div className="flex-1">
          <h3 className="font-bold text-sm">
            P{player}
          </h3>
          <p className="text-xs text-muted-foreground">
            {discsPlaced} disc{discsPlaced !== 1 ? 's' : ''}
          </p>
        </div>

        {isActive && (
          <div className="text-xs font-semibold text-primary">
            Turn
          </div>
        )}
      </div>
    </div>
  );
}
