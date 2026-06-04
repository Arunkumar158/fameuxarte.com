
import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("support_messages").insert([formData]);

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });

      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-obsidian text-linen">
        {(() => {
          const HomeNav = require("@/components/home/HomeNav").default;
          return <HomeNav />;
        })()}

        <header className="border-b border-b-[0.5px] border-border-faint px-4 sm:px-6 py-8 sm:py-12">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-[28px] sm:text-[34px] font-medium leading-[1.12] tracking-[-0.025em] text-linen mb-3">
              Contact Us
            </h1>
            <p className="text-[14px] text-stone">
              We're here to help with your art collecting journey.
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              <div>
                <label htmlFor="name" className="block mb-2 text-[12px] font-medium uppercase tracking-[0.1em] text-stone">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="h-12 bg-surface-2 border-border-subtle focus-visible:ring-gold/30 text-linen placeholder:text-[#555]"
                />
              </div>
              <div>
                <label htmlFor="email" className="block mb-2 text-[12px] font-medium uppercase tracking-[0.1em] text-stone">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  className="h-12 bg-surface-2 border-border-subtle focus-visible:ring-gold/30 text-linen placeholder:text-[#555]"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block mb-2 text-[12px] font-medium uppercase tracking-[0.1em] text-stone">
                Subject
              </label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What is your message about?"
                className="h-12 bg-surface-2 border-border-subtle focus-visible:ring-gold/30 text-linen placeholder:text-[#555]"
              />
            </div>
            <div>
              <label htmlFor="message" className="block mb-2 text-[12px] font-medium uppercase tracking-[0.1em] text-stone">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                placeholder="How can we help you?"
                className="min-h-[150px] bg-surface-2 border-border-subtle focus-visible:ring-gold/30 text-linen placeholder:text-[#555] resize-y"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-linen text-obsidian hover:bg-gold transition-colors text-[13px] font-medium mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </main>
      </div>
    </MainLayout>
  );
};

export default ContactUs;
