
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Calendar } from 'lucide-react';
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

interface Session {
  id: number;
  name: string;
  type: string;
  date: string;
  time: string;
  duration: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  capacity: number;
  registered: number;
}

const Sessions = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Mock session data
  const mockSessions: Session[] = [
    { id: 1, name: 'Beginner VR Driving Course', type: 'Training', date: '2023-05-20', time: '09:00 AM', duration: '90 min', status: 'scheduled', capacity: 10, registered: 8 },
    { id: 2, name: 'Highway Navigation Simulation', type: 'Simulation', date: '2023-05-19', time: '02:00 PM', duration: '60 min', status: 'in-progress', capacity: 8, registered: 7 },
    { id: 3, name: 'Advanced Driving Techniques', type: 'Training', date: '2023-05-18', time: '10:30 AM', duration: '120 min', status: 'completed', capacity: 12, registered: 9 },
    { id: 4, name: 'Emergency Response Driving', type: 'Certification', date: '2023-05-22', time: '01:00 PM', duration: '180 min', status: 'scheduled', capacity: 6, registered: 4 },
    { id: 5, name: 'Night Driving Simulation', type: 'Simulation', date: '2023-05-17', time: '07:00 PM', duration: '90 min', status: 'completed', capacity: 8, registered: 8 },
    { id: 6, name: 'Defensive Driving Course', type: 'Training', date: '2023-05-25', time: '11:00 AM', duration: '120 min', status: 'scheduled', capacity: 15, registered: 7 },
    { id: 7, name: 'Race Track Experience', type: 'Advanced', date: '2023-05-21', time: '03:30 PM', duration: '150 min', status: 'scheduled', capacity: 5, registered: 5 },
  ];

  // Fix: Properly type the columns with keyof Session
  const columns = [
    {
      header: 'Name',
      accessorKey: 'name' as keyof Session,
    },
    {
      header: 'Type',
      accessorKey: 'type' as keyof Session,
    },
    {
      header: 'Date',
      accessorKey: 'date' as keyof Session,
    },
    {
      header: 'Time',
      accessorKey: 'time' as keyof Session,
    },
    {
      header: 'Status',
      accessorKey: 'status' as keyof Session,
      cell: (session: Session) => {
        const statusStyles = {
          'scheduled': 'bg-blue-100 text-blue-800',
          'in-progress': 'bg-green-100 text-green-800',
          'completed': 'bg-gray-100 text-gray-800',
          'cancelled': 'bg-red-100 text-red-800',
        };
        
        const statusLabel = session.status.split('-').map(
          word => word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return (
          <Badge className={`${statusStyles[session.status]}`}>
            {statusLabel}
          </Badge>
        );
      },
    },
    {
      header: 'Registrations',
      accessorKey: 'registered' as keyof Session,
      cell: (session: Session) => (
        <span>{session.registered} / {session.capacity}</span>
      ),
    },
  ];

  const handleEdit = (session: Session) => {
    toast({
      title: 'Edit Session',
      description: `Editing session: ${session.name}`,
    });
  };

  const handleDelete = (session: Session) => {
    toast({
      title: 'Delete Session',
      description: `Session ${session.name} would be deleted here.`,
      variant: 'destructive',
    });
  };

  const handleView = (session: Session) => {
    toast({
      title: 'View Session Details',
      description: `Viewing details for: ${session.name}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">
            Manage VR driving sessions
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Calendar className="mr-2 h-4 w-4" /> Schedule Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Session</DialogTitle>
              <DialogDescription>
                Create a new VR driving session
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-gray-500">
                Session creation form would go here...
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Session Management</CardTitle>
            <CardDescription>
              View, edit, and manage VR driving sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={mockSessions} 
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

export default Sessions;
