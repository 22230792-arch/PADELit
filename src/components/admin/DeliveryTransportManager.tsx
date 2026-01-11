import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Truck,
  Car,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  Package,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  products: { name: string; image_url: string | null } | null;
}

interface DeliveryOrder {
  id: string;
  total_amount: number;
  delivery_required: boolean;
  delivery_address: string | null;
  delivery_notes: string | null;
  status: string;
  delivery_status: string | null;
  payment_status: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
    phone: string | null;
  } | null;
  order_items: OrderItem[];
}

interface TransportRegistration {
  id: string;
  transportation_required: boolean;
  pickup_location: string | null;
  transportation_status: string | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
    phone: string | null;
  } | null;
  training_sessions?: { title: string; session_date: string } | null;
  tournaments?: { title: string; start_date: string } | null;
}

export default function DeliveryTransportManager() {
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [trainingTransport, setTrainingTransport] = useState<
    TransportRegistration[]
  >([]);
  const [tournamentTransport, setTournamentTransport] = useState<
    TransportRegistration[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    // Fetch orders with delivery and order items
    const { data: orders } = await supabase
      .from("orders")
      .select(
        "*, profiles(full_name, email, phone), order_items(id, product_id, quantity, price, products(name, image_url))"
      )
      .eq("delivery_required", true)
      .order("created_at", { ascending: false });

    // Fetch training registrations with transportation
    const { data: trainingRegs } = await supabase
      .from("training_registrations")
      .select(
        "*, profiles(full_name, email, phone), training_sessions(title, session_date)"
      )
      .eq("transportation_required", true)
      .order("created_at", { ascending: false });

    // Fetch tournament registrations with transportation
    const { data: tournamentRegs } = await supabase
      .from("tournament_registrations")
      .select(
        "*, profiles(full_name, email, phone), tournaments(title, start_date)"
      )
      .eq("transportation_required", true)
      .order("created_at", { ascending: false });

    setDeliveryOrders((orders as DeliveryOrder[]) || []);
    setTrainingTransport((trainingRegs as TransportRegistration[]) || []);
    setTournamentTransport((tournamentRegs as TransportRegistration[]) || []);
    setIsLoading(false);
  };

  const toggleDeliveryStatus = async (
    orderId: string,
    currentStatus: string | null
  ) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";

    // Find the order to get its items
    const order = deliveryOrders.find((o) => o.id === orderId);

    // If marking as done, decrease stock for each product
    if (newStatus === "done" && order) {
      for (const item of order.order_items || []) {
        // Get current stock
        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (product) {
          const newStock = Math.max(0, product.stock - item.quantity);
          await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.product_id);
        }
      }
    }

    const { error } = await supabase
      .from("orders")
      .update({
        delivery_status: newStatus,
        status: newStatus === "done" ? "confirmed" : "pending",
      })
      .eq("id", orderId);

    if (error) {
      toast.error("Failed to update delivery status");
      console.error("Error updating delivery status:", error);
    } else {
      toast.success(
        `Delivery marked as ${newStatus}${
          newStatus === "done" ? " - Stock updated" : ""
        }`
      );
      setDeliveryOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                delivery_status: newStatus,
                status: newStatus === "done" ? "confirmed" : "pending",
              }
            : o
        )
      );
    }
  };

  const toggleTrainingTransportStatus = async (
    regId: string,
    currentStatus: string | null
  ) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";

    const { error } = await supabase
      .from("training_registrations")
      .update({ transportation_status: newStatus })
      .eq("id", regId);

    if (error) {
      toast.error("Failed to update transportation status");
      console.error("Error updating transportation status:", error);
    } else {
      toast.success(`Transportation marked as ${newStatus}`);
      setTrainingTransport((prev) =>
        prev.map((reg) =>
          reg.id === regId ? { ...reg, transportation_status: newStatus } : reg
        )
      );
    }
  };

  const toggleTournamentTransportStatus = async (
    regId: string,
    currentStatus: string | null
  ) => {
    const newStatus = currentStatus === "done" ? "pending" : "done";

    const { error } = await supabase
      .from("tournament_registrations")
      .update({ transportation_status: newStatus })
      .eq("id", regId);

    if (error) {
      toast.error("Failed to update transportation status");
      console.error("Error updating transportation status:", error);
    } else {
      toast.success(`Transportation marked as ${newStatus}`);
      setTournamentTransport((prev) =>
        prev.map((reg) =>
          reg.id === regId ? { ...reg, transportation_status: newStatus } : reg
        )
      );
    }
  };

  const deleteDeliveryOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to delete this delivery order?"))
      return;

    const { error } = await supabase.from("orders").delete().eq("id", orderId);

    if (error) {
      toast.error("Failed to delete order");
      console.error("Error deleting order:", error);
    } else {
      toast.success("Order deleted");
      setDeliveryOrders((prev) => prev.filter((order) => order.id !== orderId));
    }
  };

  const deleteTrainingTransport = async (regId: string) => {
    if (
      !confirm("Are you sure you want to delete this transportation request?")
    )
      return;

    const { error } = await supabase
      .from("training_registrations")
      .delete()
      .eq("id", regId);

    if (error) {
      toast.error("Failed to delete transportation request");
      console.error("Error deleting transportation request:", error);
    } else {
      toast.success("Transportation request deleted");
      setTrainingTransport((prev) => prev.filter((reg) => reg.id !== regId));
    }
  };

  const deleteTournamentTransport = async (regId: string) => {
    if (
      !confirm("Are you sure you want to delete this transportation request?")
    )
      return;

    const { error } = await supabase
      .from("tournament_registrations")
      .delete()
      .eq("id", regId);

    if (error) {
      toast.error("Failed to delete transportation request");
      console.error("Error deleting transportation request:", error);
    } else {
      toast.success("Transportation request deleted");
      setTournamentTransport((prev) => prev.filter((reg) => reg.id !== regId));
    }
  };

  const getPaymentBadge = (paymentStatus: string | null) => {
    if (paymentStatus === "paid") {
      return (
        <Badge variant="default" className="bg-green-500">
          Paid
        </Badge>
      );
    } else if (paymentStatus === "whish_pending") {
      return (
        <Badge variant="secondary" className="bg-purple-500 text-white">
          Whish Pending
        </Badge>
      );
    }
    return <Badge variant="outline">Cash on Delivery</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Delivery & Transportation Requests
        </CardTitle>
        <CardDescription>
          Manage delivery orders and transportation requests for events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="delivery">
          <TabsList className="mb-4">
            <TabsTrigger value="delivery" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Delivery ({deliveryOrders.length})
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Training Transport ({trainingTransport.length})
            </TabsTrigger>
            <TabsTrigger value="tournament" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              Tournament Transport ({tournamentTransport.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="delivery" className="space-y-4">
            {deliveryOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No delivery requests
              </p>
            ) : (
              deliveryOrders.map((order) => (
                <Card
                  key={order.id}
                  className={
                    order.delivery_status === "done" ? "opacity-60" : ""
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {order.profiles?.full_name ||
                              order.profiles?.email ||
                              "Unknown"}
                          </span>
                          {getPaymentBadge(order.payment_status)}
                          {order.delivery_status === "done" && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Delivered
                            </Badge>
                          )}
                        </div>
                        {order.profiles?.phone && (
                          <p className="text-sm text-muted-foreground">
                            Phone: {order.profiles.phone}
                          </p>
                        )}
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm">{order.delivery_address}</p>
                            {order.delivery_notes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Notes: {order.delivery_notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Order Items:
                            </span>
                          </div>
                          <div className="space-y-2 pl-6">
                            {order.order_items?.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 text-sm"
                              >
                                {item.products?.image_url && (
                                  <img
                                    src={item.products.image_url}
                                    alt={item.products?.name || "Product"}
                                    className="w-8 h-8 rounded object-cover"
                                  />
                                )}
                                <span className="flex-1">
                                  {item.products?.name || "Unknown Product"}
                                </span>
                                <Badge variant="outline">
                                  x{item.quantity}
                                </Badge>
                                <span className="text-muted-foreground">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-bold text-accent">
                          ${order.total_amount}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </p>
                        <div className="flex items-center gap-2 justify-end">
                          <Checkbox
                            id={`delivery-${order.id}`}
                            checked={order.delivery_status === "done"}
                            onCheckedChange={() =>
                              toggleDeliveryStatus(
                                order.id,
                                order.delivery_status
                              )
                            }
                          />
                          <Label
                            htmlFor={`delivery-${order.id}`}
                            className="text-xs cursor-pointer"
                          >
                            Done
                          </Label>
                        </div>
                        {order.delivery_status === "done" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteDeliveryOrder(order.id)}
                            className="mt-2"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="training" className="space-y-4">
            {trainingTransport.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transportation requests for training
              </p>
            ) : (
              trainingTransport.map((reg) => (
                <Card
                  key={reg.id}
                  className={
                    reg.transportation_status === "done" ? "opacity-60" : ""
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {reg.profiles?.full_name ||
                              reg.profiles?.email ||
                              "Unknown"}
                          </span>
                          {reg.transportation_status === "done" && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        {reg.profiles?.phone && (
                          <p className="text-sm text-muted-foreground">
                            Phone: {reg.profiles.phone}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {reg.training_sessions?.title} -{" "}
                            {reg.training_sessions?.session_date &&
                              format(
                                new Date(reg.training_sessions.session_date),
                                "MMM d, yyyy"
                              )}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">
                            {reg.pickup_location || "No location specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`training-transport-${reg.id}`}
                            checked={reg.transportation_status === "done"}
                            onCheckedChange={() =>
                              toggleTrainingTransportStatus(
                                reg.id,
                                reg.transportation_status
                              )
                            }
                          />
                          <Label
                            htmlFor={`training-transport-${reg.id}`}
                            className="text-xs cursor-pointer"
                          >
                            Done
                          </Label>
                        </div>
                        {reg.transportation_status === "done" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTrainingTransport(reg.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="tournament" className="space-y-4">
            {tournamentTransport.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transportation requests for tournaments
              </p>
            ) : (
              tournamentTransport.map((reg) => (
                <Card
                  key={reg.id}
                  className={
                    reg.transportation_status === "done" ? "opacity-60" : ""
                  }
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {reg.profiles?.full_name ||
                              reg.profiles?.email ||
                              "Unknown"}
                          </span>
                          {reg.transportation_status === "done" && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          )}
                        </div>
                        {reg.profiles?.phone && (
                          <p className="text-sm text-muted-foreground">
                            Phone: {reg.profiles.phone}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {reg.tournaments?.title} -{" "}
                            {reg.tournaments?.start_date &&
                              format(
                                new Date(reg.tournaments.start_date),
                                "MMM d, yyyy"
                              )}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">
                            {reg.pickup_location || "No location specified"}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`tournament-transport-${reg.id}`}
                            checked={reg.transportation_status === "done"}
                            onCheckedChange={() =>
                              toggleTournamentTransportStatus(
                                reg.id,
                                reg.transportation_status
                              )
                            }
                          />
                          <Label
                            htmlFor={`tournament-transport-${reg.id}`}
                            className="text-xs cursor-pointer"
                          >
                            Done
                          </Label>
                        </div>
                        {reg.transportation_status === "done" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTournamentTransport(reg.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
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
