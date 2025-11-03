"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Copy, 
  Edit2, 
  Check, 
  X,
  Eye,
  Power,
  PowerOff
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteGameLink,
  updateGameLink,
} from "@/lib/supabase/vocabularyManagement";
import { GameLink } from "@/types/game";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GameLinksTabProps {
  gameLinks: GameLink[];
  onEdit: (link: GameLink) => void;
  onRefresh: () => void;
}

export function GameLinksTab({ gameLinks, onEdit, onRefresh }: GameLinksTabProps) {
  const router = useRouter();
  
  // Edit states
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingLinkName, setEditingLinkName] = useState("");
  
  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  
  // Copy link state
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const handleCopyLink = (code: string, linkId: string) => {
    // Get the full URL including domain
    const fullUrl = `${window.location.origin}/play/${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkId(linkId);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const handleToggleLinkActive = async (linkId: string, currentState: boolean) => {
    try {
      const result = await updateGameLink(linkId, { isActive: !currentState });
      if (result.success) {
        toast.success(`Link ${!currentState ? 'activated' : 'deactivated'} successfully`);
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to update link');
      }
    } catch (error) {
      console.error('Error toggling link:', error);
      toast.error('Failed to update link');
    }
  };

  const handleStartEditLink = (link: GameLink) => {
    setEditingLinkId(link.id);
    setEditingLinkName(link.name);
  };

  const handleSaveEditLink = async (linkId: string) => {
    if (!editingLinkName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      const result = await updateGameLink(linkId, { name: editingLinkName.trim() });
      if (result.success) {
        toast.success('Game link updated');
        setEditingLinkId(null);
        setEditingLinkName("");
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to update link');
      }
    } catch (error) {
      console.error('Error updating link:', error);
      toast.error('Failed to update link');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      const result = await deleteGameLink(deleteConfirm.id);
      if (result.success) {
        toast.success('Game link deleted');
        onRefresh();
      } else {
        toast.error(result.error || 'Failed to delete link');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Failed to delete');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (gameLinks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No game links yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <>
      {gameLinks.map((link) => (
        <Card
          key={link.id}
          className={`border-2 transition-all ${
            link.isActive
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-border bg-muted/50'
          }`}
        >
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {editingLinkId === link.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editingLinkName}
                        onChange={(e) => setEditingLinkName(e.target.value)}
                        className="h-8"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditLink(link.id);
                          if (e.key === 'Escape') setEditingLinkId(null);
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveEditLink(link.id)}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingLinkId(null)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{link.name}</h3>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEditLink(link)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Badge variant={link.isActive ? 'default' : 'secondary'}>
                        {link.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                    <span className="font-mono font-bold text-primary">
                      {link.code}
                    </span>
                    <span>{link.vocabularyList?.name}</span>
                    <span>{link.enabledGames.length} games</span>
                    <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(link.code, link.id)}
                >
                  {copiedLinkId === link.id ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/play/${link.code}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(link)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Games
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleLinkActive(link.id, link.isActive)}
                >
                  {link.isActive ? (
                    <>
                      <PowerOff className="h-4 w-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="h-4 w-4 mr-2" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirm({ id: link.id, name: link.name })}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the game link "{deleteConfirm?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
