import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Trophy, GraduationCap, ShoppingBag, ArrowRight, Image as ImageIcon } from 'lucide-react';
import courtBanner from '@/assets/court-banner.jpg';
import courtAerial from '@/assets/court-aerial.jpg';
import courtDetail from '@/assets/court-detail.jpg';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
}

export default function Home() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data } = await supabase
        .from('gallery')
        .select('id, image_url, title')
        .order('created_at', { ascending: false })
        .limit(8);
      if (data) setGalleryImages(data);
    };
    fetchGallery();
  }, []);

  const features = [
    {
      icon: Calendar,
      title: 'Book Your Court',
      description: 'Reserve your preferred time slot with our real-time booking system',
      link: '/bookings',
      color: 'text-accent',
    },
    {
      icon: Trophy,
      title: 'Join Tournaments',
      description: 'Compete with players from the community in exciting tournaments',
      link: '/tournaments',
      color: 'text-secondary',
    },
    {
      icon: GraduationCap,
      title: 'Training Sessions',
      description: 'Improve your game with professional coaching and training',
      link: '/training',
      color: 'text-accent',
    },
    {
      icon: ShoppingBag,
      title: 'Shop Equipment',
      description: 'Get the best padel gear and accessories',
      link: '/shop',
      color: 'text-secondary',
    },
  ];

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={courtBanner}
            alt="PADELit Court"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/50" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 container mx-auto px-4 text-center text-primary-foreground"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            PADELit
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light">
            Like You Mean It
          </p>
          <p className="text-lg mb-10 max-w-2xl mx-auto">
            Bekaa's first padel court, where community meets passion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/bookings">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                Book Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What We Offer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need for an amazing padel experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link to={feature.link}>
                  <div className="bg-card rounded-xl p-8 hover:shadow-elevated transition-all duration-300 h-full hover:-translate-y-1 border border-border">
                    <feature.icon className={`h-12 w-12 mb-4 ${feature.color}`} />
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Court Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Court</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade facilities in the heart of Bekaa
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-xl overflow-hidden shadow-elevated"
            >
              <img
                src={courtAerial}
                alt="Aerial view of court"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-xl overflow-hidden shadow-elevated"
            >
              <img
                src={courtDetail}
                alt="Court detail"
                className="w-full h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
                <ImageIcon className="h-10 w-10 text-accent" />
                Gallery
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Moments from our tournaments, training sessions, and community events
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="aspect-square rounded-xl overflow-hidden shadow-elevated"
                >
                  <img
                    src={image.image_url}
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-10"
            >
              <Link to="/gallery">
                <Button variant="outline" size="lg" className="gap-2">
                  View Full Gallery
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Play?</h2>
            <p className="text-xl mb-10 max-w-2xl mx-auto">
              Book your court today and experience the best padel in Bekaa
            </p>
            <Link to="/bookings">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2">
                Book Your Court Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
