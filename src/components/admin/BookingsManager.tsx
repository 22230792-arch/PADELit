import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Trash2, RefreshCw } from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  privacy: string;
  recurrence: string;
  status: string;
  profiles?: {
    full_name: string;
    email: string;
  };
}

export const BookingsManager = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(full_name, email)')
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false });

    if (error) {
      toast.error('Failed to load bookings');
      console.error(error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete booking');
      console.error(error);
    } else {
      toast.success('Booking deleted');
      fetchBookings();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bookings Management</CardTitle>
            <CardDescription>View and manage all court bookings</CardDescription>
          </div>
          <Button onClick={fetchBookings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Privacy</TableHead>
                  <TableHead>Recurrence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell>
                      {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{booking.profiles?.full_name}</div>
                        <div className="text-sm text-muted-foreground">{booking.profiles?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={booking.privacy === 'private' ? 'secondary' : 'outline'}>
                        {booking.privacy}
                      </Badge>
                    </TableCell>
                    <TableCell>{booking.recurrence}</TableCell>
                    <TableCell>
                      <Badge>{booking.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
