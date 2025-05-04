import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight } from "lucide-react";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success!",
        description: "You've been added to our newsletter list.",
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section className="bg-maze-pattern bg-fixed py-16 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-brand-red/30 to-brand-blue/30 backdrop-blur-sm"></div>
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold animate-slide-up">
            Stay Updated with <span className="text-gradient">New Arrivals</span>
          </h2>
          <p className="mt-3 text-gray-200 animate-slide-up delay-100">
            Subscribe to our newsletter to receive updates about new artworks, 
            artist interviews, and exclusive promotions.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-4 sm:mx-auto sm:max-w-md">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 border-white/20 placeholder:text-white/50 focus:border-brand-red"
              />
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-brand-blue hover:bg-brand-blue/90 group flex items-center gap-2 rounded-lg"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe"}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
          <p className="mt-4 text-xs text-gray-300 animate-slide-up delay-200">
            By subscribing, you agree to our Privacy Policy and consent to receive updates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
