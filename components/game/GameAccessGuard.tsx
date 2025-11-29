"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { checkGameAccessClient } from "@/lib/supabase/gameAccess.client";
import { GameMode } from "@/types/game";

interface GameAccessGuardProps {
  gameCode: string;
  gameMode: GameMode;
  children: React.ReactNode;
}

export function GameAccessGuard({ gameCode, gameMode, children }: GameAccessGuardProps) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validateAccess() {
      setIsValidating(true);
      
      const result = await checkGameAccessClient(gameCode, gameMode);
      
      if (!result.allowed) {
        setIsAllowed(false);
        setError(result.error || 'You do not have access to this game mode');
      } else {
        setIsAllowed(true);
        setError(null);
      }
      
      setIsValidating(false);
    }
    
    validateAccess();
  }, [gameCode, gameMode]);

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <p className="text-muted-foreground">Validating access...</p>
        </div>
      </div>
    );
  }

  if (!isAllowed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertCircle className="h-6 w-6" />
              <CardTitle>Access Denied</CardTitle>
            </div>
            <CardDescription>
              {error || 'This game mode is not available for this session.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => router.push(`/game/${gameCode}`)} 
              className="w-full"
            >
              View Available Games
            </Button>
            <Button 
              onClick={() => router.push('/')} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
