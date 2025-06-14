import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import registrationService, { registrationData } from '@/api/services/RegistrationService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, Car, CheckCircle, XCircle, Star, CreditCard } from 'lucide-react';

const Registrations = () => {
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<registrationData[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<registrationData | null>(null);

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
  }, [registrations]);

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

  const handleDelete = async (registration: registrationData) => {
    await registrationService.delete(registration.id);
    toast({
      title: 'Delete Registration',
      description: `Registration for ${registration.user.firstName} would be deleted here.`,
      variant: 'destructive',
    });
  };

  const handleView = (registration: registrationData) => {
    setSelectedRegistration(registration);
    setIsViewDialogOpen(true);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Registrations</h2>
          <p className="text-muted-foreground">
            Manage VR driving session registrations
          </p>
        </div>
      </div>
      
      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Registration Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this registration
            </DialogDescription>
          </DialogHeader>
          
          {selectedRegistration && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">
                        {selectedRegistration.user.firstName} {selectedRegistration.user.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{selectedRegistration.user.email}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Session Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{selectedRegistration.session.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">{formatDate(selectedRegistration.session.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scenario:</span>
                      <span className="font-medium">{selectedRegistration.session.scenario.name}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Registration Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Transmission Type:</span>
                    <Badge variant="secondary">
                      {selectedRegistration.transmissionType}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Session Status:</span>
                    {selectedRegistration.completed ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <XCircle className="h-4 w-4 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Payment Status:</span>
                    {selectedRegistration.paid ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Unpaid
                      </Badge>
                    )}
                  </div>
                  {selectedRegistration.score > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Score:</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        <Star className="h-4 w-4 mr-1" />
                        {selectedRegistration.score}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedRegistration.feedback && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Feedback</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedRegistration.feedback}</p>
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
                    handleEdit(selectedRegistration);
                  }}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Edit Registration
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
