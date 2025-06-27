import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Activity, 
  TrendingUp, 
  Database, 
  Clock,
  BarChart3,
  PieChart,
  Globe,
  Smartphone,
  Download,
  UserPlus,
  Calendar
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface AdminStats {
  users: {
    total: number;
    active: number;
    newThisWeek: number;
    topUsers: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      lastActive: Date;
      tasksCompleted: number;
      focusMinutes: number;
    }>;
  };
  usage: {
    totalTasks: number;
    completedTasks: number;
    totalNotes: number;
    totalFocusSessions: number;
    totalFocusMinutes: number;
    totalBrowserActivities: number;
    averageSessionLength: number;
  };
  activity: {
    dailyActiveUsers: Array<{ date: string; count: number }>;
    featureUsage: Array<{ feature: string; usage: number }>;
    peakUsageHours: Array<{ hour: number; users: number }>;
  };
  health: {
    apiResponseTime: number;
    uptime: number;
    errorRate: number;
    databaseSize: number;
  };
  costs: {
    monthlyTotal: number;
    dailyAverage: number;
    yearlyProjected: number;
    breakdown: {
      compute: number;
      database: number;
      storage: number;
      bandwidth: number;
      monitoring: number;
      backup: number;
    };
    resourceUsage: {
      cpuHours: number;
      memoryGBHours: number;
      storageGB: number;
      bandwidthGB: number;
      databaseConnections: number;
      apiRequests: number;
    };
    topResourceUsers: Array<{
      userId: string;
      email: string;
      resourceUsage: {
        cpuMinutes: number;
        storageGB: number;
        apiCalls: number;
        bandwidthGB: number;
      };
      estimatedCost: number;
    }>;
    trends: {
      lastMonth: number;
      growth: number;
      forecast: number;
    };
  };
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");

  const { data: adminStats, isLoading, error } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats-bypass", timeRange],
    refetchInterval: 30000, // Refresh every 30 seconds for real-time data
    staleTime: 10000, // Consider data fresh for 10 seconds
  });

  // Remove all mock data - only use real data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-charcoal-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-charcoal-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !adminStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-charcoal-900 mb-4">Unable to Load Admin Data</h2>
            <p className="text-charcoal-600 mb-6">There was an error loading the admin dashboard data.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  // Use only real data from the API - no fallback to mock data
  const stats = adminStats;

  const exportData = async (type: "users" | "usage" | "activity" | "costs") => {
    // Export real data from the database
    const data = {
      users: stats.users,
      usage: stats.usage,
      activity: stats.activity,
      costs: stats.costs
    }[type];

    const filename = `${type}-data-${format(new Date(), "yyyy-MM-dd")}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-charcoal-50 to-teal-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-charcoal-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-charcoal-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-900">Admin Dashboard</h1>
            <p className="text-charcoal-600 mt-1">Application usage analytics and user insights</p>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-charcoal-200 rounded-lg text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card border-teal-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal-900">{stats.users.total.toLocaleString()}</div>
              <p className="text-xs text-charcoal-600">
                +{stats.users.newThisWeek} new this week
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-teal-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-600">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal-900">{stats.users.active.toLocaleString()}</div>
              <p className="text-xs text-charcoal-600">
                {stats.users.total > 0 ? ((stats.users.active / stats.users.total) * 100).toFixed(1) : '0.0'}% engagement rate
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-teal-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-600">Total Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal-900">{stats.usage.totalTasks.toLocaleString()}</div>
              <p className="text-xs text-charcoal-600">
                {stats.usage.totalTasks > 0 ? ((stats.usage.completedTasks / stats.usage.totalTasks) * 100).toFixed(1) : '0.0'}% completed
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-teal-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-charcoal-600">System Health</CardTitle>
              <Database className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-charcoal-900">{stats.health.uptime}%</div>
              <p className="text-xs text-charcoal-600">
                {stats.health.apiResponseTime}ms avg response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="costs">Costs</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-charcoal-900">User Analytics</h2>
              <Button variant="outline" size="sm" onClick={() => exportData("users")}>
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </Button>
            </div>
            
            {/* User Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="glass-card border-emerald-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-charcoal-600">New This Week</CardTitle>
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal-900">
                    {(stats.users as any).growth?.newThisWeek || 0}
                  </div>
                  <p className="text-xs text-charcoal-600">
                    {(stats.users as any).growth?.weekOverWeekGrowth > 0 ? '+' : ''}
                    {(stats.users as any).growth?.weekOverWeekGrowth || 0}% vs last week
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-blue-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-charcoal-600">New This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal-900">
                    {(stats.users as any).growth?.newThisMonth || 0}
                  </div>
                  <p className="text-xs text-charcoal-600">
                    {stats.users.total > 0 ? (((stats.users as any).growth?.newThisMonth || 0) / stats.users.total * 100).toFixed(1) : '0.0'}% of total users
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-teal-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-charcoal-600">Growth Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal-900">
                    {(stats.users as any).growth?.weekOverWeekGrowth > 0 ? '+' : ''}
                    {(stats.users as any).growth?.weekOverWeekGrowth || 0}%
                  </div>
                  <p className="text-xs text-charcoal-600">
                    Week over week change
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>User Activity Timeline</CardTitle>
                  <p className="text-sm text-charcoal-600">Daily active users over the last 30 days</p>
                </CardHeader>
                <CardContent>
                  {stats.activity.dailyActiveUsers && stats.activity.dailyActiveUsers.length > 0 ? (
                    <div className="space-y-2">
                      {stats.activity.dailyActiveUsers.slice(0, 7).map((day: any, index: number) => (
                        <div key={day.date} className="flex items-center justify-between p-2 rounded-lg bg-charcoal-50">
                          <span className="text-sm text-charcoal-600">{new Date(day.date).toLocaleDateString()}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-charcoal-900">{day.activeUsers} active</span>
                            {day.newUsers > 0 && (
                              <Badge variant="outline" className="text-xs">+{day.newUsers} new</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {stats.activity.dailyActiveUsers.length === 0 && (
                        <div className="text-center py-4 text-charcoal-500">
                          <p className="text-sm">No user activity recorded yet</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-charcoal-400">
                      <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No user activity data available</p>
                      <p className="text-xs mt-1">Activity will appear when users create tasks, notes, or focus sessions</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Top Active Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.users.topUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div>
                        <div className="font-medium text-charcoal-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-charcoal-600">{user.email}</div>
                        <div className="text-xs text-charcoal-500">
                          Last active: {formatDistanceToNow(user.lastActive)} ago
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-charcoal-900">
                          {user.tasksCompleted} tasks
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {user.focusMinutes} focus mins
                        </div>
                        <Badge variant={index < 3 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.activity.dailyActiveUsers.map((day, index) => (
                      <div key={day.date} className="flex items-center justify-between">
                        <span className="text-sm text-charcoal-600">
                          {format(new Date(day.date), "MMM dd")}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-charcoal-200 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(day.count / Math.max(...stats.activity.dailyActiveUsers.map(d => d.count))) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-charcoal-900 w-12 text-right">
                            {day.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-charcoal-900">Feature Usage</h2>
              <Button variant="outline" size="sm" onClick={() => exportData("usage")}>
                <Download className="h-4 w-4 mr-2" />
                Export Usage
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Feature Adoption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.activity.featureUsage.map((feature) => (
                      <div key={feature.feature} className="flex items-center justify-between">
                        <span className="text-sm text-charcoal-700">{feature.feature}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-charcoal-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${feature.usage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-charcoal-900 w-10 text-right">
                            {feature.usage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-charcoal-900">
                        {stats.usage.totalNotes.toLocaleString()}
                      </div>
                      <div className="text-sm text-charcoal-600">Total Notes</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-charcoal-900">
                        {stats.usage.totalFocusSessions.toLocaleString()}
                      </div>
                      <div className="text-sm text-charcoal-600">Focus Sessions</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-charcoal-900">
                        {Math.round(stats.usage.totalFocusMinutes / 60).toLocaleString()}h
                      </div>
                      <div className="text-sm text-charcoal-600">Focus Time</div>
                    </div>
                    <div className="text-center p-3 bg-white/50 rounded-lg">
                      <div className="text-2xl font-bold text-charcoal-900">
                        {stats.usage.averageSessionLength}m
                      </div>
                      <div className="text-sm text-charcoal-600">Avg Session</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-charcoal-900">Activity Patterns</h2>
              <Button variant="outline" size="sm" onClick={() => exportData("activity")}>
                <Download className="h-4 w-4 mr-2" />
                Export Activity
              </Button>
            </div>
            
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Peak Usage Hours</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.activity.peakUsageHours && stats.activity.peakUsageHours.length > 0 ? (
                  <div className="grid grid-cols-6 gap-4">
                    {stats.activity.peakUsageHours.map((hour) => (
                      <div key={hour.hour} className="text-center">
                        <div className="h-20 bg-charcoal-100 rounded-lg flex items-end justify-center mb-2">
                          <div 
                            className="bg-teal-500 rounded-t-lg w-full transition-all duration-300"
                            style={{ 
                              height: `${(hour.users / Math.max(...stats.activity.peakUsageHours.map(h => h.users))) * 100}%` 
                            }}
                          />
                        </div>
                        <div className="text-xs text-charcoal-600">{hour.hour}:00</div>
                        <div className="text-sm font-medium text-charcoal-900">{hour.users}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-charcoal-400">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No usage patterns available</p>
                    <p className="text-xs mt-1">Peak hours will appear when users are active</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-charcoal-900">Infrastructure Costs</h2>
              <Button variant="outline" size="sm" onClick={() => exportData("costs")}>
                <Download className="h-4 w-4 mr-2" />
                Export Cost Data
              </Button>
            </div>

            {/* Cost Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card border-orange-200/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-charcoal-600">Monthly Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats.costs?.monthlyTotal || 0) > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-orange-700">
                        ${(stats.costs?.monthlyTotal || 0).toLocaleString()}
                      </div>
                      <Badge className={`${(stats.costs?.trends?.growth || 0) > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {(stats.costs?.trends?.growth || 0) > 0 ? '+' : ''}{(stats.costs?.trends?.growth || 0).toFixed(1)}% vs last month
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-charcoal-400">
                        Not Available
                      </div>
                      <Badge className="bg-charcoal-100 text-charcoal-600">
                        Cost tracking pending
                      </Badge>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-blue-200/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-charcoal-600">Daily Average</CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats.costs?.dailyAverage || 0) > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-blue-700">
                        ${(stats.costs?.dailyAverage || 0).toFixed(2)}
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">
                        Per day
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-charcoal-400">
                        Not Available
                      </div>
                      <Badge className="bg-charcoal-100 text-charcoal-600">
                        Cost tracking pending
                      </Badge>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-purple-200/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-charcoal-600">Yearly Projected</CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats.costs?.yearlyProjected || 0) > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-purple-700">
                        ${(stats.costs?.yearlyProjected || 0).toLocaleString()}
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">
                        Estimate
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-charcoal-400">
                        Not Available
                      </div>
                      <Badge className="bg-charcoal-100 text-charcoal-600">
                        Cost tracking pending
                      </Badge>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-emerald-200/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-charcoal-600">Next Month Forecast</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">
                    ${stats.costs.trends.forecast.toLocaleString()}
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    Projected
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cost Breakdown */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-charcoal-700">Compute</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-charcoal-900">
                          ${(stats.costs?.breakdown?.compute || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {(stats.costs?.monthlyTotal || 0) > 0 ? 
                            (((stats.costs?.breakdown?.compute || 0) / stats.costs.monthlyTotal) * 100).toFixed(1) + '%' :
                            '0%'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm font-medium text-charcoal-700">Database</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-charcoal-900">
                          ${(stats.costs?.breakdown?.database || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {(stats.costs?.monthlyTotal || 0) > 0 ? 
                            (((stats.costs?.breakdown?.database || 0) / stats.costs.monthlyTotal) * 100).toFixed(1) + '%' :
                            '0%'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-sm font-medium text-charcoal-700">Storage</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-charcoal-900">
                          ${(stats.costs?.breakdown?.storage || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {(stats.costs?.monthlyTotal || 0) > 0 ? 
                            (((stats.costs?.breakdown?.storage || 0) / stats.costs.monthlyTotal) * 100).toFixed(1) + '%' :
                            '0%'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-charcoal-700">Bandwidth</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-charcoal-900">
                          ${(stats.costs?.breakdown?.bandwidth || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {(stats.costs?.monthlyTotal || 0) > 0 ? 
                            (((stats.costs?.breakdown?.bandwidth || 0) / stats.costs.monthlyTotal) * 100).toFixed(1) + '%' :
                            '0%'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-sm font-medium text-charcoal-700">Monitoring</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-charcoal-900">
                          ${(stats.costs?.breakdown?.monitoring || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {(stats.costs?.monthlyTotal || 0) > 0 ? 
                            (((stats.costs?.breakdown?.monitoring || 0) / stats.costs.monthlyTotal) * 100).toFixed(1) + '%' :
                            '0%'
                          }
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                        <span className="text-sm font-medium text-charcoal-700">Backup</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-charcoal-900">
                          ${(stats.costs?.breakdown?.backup || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {(stats.costs?.monthlyTotal || 0) > 0 ? 
                            (((stats.costs?.breakdown?.backup || 0) / stats.costs.monthlyTotal) * 100).toFixed(1) + '%' :
                            '0%'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Usage */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Resource Consumption</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">CPU Hours</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        {(stats.costs?.resourceUsage?.cpuHours || 0).toLocaleString()}h
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">Memory GB Hours</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        {(stats.costs?.resourceUsage?.memoryGBHours || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">Storage Used</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        {(stats.costs?.resourceUsage?.storageGB || 0).toFixed(1)} GB
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">Bandwidth</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        {(stats.costs?.resourceUsage?.bandwidthGB || 0).toFixed(1)} GB
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">DB Connections</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        {(stats.costs?.resourceUsage?.databaseConnections || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">API Requests</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        {(stats.costs?.resourceUsage?.apiRequests || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Resource Consuming Users */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Top Resource Consuming Users</CardTitle>
              </CardHeader>
              <CardContent>
                {(stats.costs?.topResourceUsers || []).length > 0 ? (
                  <div className="space-y-4">
                    {(stats.costs?.topResourceUsers || [])
                      .sort((a, b) => (b.estimatedCost || 0) - (a.estimatedCost || 0))
                      .map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div>
                        <div className="font-medium text-charcoal-900">{user.email}</div>
                        <div className="text-sm text-charcoal-600">
                          {(user.resourceUsage?.apiCalls || 0).toLocaleString()} API calls • {user.resourceUsage?.cpuMinutes || 0} CPU minutes
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={
                            (user.estimatedCost || 0) > 30 ? "destructive" : 
                            (user.estimatedCost || 0) > 15 ? "secondary" : "outline"
                          }>
                            {(user.estimatedCost || 0) > 30 ? "High Usage" : (user.estimatedCost || 0) > 15 ? "Medium Usage" : "Low Usage"}
                          </Badge>
                          <span className="text-xs text-charcoal-500">
                            {(user.resourceUsage?.storageGB || 0).toFixed(1)}GB storage • {(user.resourceUsage?.bandwidthGB || 0).toFixed(1)}GB bandwidth
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-charcoal-900">
                          ${(user.estimatedCost || 0).toFixed(2)}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          Estimated monthly cost
                        </div>
                        <div className="text-xs text-charcoal-500">
                          {(stats.costs?.monthlyTotal || 0) > 0 ? 
                            `${(((user.estimatedCost || 0) / stats.costs.monthlyTotal) * 100).toFixed(1)}% of total` : 
                            'Cost tracking pending'
                          }
                        </div>
                      </div>
                    </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-charcoal-400 mb-2">No cost data available</div>
                    <div className="text-sm text-charcoal-500">Cost tracking will show user resource consumption when implemented</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <h2 className="text-xl font-semibold text-charcoal-900">System Health</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">API Response Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.health.apiResponseTime > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-charcoal-900">
                        {stats.health.apiResponseTime}ms
                      </div>
                      <Badge variant={stats.health.apiResponseTime < 200 ? "default" : "secondary"}>
                        {stats.health.apiResponseTime < 200 ? "Good" : "Slow"}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-charcoal-400">
                        Not Tracked
                      </div>
                      <Badge className="bg-charcoal-100 text-charcoal-600">
                        Monitoring pending
                      </Badge>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.health.uptime > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-charcoal-900">
                        {stats.health.uptime}%
                      </div>
                      <Badge variant={stats.health.uptime > 99 ? "default" : "destructive"}>
                        {stats.health.uptime > 99 ? "Excellent" : "Poor"}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-charcoal-400">
                        Not Tracked
                      </div>
                      <Badge className="bg-charcoal-100 text-charcoal-600">
                        Monitoring pending
                      </Badge>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.health.errorRate > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-charcoal-900">
                        {stats.health.errorRate}%
                      </div>
                      <Badge variant={stats.health.errorRate < 1 ? "default" : "destructive"}>
                        {stats.health.errorRate < 1 ? "Low" : "High"}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-charcoal-400">
                        Not Tracked
                      </div>
                      <Badge className="bg-charcoal-100 text-charcoal-600">
                        Monitoring pending
                      </Badge>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Database Size</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.health.databaseSize > 0 ? (
                    <>
                      <div className="text-2xl font-bold text-charcoal-900">
                        {stats.health.databaseSize}GB
                      </div>
                      <Badge variant="outline">
                        Growing
                      </Badge>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-charcoal-400">
                        Not Tracked
                      </div>
                      <Badge className="bg-charcoal-100 text-charcoal-600">
                        Monitoring pending
                      </Badge>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}