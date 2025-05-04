import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Facebook, Twitter, Mail, MapPin, Phone } from "lucide-react";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "We've received your message and will respond shortly.",
      });
      setFormData({ name: "", email: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <section className="section-padding bg-black">
      <div className="container">
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 animate-slide-up">
            Get in <span className="text-gradient">Touch</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-brand-red to-brand-blue mx-auto mb-6"></div>
          <p className="text-lg max-w-2xl mx-auto text-gray-300 animate-slide-up delay-100">
            Connect with us to discuss acquisitions, artist representation, or any questions
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-lg space-y-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="bg-white/5 border-white/10 focus:border-brand-red"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  required
                  className="bg-white/5 border-white/10 focus:border-brand-red"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block mb-2 text-sm font-medium">Message</label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                  className="bg-white/5 border-white/10 focus:border-brand-red min-h-[150px]"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-brand-red hover:bg-brand-red/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
          
          <div className="space-y-8 animate-slide-up delay-200">
            <div className="glass-card p-6 rounded-lg flex items-start gap-4">
              <MapPin className="h-6 w-6 text-brand-red shrink-0 mt-1" />
              <div>
                <h3 className="font-heading text-xl mb-1">Visit Our Gallery</h3>
                <p className="text-gray-300">
                  123 Art District Avenue<br />
                  New York, NY 10001<br />
                  United States<br />
                  Kerala, India
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Open Tuesday–Sunday: 10AM–8PM<br />
                  Closed Mondays
                </p>
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-lg flex items-start gap-4">
              <Mail className="h-6 w-6 text-brand-red shrink-0 mt-1" />
              <div>
                <h3 className="font-heading text-xl mb-1">Email Us</h3>
                <p className="text-gray-300">fameuxarte@gmail.com</p>
                <p className="text-sm text-muted-foreground mt-2">
                  We aim to respond within 24 hours
                </p>
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-lg flex items-start gap-4">
              <Phone className="h-6 w-6 text-brand-red shrink-0 mt-1" />
              <div>
                <h3 className="font-heading text-xl mb-1">Call Us</h3>
                <p className="text-gray-300">Arun Kumar (8921487385)</p>
                <p className="text-gray-300">Praveen Krishnan (8714318210)</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Monday–Friday: 9AM–6PM EST
                </p>
              </div>
            </div>
            
            <div className="flex justify-start gap-4 mt-6">
              <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-white/20 hover:bg-white/10">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
