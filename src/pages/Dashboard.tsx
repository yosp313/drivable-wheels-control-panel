import { useState, useEffect } from 'react';
import { Users, Calendar, ClipboardList, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardCard from '@/components/DashboardCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import userService from '@/api/services/UserService';
import sessionService from '@/api/services/SessionsService';
import registrationService from '@/api/services/RegistrationService';

interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  totalRegistrations: number;
  completionRate: number;
}

interface ChartData {
  name: string;
  sessions?: number;
  registrations?: number;
}

interface RecentActivity {
  type: 'registration' | 'session' | 'user';
  user?: string;
  session?: string;
  name?: string;
  status?: string;
  action?: string;
  time: string;
}

const Dashboard = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeSessions: 0,
    totalRegistrations: 0,
    completionRate: 0,
  });
  const [sessionData, setSessionData] = useState<ChartData[]>([]);
  const [registrationData, setRegistrationData] = useState<ChartData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data concurrently
      const [users, sessions, registrations] = await Promise.all([
        userService.getAll(),
        sessionService.getAll(),
        registrationService.getAll(),
      ]);

      // Calculate stats
      const totalUsers = users.length;
      const activeSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        const now = new Date();
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        return sessionDate >= now && sessionDate <= oneDayFromNow;
      }).length;
      
      const totalRegistrations = registrations.length;
      const completedRegistrations = registrations.filter(reg => reg.completed).length;
      const completionRate = totalRegistrations > 0 ? Math.round((completedRegistrations / totalRegistrations) * 100) : 0;

      setDashboardStats({
        totalUsers,
        activeSessions,
        totalRegistrations,
        completionRate,
      });

      // Generate chart data based on actual data
      const monthlySessionData = generateMonthlyData(sessions, 'sessions');
      const monthlyRegistrationData = generateMonthlyData(registrations, 'registrations');
      
      setSessionData(monthlySessionData);
      setRegistrationData(monthlyRegistrationData);

      // Generate recent activities
      const activities = generateRecentActivities(users, sessions, registrations);
      setRecentActivities(activities);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMonthlyData = (data: any[], type: 'sessions' | 'registrations'): ChartData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyData = months.map(month => {
      const monthIndex = months.indexOf(month);
      const count = data.filter(item => {
        const itemDate = new Date(item.date || item.registrationDate || new Date());
        return itemDate.getFullYear() === currentYear && itemDate.getMonth() === monthIndex;
      }).length;
      
      return {
        name: month,
        [type]: count,
      };
    });

    return monthlyData;
  };

  const generateRecentActivities = (users: any[], sessions: any[], registrations: any[]): RecentActivity[] => {
    const activities: RecentActivity[] = [];

    // Add recent registrations
    const recentRegistrations = registrations
      .sort((a, b) => new Date(b.registrationDate || 0).getTime() - new Date(a.registrationDate || 0).getTime())
      .slice(0, 2);
    
    recentRegistrations.forEach(reg => {
      activities.push({
        type: 'registration',
        user: `${reg.user.firstName} ${reg.user.lastName}`,
        session: reg.session?.scenario?.name || 'VR Driving Session',
        time: getRelativeTime(reg.registrationDate),
      });
    });

    // Add recent sessions
    const recentSessions = sessions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 1);
    
    recentSessions.forEach(session => {
      activities.push({
        type: 'session',
        name: session.scenario.name,
        status: new Date(session.date) > new Date() ? 'Scheduled' : 'Completed',
        time: getRelativeTime(session.date),
      });
    });

    // Add recent users
    const recentUsers = users
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 1);
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'user',
        name: `${user.firstName} ${user.lastName}`,
        action: 'Created account',
        time: getRelativeTime(user.createdAt),
      });
    });

    return activities.sort((a, b) => getTimeValue(a.time) - getTimeValue(b.time));
  };

  const getRelativeTime = (date: string | Date): string => {
    if (!date) return 'Unknown time';
    
    const now = new Date();
    const itemDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getTimeValue = (timeString: string): number => {
    if (timeString.includes('minutes ago')) return parseInt(timeString);
    if (timeString.includes('hours ago')) return parseInt(timeString) * 60;
    if (timeString.includes('days ago')) return parseInt(timeString) * 1440;
    return 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

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
              value={dashboardStats.totalUsers.toString()}
              icon={<Users size={24} />}
              trend={{ value: 12, isPositive: true }}
            />
            <DashboardCard
              title="Active Sessions"
              value={dashboardStats.activeSessions.toString()}
              icon={<Calendar size={24} />}
              trend={{ value: 5, isPositive: true }}
            />
            <DashboardCard
              title="Registrations"
              value={dashboardStats.totalRegistrations.toString()}
              icon={<ClipboardList size={24} />}
              trend={{ value: 18, isPositive: true }}
            />
            <DashboardCard
              title="Completion Rate"
              value={`${dashboardStats.completionRate}%`}
              icon={<TrendingUp size={24} />}
              trend={{ value: 2, isPositive: dashboardStats.completionRate > 80 }}
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
                      data={sessionData}
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
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, idx) => (
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
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No recent activities</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sessions" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard
              title="Total Sessions"
              value={sessionData.reduce((sum, month) => sum + (month.sessions || 0), 0).toString()}
              icon={<Calendar size={24} />}
            />
            <DashboardCard
              title="Active Sessions"
              value={dashboardStats.activeSessions.toString()}
              icon={<Calendar size={24} />}
            />
            <DashboardCard
              title="Completed Sessions"
              value={(sessionData.reduce((sum, month) => sum + (month.sessions || 0), 0) - dashboardStats.activeSessions).toString()}
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
                    data={sessionData}
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
              value={dashboardStats.totalRegistrations.toString()}
              icon={<ClipboardList size={24} />}
            />
            <DashboardCard
              title="New Registrations"
              value={registrationData[registrationData.length - 1]?.registrations?.toString() || "0"}
              icon={<ClipboardList size={24} />}
              description="This month"
            />
            <DashboardCard
              title="Pending Approvals"
              value="0"
              icon={<ClipboardList size={24} />}
            />
            <DashboardCard
              title="Completion Rate"
              value={`${dashboardStats.completionRate}%`}
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
                    data={registrationData}
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
