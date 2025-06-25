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
  Download
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
  billing: {
    monthlyRevenue: number;
    totalCosts: number;
    profitMargin: number;
    costBreakdown: {
      compute: number;
      database: number;
      storage: number;
      bandwidth: number;
    };
    userCosts: Array<{
      userId: string;
      email: string;
      monthlyUsage: {
        apiCalls: number;
        storageGB: number;
        computeHours: number;
        bandwidthGB: number;
      };
      costs: {
        total: number;
        compute: number;
        storage: number;
        bandwidth: number;
      };
      tier: "free" | "basic" | "premium" | "enterprise";
    }>;
    pricing: {
      computePerHour: number;
      storagePerGB: number;
      bandwidthPerGB: number;
      apiCallsPer1000: number;
    };
  };
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("7d");

  const { data: adminStats, isLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats", timeRange],
  });

  const mockStats: AdminStats = {
    users: {
      total: 1247,
      active: 856,
      newThisWeek: 34,
      topUsers: [
        {
          id: "user-123",
          email: "john@example.com",
          firstName: "John",
          lastName: "Doe",
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          tasksCompleted: 127,
          focusMinutes: 2340
        },
        {
          id: "user-456",
          email: "sarah@example.com",
          firstName: "Sarah",
          lastName: "Wilson",
          lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
          tasksCompleted: 95,
          focusMinutes: 1890
        },
        {
          id: "user-789",
          email: "mike@example.com",
          firstName: "Mike",
          lastName: "Johnson",
          lastActive: new Date(Date.now() - 30 * 60 * 1000),
          tasksCompleted: 78,
          focusMinutes: 1560
        }
      ]
    },
    usage: {
      totalTasks: 15623,
      completedTasks: 12456,
      totalNotes: 8934,
      totalFocusSessions: 4567,
      totalFocusMinutes: 114175,
      totalBrowserActivities: 45678,
      averageSessionLength: 25.4
    },
    activity: {
      dailyActiveUsers: [
        { date: "2025-06-19", count: 234 },
        { date: "2025-06-20", count: 267 },
        { date: "2025-06-21", count: 298 },
        { date: "2025-06-22", count: 189 },
        { date: "2025-06-23", count: 156 },
        { date: "2025-06-24", count: 345 },
        { date: "2025-06-25", count: 389 }
      ],
      featureUsage: [
        { feature: "Task Management", usage: 89 },
        { feature: "Focus Timer", usage: 76 },
        { feature: "Smart Notes", usage: 65 },
        { feature: "Activity Tracking", usage: 54 },
        { feature: "Health Metrics", usage: 43 },
        { feature: "Calendar", usage: 38 }
      ],
      peakUsageHours: [
        { hour: 9, users: 245 },
        { hour: 10, users: 312 },
        { hour: 11, users: 289 },
        { hour: 14, users: 267 },
        { hour: 15, users: 298 },
        { hour: 16, users: 234 }
      ]
    },
    health: {
      apiResponseTime: 125,
      uptime: 99.8,
      errorRate: 0.2,
      databaseSize: 2.4
    },
    billing: {
      monthlyRevenue: 15420.50,
      totalCosts: 8940.25,
      profitMargin: 42.0,
      costBreakdown: {
        compute: 4250.80,
        database: 2140.30,
        storage: 1890.15,
        bandwidth: 659.00
      },
      userCosts: [
        {
          userId: "user-123",
          email: "john@example.com",
          monthlyUsage: {
            apiCalls: 45200,
            storageGB: 2.8,
            computeHours: 18.5,
            bandwidthGB: 12.3
          },
          costs: {
            total: 89.45,
            compute: 55.50,
            storage: 14.00,
            bandwidth: 19.95
          },
          tier: "premium"
        },
        {
          userId: "user-456",
          email: "sarah@example.com",
          monthlyUsage: {
            apiCalls: 32100,
            storageGB: 1.9,
            computeHours: 12.2,
            bandwidthGB: 8.7
          },
          costs: {
            total: 62.30,
            compute: 36.60,
            storage: 9.50,
            bandwidth: 16.20
          },
          tier: "basic"
        },
        {
          userId: "user-789",
          email: "mike@example.com",
          monthlyUsage: {
            apiCalls: 78500,
            storageGB: 5.4,
            computeHours: 35.8,
            bandwidthGB: 23.1
          },
          costs: {
            total: 167.80,
            compute: 107.40,
            storage: 27.00,
            bandwidth: 33.40
          },
          tier: "enterprise"
        }
      ],
      pricing: {
        computePerHour: 3.00,
        storagePerGB: 5.00,
        bandwidthPerGB: 1.45,
        apiCallsPer1000: 0.50
      }
    }
  };

  const stats = adminStats || mockStats;

  const exportData = async (type: "users" | "usage" | "activity" | "billing") => {
    // In production, this would trigger a CSV/Excel export
    const data = {
      users: stats.users,
      usage: stats.usage,
      activity: stats.activity,
      billing: stats.billing
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
                {((stats.users.active / stats.users.total) * 100).toFixed(1)}% engagement rate
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
                {((stats.usage.completedTasks / stats.usage.totalTasks) * 100).toFixed(1)}% completed
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
            <TabsTrigger value="billing">Billing</TabsTrigger>
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
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-charcoal-900">Billing & Costs</h2>
              <Button variant="outline" size="sm" onClick={() => exportData("billing" as any)}>
                <Download className="h-4 w-4 mr-2" />
                Export Billing
              </Button>
            </div>

            {/* Revenue & Cost Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass-card border-emerald-200/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-charcoal-600">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">
                    ${stats.billing.monthlyRevenue.toLocaleString()}
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">
                    +12.3% vs last month
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glass-card border-orange-200/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-charcoal-600">Total Costs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-700">
                    ${stats.billing.totalCosts.toLocaleString()}
                  </div>
                  <Badge className="bg-orange-100 text-orange-700">
                    +5.8% vs last month
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glass-card border-blue-200/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-charcoal-600">Profit Margin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700">
                    {stats.billing.profitMargin.toFixed(1)}%
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    Healthy
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glass-card border-purple-200/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-charcoal-600">Net Profit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700">
                    ${(stats.billing.monthlyRevenue - stats.billing.totalCosts).toLocaleString()}
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">
                    +18.7% vs last month
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
                          ${stats.billing.costBreakdown.compute.toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {((stats.billing.costBreakdown.compute / stats.billing.totalCosts) * 100).toFixed(1)}%
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
                          ${stats.billing.costBreakdown.database.toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {((stats.billing.costBreakdown.database / stats.billing.totalCosts) * 100).toFixed(1)}%
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
                          ${stats.billing.costBreakdown.storage.toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {((stats.billing.costBreakdown.storage / stats.billing.totalCosts) * 100).toFixed(1)}%
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
                          ${stats.billing.costBreakdown.bandwidth.toLocaleString()}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          {((stats.billing.costBreakdown.bandwidth / stats.billing.totalCosts) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Structure */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Current Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">Compute per hour</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        ${stats.billing.pricing.computePerHour.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">Storage per GB/month</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        ${stats.billing.pricing.storagePerGB.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">Bandwidth per GB</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        ${stats.billing.pricing.bandwidthPerGB.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                      <span className="text-sm text-charcoal-700">API calls per 1,000</span>
                      <span className="text-sm font-medium text-charcoal-900">
                        ${stats.billing.pricing.apiCallsPer1000.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Cost Users */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Top Cost Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.billing.userCosts
                    .sort((a, b) => b.costs.total - a.costs.total)
                    .map((user, index) => (
                    <div key={user.userId} className="flex items-center justify-between p-4 bg-white/50 rounded-lg">
                      <div>
                        <div className="font-medium text-charcoal-900">{user.email}</div>
                        <div className="text-sm text-charcoal-600">
                          {user.monthlyUsage.apiCalls.toLocaleString()} API calls • {user.monthlyUsage.computeHours}h compute
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={
                            user.tier === "enterprise" ? "default" : 
                            user.tier === "premium" ? "secondary" : "outline"
                          }>
                            {user.tier}
                          </Badge>
                          <span className="text-xs text-charcoal-500">
                            {user.monthlyUsage.storageGB.toFixed(1)}GB storage • {user.monthlyUsage.bandwidthGB.toFixed(1)}GB bandwidth
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-charcoal-900">
                          ${user.costs.total.toFixed(2)}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          Compute: ${user.costs.compute.toFixed(2)} • Storage: ${user.costs.storage.toFixed(2)}
                        </div>
                        <div className="text-xs text-charcoal-600">
                          Bandwidth: ${user.costs.bandwidth.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <div className="text-2xl font-bold text-charcoal-900">
                    {stats.health.apiResponseTime}ms
                  </div>
                  <Badge variant={stats.health.apiResponseTime < 200 ? "default" : "secondary"}>
                    {stats.health.apiResponseTime < 200 ? "Good" : "Slow"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal-900">
                    {stats.health.uptime}%
                  </div>
                  <Badge variant={stats.health.uptime > 99 ? "default" : "destructive"}>
                    {stats.health.uptime > 99 ? "Excellent" : "Poor"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal-900">
                    {stats.health.errorRate}%
                  </div>
                  <Badge variant={stats.health.errorRate < 1 ? "default" : "destructive"}>
                    {stats.health.errorRate < 1 ? "Low" : "High"}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Database Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-charcoal-900">
                    {stats.health.databaseSize}GB
                  </div>
                  <Badge variant="outline">
                    Growing
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}