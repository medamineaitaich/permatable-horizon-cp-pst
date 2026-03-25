import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold">Permatable</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Practical education on compost, permaculture, and soil health.
            </p>
          </div>

          {/* Company Info */}
          <div>
            <h3 className="font-semibold mb-4">MEDAIT LLC</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>1209 MOUNTAIN ROAD PL NE STE R<br />Albuquerque, NM 87110</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+12027737432" className="hover:text-primary transition-colors">
                  +1 (202) 773-7432
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:CONTACT@MEDAITLLC.COM" className="hover:text-primary transition-colors">
                  CONTACT@MEDAITLLC.COM
                </a>
              </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link to="/blog" className="block text-muted-foreground hover:text-primary transition-colors">
                Blog
              </Link>
              <Link to="/contact" className="block text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <a 
                href="https://anfastyles.shop" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-muted-foreground hover:text-primary transition-colors"
              >
                Visit Our Store
              </a>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MEDAIT LLC. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
