"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import { VocabularyList } from "@/types/game";

interface VocabularyListSelectorProps {
  lists: VocabularyList[];
  selectedListIds: string[];
  onListToggle: (listId: string) => void;
  onLoadSelectedLists: () => void;
  onClearSelection: () => void;
  isLoadingWords: boolean;
  filterToListIds?: string[];
}

export function VocabularyListSelector({
  lists,
  selectedListIds,
  onListToggle,
  onLoadSelectedLists,
  onClearSelection,
  isLoadingWords,
  filterToListIds,
}: VocabularyListSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOnlyClassLists, setShowOnlyClassLists] = useState(true);

  // Determine if we should apply class filter
  const hasClassFilter = filterToListIds !== undefined && filterToListIds.length > 0;
  const shouldApplyClassFilter = hasClassFilter && showOnlyClassLists;
  
  // Count lists in each category
  const classListsCount = hasClassFilter ? lists.filter(list => filterToListIds.includes(list.id)).length : 0;
  const allListsCount = lists.length;

  // Apply filters
  const filteredLists = lists
    .filter(list => {
      // Apply class filter if enabled
      if (shouldApplyClassFilter) {
        return filterToListIds.includes(list.id);
      }
      return true;
    })
    .filter(list =>
      list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (list.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="space-y-4">
      {/* Filter Toggle - Only show if there's a class filter available */}
      {hasClassFilter && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium mr-2">Show:</span>
          <div className="flex gap-2">
            <Button
              variant={showOnlyClassLists ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyClassLists(true)}
            >
              Class Lists Only ({classListsCount})
            </Button>
            <Button
              variant={!showOnlyClassLists ? "default" : "outline"}
              size="sm"
              onClick={() => setShowOnlyClassLists(false)}
            >
              All Lists ({allListsCount})
            </Button>
          </div>
        </div>
      )}

      {/* Info Alert */}
      {shouldApplyClassFilter && (
        <Alert className="border-blue-500/50 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            Showing {filteredLists.length} vocabulary list{filteredLists.length !== 1 ? 's' : ''} assigned to this class
          </AlertDescription>
        </Alert>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vocabulary lists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Selection Summary */}
      {selectedListIds.length > 0 && (
        <Alert className="border-primary/50 bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {selectedListIds.length} list{selectedListIds.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClearSelection}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={onLoadSelectedLists}
                disabled={isLoadingWords}
              >
                {isLoadingWords ? 'Loading...' : 'Load Selected Lists'}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Lists */}
      {filteredLists.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchQuery ? 'No vocabulary lists match your search.' : 'No vocabulary lists found.'}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-2">
            {filteredLists.map((list) => (
              <Card
                key={list.id}
                className={`cursor-pointer transition-all ${
                  selectedListIds.includes(list.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => onListToggle(list.id)}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedListIds.includes(list.id)}
                      onCheckedChange={() => onListToggle(list.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold">{list.name}</h4>
                      {list.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {list.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{list.cards.length} words</span>
                        {list.language && (
                          <span className="capitalize">{list.language}</span>
                        )}
                        <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
