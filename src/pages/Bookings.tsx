import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { format, isBefore, startOfDay, isToday, parse } from 'date-fns';
import { Clock, Calendar as CalendarIcon, Lock, Unlock, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  privacy: string;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

export default function Bookings() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [privacy, setPrivacy] = useState<'private' | 'public'>('public');
  const [recurrence, setRecurrence] = useState<'one_time' | 'weekly'>('one_time');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  const fetchBookings = async (selectedDate?: Date) => {
    const dateToFetch = selectedDate || date;
    if (!dateToFetch) return;

    const formattedDate = format(dateToFetch, 'yyyy-MM-dd');
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles(full_name)')
      .eq('booking_date', formattedDate)
      .order('start_time');

    if (error) {
      console.error('Error fetching bookings:', error);
    } else {
      setBookings(data || []);
    }
  };

  useEffect(() => {
    if (date) {
      fetchBookings(date);
    }
  }, [date]);

  useEffect(() => {
    if (!date) return;

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [date]);

  const isTimeSlotPast = (time: string) => {
    if (!date || !isToday(date)) return false;
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime <= now;
  };

  const isTimeSlotBooked = (time: string) => {
    return bookings.some(booking => booking.start_time.substring(0, 5) === time);
  };

  const getBookingForTime = (time: string) => {
    return bookings.find(booking => booking.start_time.substring(0, 5) === time);
  };

  // Filter out past time slots for display
  const visibleTimeSlots = timeSlots.filter(time => !isTimeSlotPast(time));
  
  // Filter out past bookings for display
  const visibleBookings = bookings.filter(booking => !isTimeSlotPast(booking.start_time.substring(0, 5)));

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book a court');
      navigate('/auth');
      return;
    }

    if (!date || !selectedTime) {
      toast.error('Please select a date and time');
      return;
    }

    if (isBefore(startOfDay(date), startOfDay(new Date()))) {
      toast.error('Cannot book past dates');
      return;
    }

    if (isTimeSlotBooked(selectedTime)) {
      toast.error('This time slot is already booked');
      return;
    }

    setLoading(true);

    const startTimeParts = selectedTime.split(':');
    const endHour = (parseInt(startTimeParts[0]) + 1).toString().padStart(2, '0');
    const endTime = `${endHour}:${startTimeParts[1]}`;

    const { error } = await supabase.from('bookings').insert({
      user_id: user.id,
      booking_date: format(date, 'yyyy-MM-dd'),
      start_time: selectedTime,
      end_time: endTime,
      privacy,
      recurrence,
    });

    setLoading(false);

    if (error) {
      toast.error('Failed to create booking');
      console.error(error);
    } else {
      toast.success('Court booked successfully!');
      setSelectedTime('');
      fetchBookings();
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Book Your Court</h1>
          <p className="text-lg text-muted-foreground">
            Select your preferred date and time slot
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Calendar and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Select Date & Time
              </CardTitle>
              <CardDescription>Choose your booking date and available time slot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) => isBefore(startOfDay(date), startOfDay(new Date()))}
                  className="rounded-lg border"
                />
              </div>

              {date && (
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <Clock className="h-4 w-4" />
                    Available Time Slots for {format(date, 'MMMM d, yyyy')}
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {visibleTimeSlots.length === 0 ? (
                      <p className="col-span-3 text-center text-muted-foreground py-4">
                        No available time slots remaining today
                      </p>
                    ) : (
                      visibleTimeSlots.map((time) => {
                        const isBooked = isTimeSlotBooked(time);
                        const booking = getBookingForTime(time);
                        
                        return (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            className={`${isBooked ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isBooked}
                            onClick={() => setSelectedTime(time)}
                            size="sm"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <span>{time}</span>
                              {isBooked && booking && (
                                <span className="text-xs">
                                  {booking.privacy === 'private' ? (
                                    <Lock className="h-3 w-3" />
                                  ) : (
                                    booking.profiles?.full_name?.substring(0, 8) || 'Booked'
                                  )}
                                </span>
                              )}
                            </div>
                          </Button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Options */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Options</CardTitle>
              <CardDescription>Configure your booking preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Privacy</Label>
                <RadioGroup value={privacy} onValueChange={(v) => setPrivacy(v as any)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="public" id="public" />
                    <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Unlock className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Public</div>
                        <div className="text-sm text-muted-foreground">Others can see who booked</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="private" id="private" />
                    <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Lock className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Private</div>
                        <div className="text-sm text-muted-foreground">Keep your booking anonymous</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-3 block">Recurrence</Label>
                <RadioGroup value={recurrence} onValueChange={(v) => setRecurrence(v as any)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="one_time" id="one_time" />
                    <Label htmlFor="one_time" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CalendarIcon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">One Time</div>
                        <div className="text-sm text-muted-foreground">Single booking</div>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly" className="flex items-center gap-2 cursor-pointer flex-1">
                      <RefreshCw className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Weekly</div>
                        <div className="text-sm text-muted-foreground">Repeat every week</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {selectedTime && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p>Date: {date && format(date, 'MMMM d, yyyy')}</p>
                    <p>Time: {selectedTime} - {selectedTime.split(':')[0]}:{(parseInt(selectedTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00</p>
                    <p>Privacy: {privacy.charAt(0).toUpperCase() + privacy.slice(1)}</p>
                    <p>Recurrence: {recurrence === 'one_time' ? 'One Time' : 'Weekly'}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBooking}
                disabled={!selectedTime || loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's Bookings */}
        {visibleBookings.length > 0 && (
          <Card className="max-w-6xl mx-auto mt-8">
            <CardHeader>
              <CardTitle>Upcoming Bookings for {date && format(date, 'MMMM d, yyyy')}</CardTitle>
              <CardDescription>View scheduled bookings for this date</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {visibleBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                        </div>
                        {booking.privacy === 'public' && booking.profiles?.full_name && (
                          <div className="text-sm text-muted-foreground">
                            Booked by {booking.profiles.full_name}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.privacy === 'private' ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Unlock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
