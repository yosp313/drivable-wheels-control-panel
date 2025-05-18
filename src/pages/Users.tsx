
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'pending';
  registrations: number;
  lastLogin: string;
}

const Users = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock user data
  const mockUsers: User[] = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', status: 'active', registrations: 5, lastLogin: '2023-05-18 09:30 AM' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', status: 'active', registrations: 3, lastLogin: '2023-05-17 02:15 PM' },
    { id: 3, name: 'Robert Johnson', email: 'robert.j@example.com', status: 'inactive', registrations: 0, lastLogin: '2023-04-22 11:45 AM' },
    { id: 4, name: 'Sarah Williams', email: 'sarah.w@example.com', status: 'pending', registrations: 2, lastLogin: 'Never' },
    { id: 5, name: 'Michael Brown', email: 'michael.b@example.com', status: 'active', registrations: 8, lastLogin: '2023-05-18 10:00 AM' },
    { id: 6, name: 'Emily Davis', email: 'emily.d@example.com', status: 'active', registrations: 4, lastLogin: '2023-05-16 03:20 PM' },
    { id: 7, name: 'David Miller', email: 'david.m@example.com', status: 'inactive', registrations: 1, lastLogin: '2023-03-05 09:10 AM' },
  ];

  // Fix: Properly type the columns with keyof User
  const columns = [
    {
      header: 'Name',
      accessorKey: 'name' as keyof User,
    },
    {
      header: 'Email',
      accessorKey: 'email' as keyof User,
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof User,
      cell: (user: User) => {
        const statusStyles = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-gray-100 text-gray-800',
          pending: 'bg-yellow-100 text-yellow-800',
        };
        
        return (
          <Badge className={`${statusStyles[user.status]}`}>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: 'Registrations',
      accessorKey: 'registrations' as keyof User,
    },
    {
      header: 'Last Login',
      accessorKey: 'lastLogin' as keyof User,
    },
  ];

  const handleEdit = (user: User) => {
    toast({
      title: 'Edit User',
      description: `Editing user: ${user.name}`,
    });
  };

  const handleDelete = (user: User) => {
    toast({
      title: 'Delete User',
      description: `User ${user.name} would be deleted here.`,
      variant: 'destructive',
    });
  };

  const handleView = (user: User) => {
    toast({
      title: 'View User Details',
      description: `Viewing details for: ${user.name}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            Manage users registered in the Drivable VR system
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account in the system
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500">
                User creation form would go here...
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View, edit, and manage system users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={mockUsers} 
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Users;
