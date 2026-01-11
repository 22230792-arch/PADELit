import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash2, Eye, RefreshCw } from 'lucide-react';

interface TrainingSession {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  session_date: string;
  start_time: string;
  end_time: string;
  max_participants: number | null;
  price: number | null;
  status: string;
  training_registrations: Array<{
    id: string;
    profiles: {
      full_name: string;
      email: string;
    };
  }>;
}

export const TrainingManager = () => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    session_date: '',
    start_time: '',
    end_time: '',
    max_participants: '',
    price: '',
    status: 'upcoming',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('training_sessions')
      .select('*, training_registrations(id, profiles(full_name, email))')
      .order('session_date', { ascending: false });

    if (error) {
      toast.error('Failed to load training sessions');
      console.error(error);
    } else {
      setSessions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = null;
    if (imageFile) {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `training/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('padel-uploads')
        .upload(filePath, imageFile);

      if (uploadError) {
        toast.error('Failed to upload image');
        console.error(uploadError);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('padel-uploads')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;
      setUploading(false);
    }

    const { error } = await supabase.from('training_sessions').insert({
      ...formData,
      image_url: imageUrl,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      price: formData.price ? parseFloat(formData.price) : null,
    });

    if (error) {
      toast.error('Failed to create training session');
      console.error(error);
    } else {
      toast.success('Training session created successfully');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        session_date: '',
        start_time: '',
        end_time: '',
        max_participants: '',
        price: '',
        status: 'upcoming',
      });
      setImageFile(null);
      fetchSessions();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training session?')) return;

    const { error } = await supabase
      .from('training_sessions')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete training session');
      console.error(error);
    } else {
      toast.success('Training session deleted');
      fetchSessions();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Training Sessions Management</CardTitle>
            <CardDescription>Create and manage training sessions</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSessions} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Session
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Training Session</DialogTitle>
                  <DialogDescription>Add a new training session</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label>Title*</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Session Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div>
                    <Label>Session Date*</Label>
                    <Input
                      type="date"
                      value={formData.session_date}
                      onChange={(e) => setFormData({ ...formData, session_date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time*</Label>
                      <Input
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>End Time*</Label>
                      <Input
                        type="time"
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Participants</Label>
                      <Input
                        type="number"
                        value={formData.max_participants}
                        onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Create Training Session'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No training sessions found</div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{session.title}</h3>
                        <Badge>{session.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{session.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Date:</span>{' '}
                          {format(new Date(session.session_date), 'MMM d, yyyy')}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Time:</span>{' '}
                          {session.start_time.substring(0, 5)} - {session.end_time.substring(0, 5)}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Registered:</span>{' '}
                          {session.training_registrations?.length || 0}
                          {session.max_participants && ` / ${session.max_participants}`}
                        </div>
                        {session.price && (
                          <div>
                            <span className="text-muted-foreground">Price:</span> ${session.price}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Registrations
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Training Registrations</DialogTitle>
                            <DialogDescription>{session.title}</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            {session.training_registrations?.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                No registrations yet
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {session.training_registrations?.map((reg) => (
                                    <TableRow key={reg.id}>
                                      <TableCell>{reg.profiles?.full_name}</TableCell>
                                      <TableCell>{reg.profiles?.email}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(session.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
