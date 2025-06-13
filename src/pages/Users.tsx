import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import userService, { userData } from "@/api/services/UserService";
import DataTable from "@/components/DataTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Users = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<userData[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getAll();
        setUsers(fetchedUsers);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
      }
    };

    fetchUsers();
  }, [toast]);

  const columns = [
    {
      header: "First Name",
      accessorKey: "firstName" as keyof userData,
    },
    {
      header: "Last Name",
      accessorKey: "lastName" as keyof userData,
    },
    {
      header: "Email",
      accessorKey: "email" as keyof userData,
    },
  ];

  const handleEdit = (user: userData) => {
    toast({
      title: "Edit User",
      description: `Editing user: ${user.firstName}`,
    });
  };

  const handleDelete = async(user: userData) => {
    await userService.delete(user.id);
    toast({
      title: "Delete User",
      description: `User ${user.firstName} would be deleted here.`,
      variant: "destructive",
    });
  };

  const handleView = (user: userData) => {
    toast({
      title: "View User Details",
      description: `Viewing details for: ${user.firstName}`,
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
              data={users}
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
