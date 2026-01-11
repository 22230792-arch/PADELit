import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShoppingCart, User, Package, CheckCircle, Clock, Truck, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: { name: string; image_url: string | null } | null;
}

interface Order {
  id: string;
  total_amount: number;
  delivery_required: boolean;
  delivery_address: string | null;
  delivery_notes: string | null;
  status: string;
  delivery_status: string | null;
  payment_status: string | null;
  created_at: string;
  profiles: { full_name: string | null; email: string; phone: string | null } | null;
  order_items: OrderItem[];
}

export function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email, phone), order_items(id, product_id, quantity, price, products(name, image_url))')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } else {
      setOrders((data as Order[]) || []);
    }
    setIsLoading(false);
  };

  const confirmOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Decrease stock for each product
    for (const item of order.order_items || []) {
      const { data: product } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product_id)
        .single();
      
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('id', item.product_id);
      }
    }

    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'confirmed',
        delivery_status: order.delivery_required ? 'pending' : 'done'
      })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to confirm order');
      console.error('Error confirming order:', error);
    } else {
      toast.success('Order confirmed - Stock updated');
      setOrders(prev => 
        prev.map(o => 
          o.id === orderId ? { 
            ...o, 
            status: 'confirmed',
            delivery_status: o.delivery_required ? 'pending' : 'done'
          } : o
        )
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (paymentStatus: string | null) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-500">Paid</Badge>;
      case 'whish_pending':
        return <Badge className="bg-purple-500 text-white">Whish Pending</Badge>;
      default:
        return <Badge variant="outline">Cash</Badge>;
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Orders Management
          </CardTitle>
          <CardDescription>
            View and confirm all customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="mb-4">
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Confirmed ({confirmedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                All Orders ({orders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <OrdersTable 
                orders={pendingOrders} 
                onConfirm={confirmOrder}
                onView={setSelectedOrder}
                getStatusBadge={getStatusBadge}
                getPaymentBadge={getPaymentBadge}
              />
            </TabsContent>

            <TabsContent value="confirmed">
              <OrdersTable 
                orders={confirmedOrders} 
                onView={setSelectedOrder}
                getStatusBadge={getStatusBadge}
                getPaymentBadge={getPaymentBadge}
              />
            </TabsContent>

            <TabsContent value="all">
              <OrdersTable 
                orders={orders} 
                onConfirm={confirmOrder}
                onView={setSelectedOrder}
                getStatusBadge={getStatusBadge}
                getPaymentBadge={getPaymentBadge}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Order placed on {selectedOrder && format(new Date(selectedOrder.created_at), 'MMM d, yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
                  <p className="font-medium">{selectedOrder.profiles?.full_name || 'N/A'}</p>
                  <p className="text-sm">{selectedOrder.profiles?.email}</p>
                  {selectedOrder.profiles?.phone && (
                    <p className="text-sm">{selectedOrder.profiles.phone}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Order Info</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedOrder.status)}
                    {getPaymentBadge(selectedOrder.payment_status)}
                  </div>
                  <p className="text-lg font-bold mt-2">${selectedOrder.total_amount}</p>
                </div>
              </div>

              {selectedOrder.delivery_required && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4" />
                    <span className="font-medium">Delivery Required</span>
                  </div>
                  <p className="text-sm">{selectedOrder.delivery_address}</p>
                  {selectedOrder.delivery_notes && (
                    <p className="text-sm text-muted-foreground mt-1">Notes: {selectedOrder.delivery_notes}</p>
                  )}
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.order_items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-muted rounded">
                      {item.products?.image_url && (
                        <img 
                          src={item.products.image_url} 
                          alt={item.products?.name || 'Product'} 
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.products?.name || 'Unknown Product'}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.price} x {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.status === 'pending' && (
                <Button 
                  onClick={() => {
                    confirmOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Order
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

interface OrdersTableProps {
  orders: Order[];
  onConfirm?: (orderId: string) => void;
  onView: (order: Order) => void;
  getStatusBadge: (status: string) => JSX.Element;
  getPaymentBadge: (status: string | null) => JSX.Element;
}

function OrdersTable({ orders, onConfirm, onView, getStatusBadge, getPaymentBadge }: OrdersTableProps) {
  if (orders.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No orders found</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Delivery</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.profiles?.full_name || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">{order.profiles?.email}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {order.order_items?.length || 0} items
            </TableCell>
            <TableCell className="font-bold">${order.total_amount}</TableCell>
            <TableCell>{getStatusBadge(order.status)}</TableCell>
            <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
            <TableCell>
              {order.delivery_required ? (
                <Badge variant="outline" className="flex items-center gap-1 w-fit">
                  <Truck className="h-3 w-3" />
                  Yes
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">No</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {format(new Date(order.created_at), 'MMM d, yyyy')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => onView(order)}>
                  <Eye className="h-4 w-4" />
                </Button>
                {order.status === 'pending' && onConfirm && (
                  <Button size="sm" onClick={() => onConfirm(order.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Confirm
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
