
import { useState } from 'react';
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

interface Registration {
  id: number;
  user: string;
  session: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'unpaid';
  registeredOn: string;
}

const Registrations = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock registration data
  const mockRegistrations: Registration[] = [
    { id: 1, user: 'John Doe', session: 'Beginner VR Driving Course', date: '2023-05-20', status: 'confirmed', paymentStatus: 'paid', registeredOn: '2023-05-10' },
    { id: 2, user: 'Jane Smith', session: 'Highway Navigation Simulation', date: '2023-05-19', status: 'pending', paymentStatus: 'unpaid', registeredOn: '2023-05-12' },
    { id: 3, user: 'Robert Johnson', session: 'Advanced Driving Techniques', date: '2023-05-18', status: 'completed', paymentStatus: 'paid', registeredOn: '2023-05-05' },
    { id: 4, user: 'Sarah Williams', session: 'Emergency Response Driving', date: '2023-05-22', status: 'confirmed', paymentStatus: 'paid', registeredOn: '2023-05-15' },
    { id: 5, user: 'Michael Brown', session: 'Night Driving Simulation', date: '2023-05-17', status: 'cancelled', paymentStatus: 'paid', registeredOn: '2023-05-08' },
    { id: 6, user: 'Emily Davis', session: 'Defensive Driving Course', date: '2023-05-25', status: 'confirmed', paymentStatus: 'unpaid', registeredOn: '2023-05-14' },
    { id: 7, user: 'David Miller', session: 'Race Track Experience', date: '2023-05-21', status: 'pending', paymentStatus: 'unpaid', registeredOn: '2023-05-16' },
  ];

  // Fix: Properly type the columns with keyof Registration
  const columns = [
    {
      header: 'User',
      accessorKey: 'user' as keyof Registration,
    },
    {
      header: 'Session',
      accessorKey: 'session' as keyof Registration,
    },
    {
      header: 'Date',
      accessorKey: 'date' as keyof Registration,
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof Registration,
      cell: (registration: Registration) => {
        const statusStyles = {
          'pending': 'bg-yellow-100 text-yellow-800',
          'confirmed': 'bg-green-100 text-green-800',
          'cancelled': 'bg-red-100 text-red-800',
          'completed': 'bg-gray-100 text-gray-800',
        };
        
        return (
          <Badge className={`${statusStyles[registration.status]}`}>
            {registration.status.charAt(0).toUpperCase() + registration.status.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: 'Payment',
      accessorKey: 'paymentStatus' as keyof Registration,
      cell: (registration: Registration) => {
        const paymentStyles = {
          'paid': 'bg-blue-100 text-blue-800',
          'unpaid': 'bg-orange-100 text-orange-800',
        };
        
        return (
          <Badge className={`${paymentStyles[registration.paymentStatus]}`}>
            {registration.paymentStatus.charAt(0).toUpperCase() + registration.paymentStatus.slice(1)}
          </Badge>
        );
      },
    },
    {
      header: 'Registered On',
      accessorKey: 'registeredOn' as keyof Registration,
    },
  ];

  const handleEdit = (registration: Registration) => {
    toast({
      title: 'Edit Registration',
      description: `Editing registration for user: ${registration.user}`,
    });
  };

  const handleDelete = (registration: Registration) => {
    toast({
      title: 'Delete Registration',
      description: `Registration for ${registration.user} would be deleted here.`,
      variant: 'destructive',
    });
  };

  const handleView = (registration: Registration) => {
    toast({
      title: 'View Registration Details',
      description: `Viewing details for registration by: ${registration.user}`,
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
              data={mockRegistrations} 
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
