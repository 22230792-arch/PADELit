import { Link } from "react-router-dom";
import { MapPin, Phone, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">PADELit</h3>
            <p className="text-sm opacity-90">
              Bekaa's first padel court, bringing the sport to our community
              since June 2024.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              <Link
                to="/bookings"
                className="block hover:text-secondary transition-colors"
              >
                Book Court
              </Link>
              <Link
                to="/tournaments"
                className="block hover:text-secondary transition-colors"
              >
                Tournaments
              </Link>
              <Link
                to="/training"
                className="block hover:text-secondary transition-colors"
              >
                Training Sessions
              </Link>
              <Link
                to="/shop"
                className="block hover:text-secondary transition-colors"
              >
                Shop
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Barelias, Bekaa, Lebanon</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 shrink-0" />
                <span>+961 70 621 815</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 shrink-0" />
                <span>padelit.lb@outlook.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm opacity-75">
          <p>&copy; {new Date().getFullYear()} PADELit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
