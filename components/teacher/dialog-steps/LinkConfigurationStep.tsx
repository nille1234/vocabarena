"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Copy, Check, Eye } from "lucide-react";
import { toast } from "sonner";

interface LinkConfigurationStepProps {
  linkName: string;
  onLinkNameChange: (name: string) => void;
  generatedCode: string;
  generatedLink: string;
  
  // Summary data
  vocabularyName: string;
  wordCount: number;
  selectedGamesCount: number;
}

export function LinkConfigurationStep({
  linkName,
  onLinkNameChange,
  generatedCode,
  generatedLink,
  vocabularyName,
  wordCount,
  selectedGamesCount,
}: LinkConfigurationStepProps) {
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {!generatedLink ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="linkName">Game Link Name *</Label>
            <Input
              id="linkName"
              placeholder="e.g., Week 5 Practice, Medical Vocab Quiz"
              value={linkName}
              onChange={(e) => onLinkNameChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This name helps you identify the link in your dashboard
            </p>
          </div>

          <Card className="border-border/50 bg-muted/50">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3">Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vocabulary:</span>
                  <span className="font-medium">{vocabularyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Words:</span>
                  <span className="font-medium">{wordCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Games:</span>
                  <span className="font-medium">{selectedGamesCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="space-y-4">
          <Alert className="border-green-500/50 bg-green-500/10">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Game link created successfully!
            </AlertDescription>
          </Alert>

          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Game Code</Label>
                  <p className="text-2xl font-bold font-mono text-primary">{generatedCode}</p>
                </div>
                
                <div>
                  <Label className="text-xs text-muted-foreground">Shareable Link</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                    >
                      {linkCopied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Share this link path with your students, or use the Preview button below to test it. Students will only see the games you selected.
                </p>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    router.push(generatedLink);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Student View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
