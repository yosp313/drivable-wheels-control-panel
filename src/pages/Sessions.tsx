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
  scenarioName: z.string().min(1, "Scenario name is required"),
  environmentType: z.string().min(1, "Environment type is required"),
  difficulty: z.nativeEnum(Difficulty),
  description: z.string().optional(),
  maxParticipants: z.number().min(1, "Must have at least 1 participant").max(20, "Maximum 20 participants"),
  duration: z.number().min(15, "Minimum 15 minutes").max(180, "Maximum 3 hours"),
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
    watch,
    reset,
  } = useForm<CreateSessionFormData>({
    resolver: zodResolver(createSessionSchema),
    defaultValues: {
      maxParticipants: 5,
      duration: 45,
    }
  });

  const difficulty = watch("difficulty");

  useEffect(() => {
    const fetchSessions = async () => {
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

    fetchSessions();
  }, [toast]);

  const onSubmit = async (data: CreateSessionFormData) => {
    setIsLoading(true);
    try {
      const createData: CreateSessionData = {
        location: data.location,
        date: data.date,
        scenario: {
          name: data.scenarioName,
          environmentType: data.environmentType,
          difficulty: data.difficulty,
        },
        description: data.description,
        maxParticipants: data.maxParticipants,
        duration: data.duration,
      };

      const newSession = await sessionService.create(createData);
      // Convert the date string to a Date object
      const sessionWithDate = {
        ...newSession,
        date: new Date(newSession.date)
      };
      setSessions(prev => [...prev, sessionWithDate]);
      
      toast({
        title: "Session Created",
        description: `New session "${data.scenarioName}" has been scheduled successfully.`,
      });
      
      setIsCreateDialogOpen(false);
      reset();
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

  const handleEdit = (session: sessionData) => {
    toast({
      title: 'Edit Session',
      description: `Editing session: ${session.scenario.name}`,
    });
  };

  const handleDelete = async (session: sessionData) => {
    try {
      await sessionService.delete(session.id);
      setSessions(prev => prev.filter(s => s.id !== session.id));
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
            <Button className="bg-drivable-purple hover:bg-drivable-purple/90">
              <Plus className="mr-2 h-4 w-4" /> Add New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New VR Session</DialogTitle>
              <DialogDescription>
                Schedule a new VR driving session with detailed scenario configuration
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
                <Label htmlFor="scenarioName">Scenario Name</Label>
                <Input
                  id="scenarioName"
                  placeholder="e.g., Highway Night Driving Challenge"
                  {...register("scenarioName")}
                />
                {errors.scenarioName && (
                  <p className="text-sm text-red-500">{errors.scenarioName.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="environmentType">Environment Type</Label>
                  <Select onValueChange={(value) => setValue("environmentType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Urban">Urban City</SelectItem>
                      <SelectItem value="Highway">Highway/Freeway</SelectItem>
                      <SelectItem value="Rural">Rural Roads</SelectItem>
                      <SelectItem value="Mountain">Mountain Terrain</SelectItem>
                      <SelectItem value="Parking">Parking Lot</SelectItem>
                      <SelectItem value="Night">Night Driving</SelectItem>
                      <SelectItem value="Weather">Adverse Weather</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.environmentType && (
                    <p className="text-sm text-red-500">{errors.environmentType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select 
                    value={difficulty?.toString()} 
                    onValueChange={(value) => setValue("difficulty", parseInt(value) as Difficulty)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Difficulty.EASY.toString()}>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                          Easy - Beginner Friendly
                        </div>
                      </SelectItem>
                      <SelectItem value={Difficulty.MEDIUM.toString()}>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                          Medium - Intermediate
                        </div>
                      </SelectItem>
                      <SelectItem value={Difficulty.HARD.toString()}>
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                          Hard - Advanced
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.difficulty && (
                    <p className="text-sm text-red-500">{errors.difficulty.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxParticipants">
                    <Users className="inline w-4 h-4 mr-1" />
                    Max Participants
                  </Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    max="20"
                    {...register("maxParticipants", { valueAsNumber: true })}
                  />
                  {errors.maxParticipants && (
                    <p className="text-sm text-red-500">{errors.maxParticipants.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="15"
                    max="180"
                    {...register("duration", { valueAsNumber: true })}
                  />
                  {errors.duration && (
                    <p className="text-sm text-red-500">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add any additional details about this session..."
                  rows={3}
                  {...register("description")}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="bg-drivable-purple hover:bg-drivable-purple/90">
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
                      <span className="font-medium">{selectedSession.maxParticipants || 5}</span>
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
                  className="bg-drivable-purple hover:bg-drivable-purple/90"
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
