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
import { UserProfile } from "@/lib/supabase/userManagement";
import { UserPlus, Shield, User, CheckCircle, AlertCircle, Mail, Clock } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserManagementTabProps {
  users: UserProfile[];
  currentUserId: string;
  onInviteTeacher: () => void;
}

export function UserManagementTab({ users, currentUserId, onInviteTeacher }: UserManagementTabProps) {
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {userList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
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
  );
}
