import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, ShoppingBag, Trophy, GraduationCap, Users, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';

interface StatsData {
  totalBookings: number;
  monthlyBookings: number;
  yearlyBookings: number;
  totalOrders: number;
  monthlyOrders: number;
  yearlyOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  totalProductsSold: number;
  monthlyProductsSold: number;
  yearlyProductsSold: number;
  totalTournamentRegs: number;
  totalTrainingRegs: number;
  totalUsers: number;
}

export function StatisticsManager() {
  const [stats, setStats] = useState<StatsData>({
    totalBookings: 0,
    monthlyBookings: 0,
    yearlyBookings: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    yearlyOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    totalProductsSold: 0,
    monthlyProductsSold: 0,
    yearlyProductsSold: 0,
    totalTournamentRegs: 0,
    totalTrainingRegs: 0,
    totalUsers: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<{ month: string; bookings: number; orders: number; revenue: number }[]>([]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setIsLoading(true);
    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
    const yearStart = format(startOfYear(now), 'yyyy-MM-dd');
    const yearEnd = format(endOfYear(now), 'yyyy-MM-dd');

    // Fetch all stats in parallel
    const [
      { count: totalBookings },
      { count: monthlyBookings },
      { count: yearlyBookings },
      { data: allOrders },
      { data: monthlyOrdersData },
      { data: yearlyOrdersData },
      { data: allOrderItems },
      { data: monthlyOrderItems },
      { data: yearlyOrderItems },
      { count: totalTournamentRegs },
      { count: totalTrainingRegs },
      { count: totalUsers },
    ] = await Promise.all([
      supabase.from('bookings').select('*', { count: 'exact', head: true }),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('booking_date', monthStart).lte('booking_date', monthEnd),
      supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('booking_date', yearStart).lte('booking_date', yearEnd),
      supabase.from('orders').select('total_amount'),
      supabase.from('orders').select('total_amount').gte('created_at', monthStart).lte('created_at', monthEnd + 'T23:59:59'),
      supabase.from('orders').select('total_amount').gte('created_at', yearStart).lte('created_at', yearEnd + 'T23:59:59'),
      supabase.from('order_items').select('quantity'),
      supabase.from('order_items').select('quantity, orders!inner(created_at)').gte('orders.created_at', monthStart).lte('orders.created_at', monthEnd + 'T23:59:59'),
      supabase.from('order_items').select('quantity, orders!inner(created_at)').gte('orders.created_at', yearStart).lte('orders.created_at', yearEnd + 'T23:59:59'),
      supabase.from('tournament_registrations').select('*', { count: 'exact', head: true }),
      supabase.from('training_registrations').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]);

    // Calculate totals
    const totalRevenue = allOrders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const monthlyRevenue = monthlyOrdersData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const yearlyRevenue = yearlyOrdersData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;
    const totalProductsSold = allOrderItems?.reduce((sum, i) => sum + i.quantity, 0) || 0;
    const monthlyProductsSold = monthlyOrderItems?.reduce((sum, i) => sum + i.quantity, 0) || 0;
    const yearlyProductsSold = yearlyOrderItems?.reduce((sum, i) => sum + i.quantity, 0) || 0;

    setStats({
      totalBookings: totalBookings || 0,
      monthlyBookings: monthlyBookings || 0,
      yearlyBookings: yearlyBookings || 0,
      totalOrders: allOrders?.length || 0,
      monthlyOrders: monthlyOrdersData?.length || 0,
      yearlyOrders: yearlyOrdersData?.length || 0,
      totalRevenue,
      monthlyRevenue,
      yearlyRevenue,
      totalProductsSold,
      monthlyProductsSold,
      yearlyProductsSold,
      totalTournamentRegs: totalTournamentRegs || 0,
      totalTrainingRegs: totalTrainingRegs || 0,
      totalUsers: totalUsers || 0,
    });

    // Fetch monthly breakdown for last 6 months
    const breakdown = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const mStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
      const mEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const [{ count: bCount }, { data: oData }] = await Promise.all([
        supabase.from('bookings').select('*', { count: 'exact', head: true }).gte('booking_date', mStart).lte('booking_date', mEnd),
        supabase.from('orders').select('total_amount').gte('created_at', mStart).lte('created_at', mEnd + 'T23:59:59'),
      ]);
      
      breakdown.push({
        month: format(monthDate, 'MMM yyyy'),
        bookings: bCount || 0,
        orders: oData?.length || 0,
        revenue: oData?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0,
      });
    }
    setMonthlyBreakdown(breakdown);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading statistics...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Statistics Overview
          </CardTitle>
          <CardDescription>View all platform statistics and analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="shop">Shop</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Breakdown</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Bookings</p>
                        <p className="text-2xl font-bold">{stats.totalBookings}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-8 w-8 text-accent" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{stats.totalOrders}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Trophy className="h-8 w-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tournament Regs</p>
                        <p className="text-2xl font-bold">{stats.totalTournamentRegs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Training Regs</p>
                        <p className="text-2xl font-bold">{stats.totalTrainingRegs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Products Sold</p>
                      <p className="text-2xl font-bold">{stats.totalProductsSold}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">This Month</p>
                      <p className="text-4xl font-bold text-primary">{stats.monthlyBookings}</p>
                      <p className="text-xs text-muted-foreground mt-1">bookings</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-accent/5">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">This Year</p>
                      <p className="text-4xl font-bold text-accent">{stats.yearlyBookings}</p>
                      <p className="text-xs text-muted-foreground mt-1">bookings</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">All Time</p>
                      <p className="text-4xl font-bold">{stats.totalBookings}</p>
                      <p className="text-xs text-muted-foreground mt-1">bookings</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="shop" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Orders</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span>This Month</span>
                      <span className="font-bold">{stats.monthlyOrders} orders</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span>This Year</span>
                      <span className="font-bold">{stats.yearlyOrders} orders</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span>All Time</span>
                      <span className="font-bold">{stats.totalOrders} orders</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span>This Month</span>
                      <span className="font-bold text-green-600">${stats.monthlyRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span>This Year</span>
                      <span className="font-bold text-green-600">${stats.yearlyRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg">
                      <span>All Time</span>
                      <span className="font-bold text-green-600">${stats.totalRevenue.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Products Sold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-3xl font-bold">{stats.monthlyProductsSold}</p>
                        <p className="text-sm text-muted-foreground">This Month</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-3xl font-bold">{stats.yearlyProductsSold}</p>
                        <p className="text-sm text-muted-foreground">This Year</p>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <p className="text-3xl font-bold">{stats.totalProductsSold}</p>
                        <p className="text-sm text-muted-foreground">All Time</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Last 6 Months Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {monthlyBreakdown.map((month) => (
                      <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                        <span className="font-medium w-24">{month.month}</span>
                        <div className="flex gap-6 text-sm">
                          <div className="text-center">
                            <p className="font-bold text-primary">{month.bookings}</p>
                            <p className="text-xs text-muted-foreground">Bookings</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-accent">{month.orders}</p>
                            <p className="text-xs text-muted-foreground">Orders</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-green-600">${month.revenue.toFixed(0)}</p>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
