import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardList } from 'lucide-react';
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
import registrationService, { registrationData } from '@/api/services/RegistrationService';

const Registrations = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  

const [registrations, setRegistrations] = useState<registrationData[]>([]);

  useEffect(() => {
    const fetchReagistrations = async () => {
      try {
        const fetchedRegistrations = await registrationService.getAll();
        console.log(fetchedRegistrations);
        setRegistrations(fetchedRegistrations);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
      }
    };

    fetchReagistrations();
  }, [toast]);

    // Fix: Properly type the columns with keyof Registration
  const columns = [
    {
      header: 'RegistrationID',
      accessorKey: 'id' as keyof registrationData,
    },
    {
      header: 'User',
      accessorKey: 'user.firstName' as keyof registrationData,
    },
    {
      header: 'Session',
      accessorKey: 'session.location' as keyof registrationData,
    },
    {
      header: 'Transmission Type',
      accessorKey: 'transmissionType' as keyof registrationData,
    },
    {
      header: 'Session Completed',
      accessorKey: 'completed' as keyof registrationData,
    },
    {
      header: 'Score',
      accessorKey: 'score' as keyof registrationData,
    },
    {
      header: 'Feedback',
      accessorKey: 'feedback' as keyof registrationData,
    },
    {
      header: 'Session paid',
      accessorKey: 'paid' as keyof registrationData,
    },
  ];

  const handleEdit = (registration: registrationData) => {
    toast({
      title: 'Edit Registration',
      description: `Editing registration for user: ${registration.user.firstName}`,
    });
  };

  const handleDelete = (registration: registrationData) => {
    registrationService.delete;
    toast({
      title: 'Delete Registration',
      description: `Registration for ${registration.user.firstName} would be deleted here.`,
      variant: 'destructive',
    });
  };

  const handleView = (registration: registrationData) => {
    toast({
      title: 'View Registration Details',
      description: `Viewing details for registration by: ${registration.user.firstName}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registrations</h2>
          <p className="text-muted-foreground">
            Manage VR driving session registrations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ClipboardList className="mr-2 h-4 w-4" /> New Registration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Registration</DialogTitle>
              <DialogDescription>
                Register a user for a VR driving session
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500">
                Registration form would go here...
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Registration Management</CardTitle>
            <CardDescription>
              View, edit, and manage user registrations for VR driving sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={registrations} 
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

export default Registrations;
