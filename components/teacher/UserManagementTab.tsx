"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { UserProfile, deleteUser } from "@/lib/supabase/userManagement";
import { UserPlus, Shield, User, CheckCircle, AlertCircle, Mail, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface UserManagementTabProps {
  users: UserProfile[];
  currentUserId: string;
  onInviteTeacher: () => void;
  onUserDeleted?: () => void;
}

export function UserManagementTab({ users, currentUserId, onInviteTeacher, onUserDeleted }: UserManagementTabProps) {
  const { toast } = useToast();
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Separate users into active and pending
  const { activeUsers, pendingInvites } = useMemo(() => {
    const active: UserProfile[] = [];
    const pending: UserProfile[] = [];
    
    users.forEach(user => {
      // Consider a user "pending" if they haven't signed in yet or need to change password
      if (!user.lastSignInAt || user.passwordChangeRequired) {
        pending.push(user);
      } else {
        active.push(user);
      }
    });
    
    return { activeUsers: active, pendingInvites: pending };
  }, [users]);

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteUser(userToDelete.id);
      
      if (result.success) {
        toast({
          title: "User deleted",
          description: `${userToDelete.email} has been removed from the system.`,
        });
        setUserToDelete(null);
        onUserDeleted?.();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isPendingInvite = (user: UserProfile) => {
    return !user.lastSignInAt || user.passwordChangeRequired;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Users Yet</h3>
        <p className="text-muted-foreground mb-4">
          Start by inviting teachers to the platform
        </p>
        <Button onClick={onInviteTeacher}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Teacher
        </Button>
      </div>
    );
  }

  const renderUserTable = (userList: UserProfile[], showInviteStatus: boolean = false) => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Sign In</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                {showInviteStatus ? 'No pending invitations' : 'No active users'}
              </TableCell>
            </TableRow>
          ) : (
            userList.map((user) => (
              <TableRow key={user.id} className={showInviteStatus ? 'bg-orange-50/50' : ''}>
                <TableCell className="font-medium">
                  {user.email}
                  {user.id === currentUserId && (
                    <Badge variant="outline" className="ml-2">
                      You
                    </Badge>
                  )}
                  {showInviteStatus && !user.lastSignInAt && (
                    <Badge variant="outline" className="ml-2 text-orange-600 border-orange-600">
                      <Mail className="mr-1 h-3 w-3" />
                      Not Logged In
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'super_admin' ? 'default' : 'secondary'}>
                    {user.role === 'super_admin' ? (
                      <>
                        <Shield className="mr-1 h-3 w-3" />
                        Super Admin
                      </>
                    ) : (
                      <>
                        <User className="mr-1 h-3 w-3" />
                        Teacher
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.passwordChangeRequired ? (
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Password Change Required
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(user.createdAt, 'MMM d, yyyy')}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {user.lastSignInAt ? format(user.lastSignInAt, 'MMM d, yyyy HH:mm') : (
                    <span className="text-orange-600 font-medium">Never</span>
                  )}
                </TableCell>
                <TableCell>
                  {user.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserToDelete(user)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">
                        {isPendingInvite(user) ? 'Cancel invite' : 'Delete user'}
                      </span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={onInviteTeacher}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Teacher
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              Active ({activeUsers.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Invites ({pendingInvites.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {renderUserTable(users)}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Users who have logged in and completed setup
            </div>
            {renderUserTable(activeUsers)}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-2">
              Invited users who haven't logged in yet or need to change their password
            </div>
            {renderUserTable(pendingInvites, true)}
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {userToDelete && isPendingInvite(userToDelete) 
                ? 'Cancel Invitation' 
                : 'Delete User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete && isPendingInvite(userToDelete) ? (
                <>
                  Are you sure you want to cancel the invitation for{' '}
                  <span className="font-semibold">{userToDelete.email}</span>?
                  <br /><br />
                  This will remove the pending invitation and the user will not be able to access the system.
                </>
              ) : (
                <>
                  Are you sure you want to delete{' '}
                  <span className="font-semibold">{userToDelete?.email}</span>?
                  <br /><br />
                  <span className="text-destructive font-semibold">This action cannot be undone.</span>
                  {' '}This will permanently delete the user account and all associated data including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Vocabulary lists</li>
                    <li>Game links</li>
                    <li>All other user data</li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : (userToDelete && isPendingInvite(userToDelete) ? 'Cancel Invite' : 'Delete User')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
