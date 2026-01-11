import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  created_at: string;
}

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Failed to load gallery');
    } else {
      setImages(data || []);
    }
  };

  const handleImageClick = (image: GalleryImage) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
            <ImageIcon className="h-12 w-12 text-accent" />
            Gallery
          </h1>
          <p className="text-lg text-muted-foreground">
            Moments from PADELit - tournaments, training, and community events
          </p>
        </div>

        {images.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Images Yet</h3>
              <p className="text-muted-foreground">
                Check back soon for photos from our events!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(image => (
              <Card
                key={image.id}
                className="overflow-hidden cursor-pointer hover:shadow-elevated transition-all hover:-translate-y-1"
                onClick={() => handleImageClick(image)}
              >
                <CardContent className="p-0">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.title || 'Gallery image'}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  {image.title && (
                    <div className="p-4">
                      <h3 className="font-semibold text-sm">{image.title}</h3>
                      {image.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {image.description}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl">
            {selectedImage && (
              <div className="space-y-4">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.title || 'Gallery image'}
                  className="w-full rounded-lg"
                />
                {(selectedImage.title || selectedImage.description) && (
                  <div>
                    {selectedImage.title && (
                      <h3 className="text-xl font-bold mb-2">{selectedImage.title}</h3>
                    )}
                    {selectedImage.description && (
                      <p className="text-muted-foreground">{selectedImage.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
