import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Car, User, MapPin, Calendar, CheckCircle, Package, Archive } from 'lucide-react';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products: { name: string; image_url: string | null } | null;
}

interface CompletedDelivery {
  id: string;
  total_amount: number;
  delivery_address: string | null;
  delivery_notes: string | null;
  delivery_status: string | null;
  payment_status: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string; phone: string | null } | null;
  order_items: OrderItem[];
}

interface CompletedTransport {
  id: string;
  pickup_location: string | null;
  transportation_status: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string; phone: string | null } | null;
  training_sessions?: { title: string; session_date: string } | null;
  tournaments?: { title: string; start_date: string } | null;
}

export function HistoryManager() {
  const [completedDeliveries, setCompletedDeliveries] = useState<CompletedDelivery[]>([]);
  const [completedTrainingTransport, setCompletedTrainingTransport] = useState<CompletedTransport[]>([]);
  const [completedTournamentTransport, setCompletedTournamentTransport] = useState<CompletedTransport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);

    // Fetch completed deliveries
    const { data: deliveries } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email, phone), order_items(id, quantity, price, products(name, image_url))')
      .eq('delivery_required', true)
      .eq('delivery_status', 'done')
      .order('created_at', { ascending: false });

    // Fetch completed training transportation
    const { data: trainingTransport } = await supabase
      .from('training_registrations')
      .select('*, profiles(full_name, email, phone), training_sessions(title, session_date)')
      .eq('transportation_required', true)
      .eq('transportation_status', 'done')
      .order('created_at', { ascending: false });

    // Fetch completed tournament transportation
    const { data: tournamentTransport } = await supabase
      .from('tournament_registrations')
      .select('*, profiles(full_name, email, phone), tournaments(title, start_date)')
      .eq('transportation_required', true)
      .eq('transportation_status', 'done')
      .order('created_at', { ascending: false });

    setCompletedDeliveries((deliveries as CompletedDelivery[]) || []);
    setCompletedTrainingTransport((trainingTransport as CompletedTransport[]) || []);
    setCompletedTournamentTransport((tournamentTransport as CompletedTransport[]) || []);
    setIsLoading(false);
  };

  const getPaymentBadge = (paymentStatus: string | null) => {
    if (paymentStatus === 'paid') {
      return <Badge variant="default" className="bg-green-500">Paid</Badge>;
    } else if (paymentStatus === 'whish_pending') {
      return <Badge variant="secondary" className="bg-purple-500 text-white">Whish</Badge>;
    }
    return <Badge variant="outline">Cash</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          Completed History
        </CardTitle>
        <CardDescription>View all completed deliveries and transportation requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="deliveries" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deliveries" className="gap-2">
              <Truck className="h-4 w-4" />
              Deliveries ({completedDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="training" className="gap-2">
              <Car className="h-4 w-4" />
              Training ({completedTrainingTransport.length})
            </TabsTrigger>
            <TabsTrigger value="tournament" className="gap-2">
              <Car className="h-4 w-4" />
              Tournament ({completedTournamentTransport.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="space-y-4">
            {completedDeliveries.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed deliveries</p>
            ) : (
              completedDeliveries.map((order) => (
                <Card key={order.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {order.profiles?.full_name || order.profiles?.email || 'Unknown'}
                          </span>
                          {getPaymentBadge(order.payment_status)}
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Delivered
                          </Badge>
                        </div>
                        {order.profiles?.phone && (
                          <p className="text-sm text-muted-foreground">Phone: {order.profiles.phone}</p>
                        )}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{order.delivery_address}</p>
                        </div>
                        
                        {/* Order Items */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Order Items:</span>
                          </div>
                          <div className="space-y-2 pl-6">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="flex items-center gap-3 text-sm">
                                {item.products?.image_url && (
                                  <img 
                                    src={item.products.image_url} 
                                    alt={item.products?.name || 'Product'} 
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                <span className="flex-1">{item.products?.name || 'Unknown Product'}</span>
                                <Badge variant="outline">x{item.quantity}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">${order.total_amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            {completedTrainingTransport.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed training transportation</p>
            ) : (
              completedTrainingTransport.map((reg) => (
                <Card key={reg.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {reg.profiles?.full_name || reg.profiles?.email || 'Unknown'}
                          </span>
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                        {reg.profiles?.phone && (
                          <p className="text-sm text-muted-foreground">Phone: {reg.profiles.phone}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {reg.training_sessions?.title} - {' '}
                            {reg.training_sessions?.session_date && 
                              format(new Date(reg.training_sessions.session_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{reg.pickup_location || 'No location specified'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(reg.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="tournament" className="space-y-4">
            {completedTournamentTransport.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed tournament transportation</p>
            ) : (
              completedTournamentTransport.map((reg) => (
                <Card key={reg.id} className="bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {reg.profiles?.full_name || reg.profiles?.email || 'Unknown'}
                          </span>
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                        {reg.profiles?.phone && (
                          <p className="text-sm text-muted-foreground">Phone: {reg.profiles.phone}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {reg.tournaments?.title} - {' '}
                            {reg.tournaments?.start_date && 
                              format(new Date(reg.tournaments.start_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{reg.pickup_location || 'No location specified'}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(reg.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
