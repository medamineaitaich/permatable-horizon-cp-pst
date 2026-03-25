import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { toast } from 'sonner';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully');
      setFormData({ name: '', email: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - Permatable</title>
        <meta name="description" content="Get in touch with Permatable about compost, permaculture, and soil health." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-1 py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance" style={{letterSpacing: '-0.02em'}}>
                Get in touch
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Have questions about compost, permaculture, or soil health? We're here to help.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Contact Form */}
              <Card className="rounded-2xl shadow-lg">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 bg-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 bg-background border-border text-foreground"
                      />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="mt-1 bg-background border-border text-foreground"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full transition-all duration-200 active:scale-[0.98]"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Company Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-6">MEDAIT LLC</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">Address</p>
                        <p className="text-muted-foreground">
                          1209 MOUNTAIN ROAD PL NE STE R<br />
                          Albuquerque, NM 87110
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">Phone</p>
                        <a 
                          href="tel:+12027737432"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          +1 (202) 773-7432
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Mail className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium mb-1">Email</p>
                        <a 
                          href="mailto:CONTACT@MEDAITLLC.COM"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          CONTACT@MEDAITLLC.COM
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="bg-muted/50 rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">Visit our store</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Check out our sustainable products and permaculture supplies
                    </p>
                    <a 
                      href="https://anfastyles.shop" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="w-full transition-all duration-200 active:scale-[0.98]">
                        Visit anfastyles.shop
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactPage;
