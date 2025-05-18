
import { useState } from 'react';
import { Users, Calendar, ClipboardList, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const mockSessionData = [
    { name: 'Jan', sessions: 4 },
    { name: 'Feb', sessions: 6 },
    { name: 'Mar', sessions: 8 },
    { name: 'Apr', sessions: 10 },
    { name: 'May', sessions: 7 },
    { name: 'Jun', sessions: 12 },
    { name: 'Jul', sessions: 14 },
  ];

  const mockRegistrationData = [
    { name: 'Jan', registrations: 10 },
    { name: 'Feb', registrations: 15 },
    { name: 'Mar', registrations: 20 },
    { name: 'Apr', registrations: 25 },
    { name: 'May', registrations: 18 },
    { name: 'Jun', registrations: 30 },
    { name: 'Jul', registrations: 35 },
  ];

  const recentActivities = [
    { type: 'registration', user: 'John Doe', session: 'Advanced VR Driving', time: '10 minutes ago' },
    { type: 'session', name: 'Beginner Session', status: 'Started', time: '1 hour ago' },
    { type: 'user', name: 'Sarah Smith', action: 'Created account', time: '3 hours ago' },
    { type: 'registration', user: 'Mike Johnson', session: 'Highway Driving VR', time: '5 hours ago' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the Drivable admin dashboard. Here's an overview of your VR driving sessions and registrations.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Users"
              value="256"
              icon={<Users size={24} />}
              trend={{ value: 12, isPositive: true }}
            />
            <DashboardCard
              title="Active Sessions"
              value="8"
              icon={<Calendar size={24} />}
              trend={{ value: 5, isPositive: true }}
            />
            <DashboardCard
              title="Registrations"
              value="143"
              icon={<ClipboardList size={24} />}
              trend={{ value: 18, isPositive: true }}
            />
            <DashboardCard
              title="Completion Rate"
              value="89%"
              icon={<TrendingUp size={24} />}
              trend={{ value: 2, isPositive: false }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
                <CardDescription>VR sessions and registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={activeTab === 'overview' ? mockSessionData : []}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sessions" fill="#9b87f5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex items-start space-x-4">
                      <div className="w-2 h-2 mt-2 rounded-full bg-drivable-purple" />
                      <div className="space-y-1">
                        {activity.type === 'registration' && (
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> registered for{' '}
                            <span className="font-medium">{activity.session}</span>
                          </p>
                        )}
                        {activity.type === 'session' && (
                          <p className="text-sm">
                            Session <span className="font-medium">{activity.name}</span> has{' '}
                            <span className="font-medium">{activity.status}</span>
                          </p>
                        )}
                        {activity.type === 'user' && (
                          <p className="text-sm">
                            <span className="font-medium">{activity.name}</span> {activity.action}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Sessions"
              value="52"
              icon={<Calendar size={24} />}
            />
            <DashboardCard
              title="Active Sessions"
              value="8"
              icon={<Calendar size={24} />}
            />
            <DashboardCard
              title="Completed Sessions"
              value="44"
              icon={<Calendar size={24} />}
            />
            <DashboardCard
              title="Avg. Session Duration"
              value="45 min"
              icon={<Calendar size={24} />}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sessions Over Time</CardTitle>
              <CardDescription>Number of sessions conducted per month</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockSessionData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#9b87f5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="registrations" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Registrations"
              value="143"
              icon={<ClipboardList size={24} />}
            />
            <DashboardCard
              title="New Registrations"
              value="24"
              icon={<ClipboardList size={24} />}
              description="Last 7 days"
            />
            <DashboardCard
              title="Pending Approvals"
              value="12"
              icon={<ClipboardList size={24} />}
            />
            <DashboardCard
              title="Conversion Rate"
              value="76%"
              icon={<TrendingUp size={24} />}
            />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Registration Trends</CardTitle>
              <CardDescription>Number of registrations over time</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={mockRegistrationData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="registrations" fill="#9b87f5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
