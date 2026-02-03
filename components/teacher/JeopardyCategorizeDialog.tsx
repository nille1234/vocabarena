'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VocabCard } from '@/types/game';
import { parseCategoryText, validateCategoryAssignments } from '@/lib/utils/jeopardyCategoryParser';
import { toast } from 'sonner';
import { Sparkles, FileText, Loader2 } from 'lucide-react';

interface JeopardyCategorizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cards: VocabCard[];
  onApply: (assignments: { [term: string]: string }) => void;
}

export function JeopardyCategorizeDialog({
  open,
  onOpenChange,
  cards,
  onApply,
}: JeopardyCategorizeDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [preview, setPreview] = useState<{ [category: string]: string[] } | null>(null);

  const handleAIGenerate = async () => {
    if (cards.length < 25) {
      toast.error('Need at least 25 words for Jeopardy categorization');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/categorize-vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: cards.map(c => ({ term: c.term, definition: c.definition })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to categorize');
      }

      const { assignments } = await response.json();
      
      // Validate
      const error = validateCategoryAssignments(assignments, cards.length);
      if (error) {
        toast.error(error);
        return;
      }

      // Create preview
      const categoryMap: { [category: string]: string[] } = {};
      for (const [term, category] of Object.entries(assignments)) {
        const cat = category as string;
        if (!categoryMap[cat]) {
          categoryMap[cat] = [];
        }
        categoryMap[cat].push(term);
      }
      setPreview(categoryMap);
      toast.success('Categories generated successfully!');
    } catch (error) {
      console.error('Error generating categories:', error);
      toast.error('Failed to generate categories');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleParsePasted = () => {
    if (!pastedText.trim()) {
      toast.error('Please paste category text');
      return;
    }

    const availableTerms = cards.map(c => c.term);
    const assignments = parseCategoryText(pastedText, availableTerms);

    // Validate
    const error = validateCategoryAssignments(assignments, cards.length);
    if (error) {
      toast.error(error);
      return;
    }

    // Create preview
    const categoryMap: { [category: string]: string[] } = {};
    for (const [term, category] of Object.entries(assignments)) {
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push(term);
    }
    setPreview(categoryMap);
    toast.success('Categories parsed successfully!');
  };

  const handleApply = () => {
    if (!preview) return;

    // Convert preview back to assignments
    const assignments: { [term: string]: string } = {};
    for (const [category, terms] of Object.entries(preview)) {
      for (const term of terms) {
        assignments[term] = category;
      }
    }

    onApply(assignments);
    onOpenChange(false);
    toast.success('Categories applied to vocabulary list');
  };

  const handleClear = () => {
    setPreview(null);
    setPastedText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Categorize for Jeopardy</DialogTitle>
          <DialogDescription>
            Create 5 thematic categories for your vocabulary words. Categories make the game more engaging!
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="paste">
              <FileText className="w-4 h-4 mr-2" />
              Paste from ChatGPT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                AI will analyze your {cards.length} words and create 5 meaningful thematic categories automatically.
              </p>
              <Button
                onClick={handleAIGenerate}
                disabled={isGenerating || cards.length < 25}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Categories...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Categories with AI
                  </>
                )}
              </Button>
              {cards.length < 25 && (
                <p className="text-sm text-destructive mt-2">
                  Need at least 25 words (currently have {cards.length})
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="paste" className="space-y-4">
            <div className="space-y-2">
              <Label>Paste Categories from ChatGPT</Label>
              <Textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Category 1: Thinking & Understanding
comprehend
conceive
grasp

Category 2: Expression & Communication
articulate
emphasise
...`}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Format: Category name on one line, followed by words (one per line)
              </p>
            </div>
            <Button onClick={handleParsePasted} className="w-full">
              Parse Categories
            </Button>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        {preview && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Preview Categories</h3>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
            <div className="grid gap-3">
              {Object.entries(preview).map(([category, terms]) => (
                <div key={category} className="bg-muted/50 p-3 rounded-lg">
                  <h4 className="font-medium mb-2">{category}</h4>
                  <p className="text-sm text-muted-foreground">
                    {terms.length} words: {terms.slice(0, 5).join(', ')}
                    {terms.length > 5 && ` +${terms.length - 5} more`}
                  </p>
                </div>
              ))}
            </div>
            <Button onClick={handleApply} className="w-full" size="lg">
              Apply Categories
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
