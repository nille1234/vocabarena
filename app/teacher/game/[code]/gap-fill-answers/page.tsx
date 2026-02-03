import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getGameLinkByCode } from "@/lib/supabase/vocabularyManagement";
import { GapFillAnswerKey } from "@/components/teacher/GapFillAnswerKey";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function GapFillAnswersPage({
  params,
}: {
  params: { code: string };
}) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get game link
  const gameLink = await getGameLinkByCode(params.code);

  if (!gameLink) {
    redirect("/teacher");
  }

  // Verify user owns this game link
  const { data: linkOwner } = await supabase
    .from("game_links")
    .select("user_id")
    .eq("code", params.code)
    .single();

  if (!linkOwner || linkOwner.user_id !== user.id) {
    redirect("/teacher");
  }

  // Check if gap-fill is enabled
  if (!gameLink.enabledGames.includes("gap-fill")) {
    redirect("/teacher");
  }

  const vocabulary = gameLink.vocabularyList?.cards || [];
  const gapCount = gameLink.gapFillGapCount || 15;
  const summaryLength = gameLink.gapFillSummaryLength || 250;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <div className="mb-6">
          <Link href="/teacher">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Game info */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{gameLink.name}</h1>
          <p className="text-muted-foreground">
            Code: <span className="font-mono font-semibold">{params.code}</span>
            {" • "}
            Vocabulary List: {gameLink.vocabularyList?.name}
          </p>
        </div>

        {/* Answer key */}
        <GapFillAnswerKey
          vocabulary={vocabulary}
          gapCount={gapCount}
          summaryLength={summaryLength}
        />
      </div>
    </div>
  );
}
