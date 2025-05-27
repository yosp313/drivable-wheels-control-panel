
import { useEffect, useState } from 'react';
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
import sessionService, { Scenario, sessionData } from '@/api/services/SessionsService';


const Sessions = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
const [sessions, setSessions] = useState<sessionData[]>([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const fetchedSessions = await sessionService.getAll();
        setSessions(fetchedSessions);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users.",
          variant: "destructive",
        });
      }
    };

    fetchSessions();
  }, [toast]);

  // Fix: Properly type the columns with keyof Session
  const columns = [
    {
      header: 'SessionID',
      accessorKey: 'id' as keyof sessionData,
    },
    {
      header: 'Location',
      accessorKey: 'location' as keyof sessionData,
    },
    {
      header: 'Date',
      accessorKey: 'date' as keyof sessionData,
    },
  ];

  const handleEdit = (session: sessionData) => {
    toast({
      title: 'Edit Session',
      description: `Editing session: ${session.scenario.name}`,
    });
  };

  const handleDelete = (session: sessionData) => {
    toast({
      title: 'Delete Session',
      description: `Session ${session.scenario.name} would be deleted here.`,
      variant: 'destructive',
    });
  };

  const handleView = (session: sessionData) => {
    toast({
      title: 'View Session Details',
      description: `Viewing details for: ${session.scenario.name}`,
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
              data={sessions} 
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
