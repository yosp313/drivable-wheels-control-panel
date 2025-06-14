import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Eye, MapPin, Clock, Users, Settings } from 'lucide-react';
import DataTable from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import sessionService, { Difficulty, sessionData, CreateSessionData } from '@/api/services/SessionsService';


// Schema for session creation form
const createSessionSchema = z.object({
  location: z.string().min(1, "Location is required"),
  date: z.string()
    .min(1, "Date is required")
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, "Invalid date format"),
  scenarioId: z.string().min(1, "Scenario ID is required"),
  maxParticipants: z.number().min(1, "Max participants must be at least 1"),
});

type CreateSessionFormData = z.infer<typeof createSessionSchema>;

const Sessions = () => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<sessionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<sessionData[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      maxParticipants: 4,
    }
  });

  const refreshSessions = async () => {
    try {
      const fetchedSessions = await sessionService.getAll();
      // Convert string dates to Date objects
      const sessionsWithDates = fetchedSessions.map(session => ({
        ...session,
        date: new Date(session.date)
      }));
      setSessions(sessionsWithDates);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch sessions.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    refreshSessions();
  }, [toast]);

  const onSubmit = async (data: CreateSessionFormData) => {
    console.log('Form submitted with data:', data);
    setIsLoading(true);
    try {
      // Convert date to ISO string
      const isoDate = new Date(data.date).toISOString();

      const createData: CreateSessionData = {
        location: data.location,
        date: isoDate,
        scenarioId: data.scenarioId,
        maxParticipants: data.maxParticipants,
      };
      console.log('Sending create request with data:', createData);

      await sessionService.create(createData);
      
      toast({
        title: "Session Created",
        description: "New session has been scheduled successfully.",
      });
      
      setIsCreateDialogOpen(false);
      reset();
      // Refresh sessions after creation
      await refreshSessions();
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case Difficulty.EASY:
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Easy</Badge>;
      case Difficulty.MEDIUM:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case Difficulty.HARD:
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Hard</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSessionStatus = (date: Date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    
    if (sessionDate > now) {
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Scheduled</Badge>;
    } else if (sessionDate.toDateString() === now.toDateString()) {
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Today</Badge>;
    } else {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Completed</Badge>;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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
    {
      header: 'Scenario',
      accessorKey: 'scenario.name' as keyof sessionData,
    },
    {
      header: 'Environment',
      accessorKey: 'scenario.environmentType' as keyof sessionData,
    },
    {
      header: 'Difficulty',
      accessorKey: 'scenario.difficulty' as keyof sessionData,
    },
  ];

  const handleEdit = async (session: sessionData) => {
    try {
      // Assuming you have an edit dialog or form
      // After successful edit:
      await refreshSessions();
      toast({
        title: 'Session Updated',
        description: `Session "${session.scenario.name}" has been updated successfully.`,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update session.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (session: sessionData) => {
    try {
      await sessionService.delete(session.id);
      // Refresh sessions after deletion
      await refreshSessions();
      toast({
        title: 'Session Deleted',
        description: `Session "${session.scenario.name}" has been deleted.`,
      });
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete session.',
        variant: 'destructive',
      });
    }
  };

  const handleView = (session: sessionData) => {
    setSelectedSession(session);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">
            Manage VR driving sessions and scenarios
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="mr-2 h-4 w-4" /> Add New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New VR Session</DialogTitle>
              <DialogDescription>
                Schedule a new VR driving session
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="inline w-4 h-4 mr-1" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., VR Lab Room A"
                    {...register("location")}
                  />
                  {errors.location && (
                    <p className="text-sm text-red-500">{errors.location.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Date & Time
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    {...register("date")}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scenarioId">Scenario ID</Label>
                <Input
                  id="scenarioId"
                  placeholder="Enter scenario ID"
                  {...register("scenarioId")}
                />
                {errors.scenarioId && (
                  <p className="text-sm text-red-500">{errors.scenarioId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max Participants</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  {...register("maxParticipants")}
                />
                {errors.maxParticipants && (
                  <p className="text-sm text-red-500">{errors.maxParticipants.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => console.log('Submit button clicked')}
                >
                  {isLoading ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Session Details View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Session Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this VR driving session
            </DialogDescription>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">{selectedSession.scenario.name}</h3>
                  <p className="text-muted-foreground">Session ID: #{selectedSession.id}</p>
                </div>
                {getSessionStatus(selectedSession.date)}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Session Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time:</span>
                      <span className="font-medium">{formatDate(selectedSession.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedSession.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{selectedSession.duration || 45} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Participants:</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Scenario Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment:</span>
                      <span className="font-medium">{selectedSession.scenario.environmentType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Difficulty:</span>
                      {getDifficultyBadge(selectedSession.scenario.difficulty)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scenario ID:</span>
                      <span className="font-medium">{selectedSession.scenario.scenarioID}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedSession.description && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedSession.description}</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEdit(selectedSession);
                  }}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Edit Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
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
