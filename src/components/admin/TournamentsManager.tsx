import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Plus, Trash2, Eye, Upload, RefreshCw, Trophy } from 'lucide-react';

interface Tournament {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string | null;
  max_participants: number | null;
  registration_deadline: string | null;
  status: string;
  winner_team: string | null;
  runner_up_team: string | null;
  results_notes: string | null;
  tournament_registrations: Array<{
    id: string;
    profiles: {
      full_name: string;
      email: string;
    };
    partner_name: string | null;
  }>;
}

export const TournamentsManager = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    max_participants: '',
    registration_deadline: '',
    status: 'upcoming',
  });
  const [resultsData, setResultsData] = useState({
    winner_team: '',
    runner_up_team: '',
    results_notes: '',
  });
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchTournaments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tournaments')
      .select('*, tournament_registrations(id, profiles(full_name, email), partner_name)')
      .order('start_date', { ascending: false });

    if (error) {
      toast.error('Failed to load tournaments');
      console.error(error);
    } else {
      setTournaments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let imageUrl = null;
    if (imageFile) {
      setUploading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `tournaments/${fileName}`;

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

    const { error } = await supabase.from('tournaments').insert({
      ...formData,
      image_url: imageUrl,
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
    });

    if (error) {
      toast.error('Failed to create tournament');
      console.error(error);
    } else {
      toast.success('Tournament created successfully');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        max_participants: '',
        registration_deadline: '',
        status: 'upcoming',
      });
      setImageFile(null);
      fetchTournaments();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return;

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete tournament');
      console.error(error);
    } else {
      toast.success('Tournament deleted');
      fetchTournaments();
    }
  };

  const openResultsDialog = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setResultsData({
      winner_team: tournament.winner_team || '',
      runner_up_team: tournament.runner_up_team || '',
      results_notes: tournament.results_notes || '',
    });
    setResultsDialogOpen(true);
  };

  const handleSaveResults = async () => {
    if (!selectedTournament) return;

    const { error } = await supabase
      .from('tournaments')
      .update({
        winner_team: resultsData.winner_team || null,
        runner_up_team: resultsData.runner_up_team || null,
        results_notes: resultsData.results_notes || null,
        status: 'completed',
      })
      .eq('id', selectedTournament.id);

    if (error) {
      toast.error('Failed to save results');
      console.error(error);
    } else {
      toast.success('Tournament results saved');
      setResultsDialogOpen(false);
      fetchTournaments();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tournaments Management</CardTitle>
            <CardDescription>Create and manage tournaments</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchTournaments} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tournament
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Tournament</DialogTitle>
                  <DialogDescription>Add a new tournament for players to register</DialogDescription>
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
                    <Label>Tournament Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date*</Label>
                      <Input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                      <Label>Registration Deadline</Label>
                      <Input
                        type="date"
                        value={formData.registration_deadline}
                        onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Create Tournament'}
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
        ) : tournaments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No tournaments found</div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <Card key={tournament.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">{tournament.title}</h3>
                        <Badge>{tournament.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{tournament.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Start:</span>{' '}
                          {format(new Date(tournament.start_date), 'MMM d, yyyy')}
                        </div>
                        {tournament.end_date && (
                          <div>
                            <span className="text-muted-foreground">End:</span>{' '}
                            {format(new Date(tournament.end_date), 'MMM d, yyyy')}
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Registered:</span>{' '}
                          {tournament.tournament_registrations?.length || 0}
                          {tournament.max_participants && ` / ${tournament.max_participants}`}
                        </div>
                        {tournament.winner_team && (
                          <div className="col-span-2 mt-2">
                            <span className="text-muted-foreground">Winner:</span>{' '}
                            <span className="font-semibold text-accent">{tournament.winner_team}</span>
                            {tournament.runner_up_team && (
                              <span className="text-muted-foreground ml-2">
                                | Runner-up: {tournament.runner_up_team}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedTournament(tournament)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Registrations
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Tournament Registrations</DialogTitle>
                            <DialogDescription>{tournament.title}</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4">
                            {tournament.tournament_registrations?.length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                No registrations yet
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Partner</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tournament.tournament_registrations?.map((reg) => (
                                    <TableRow key={reg.id}>
                                      <TableCell>{reg.profiles?.full_name}</TableCell>
                                      <TableCell>{reg.profiles?.email}</TableCell>
                                      <TableCell>{reg.partner_name || '-'}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openResultsDialog(tournament)}
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Results
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tournament.id)}
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

        {/* Results Dialog */}
        <Dialog open={resultsDialogOpen} onOpenChange={setResultsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tournament Results</DialogTitle>
              <DialogDescription>{selectedTournament?.title}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Winner Team/Player</Label>
                <Input
                  value={resultsData.winner_team}
                  onChange={(e) => setResultsData({ ...resultsData, winner_team: e.target.value })}
                  placeholder="Enter winner name(s)"
                />
              </div>
              <div>
                <Label>Runner-up Team/Player</Label>
                <Input
                  value={resultsData.runner_up_team}
                  onChange={(e) => setResultsData({ ...resultsData, runner_up_team: e.target.value })}
                  placeholder="Enter runner-up name(s)"
                />
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={resultsData.results_notes}
                  onChange={(e) => setResultsData({ ...resultsData, results_notes: e.target.value })}
                  placeholder="Final score, notable moments, etc."
                  rows={3}
                />
              </div>
              <Button onClick={handleSaveResults} className="w-full">
                <Trophy className="h-4 w-4 mr-2" />
                Save Results
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
