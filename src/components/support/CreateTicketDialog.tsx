import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(100),
  category: z.enum([
    "ORDER",
    "PAYMENT",
    "SHIPPING",
    "REFUND",
    "ARTWORK",
    "ARTIST",
    "CERTIFICATE",
    "ACCOUNT",
    "OTHER",
  ]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  message: z.string().min(10, "Please provide more details").max(1000),
});

export type TicketFormValues = z.infer<typeof ticketSchema>;

interface CreateTicketDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  artworkId?: string;
  certificateId?: string;
  defaultCategory?: TicketFormValues["category"];
  defaultSubject?: string;
}

export function CreateTicketDialog({
  open,
  onOpenChange,
  orderId,
  artworkId,
  certificateId,
  defaultCategory = "OTHER",
  defaultSubject = "",
}: CreateTicketDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: defaultSubject,
      category: defaultCategory,
      priority: "NORMAL",
      message: "",
    },
  });

  const onSubmit = async (values: TicketFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError || !user.user) throw new Error("Not authenticated");

      // 1. Create the ticket
      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert([
          {
            user_id: user.user.id,
            subject: values.subject,
            category: values.category,
            priority: values.priority,
            order_id: orderId || null,
            artwork_id: artworkId || null,
            certificate_id: certificateId || null,
          },
        ])
        .select()
        .single();

      if (ticketError) throw ticketError;

      // 2. Create the initial message
      const { error: messageError } = await supabase
        .from("support_ticket_messages")
        .insert([
          {
            ticket_id: ticket.id,
            sender_id: user.user.id,
            message: values.message,
            is_internal: false,
          },
        ]);

      if (messageError) throw messageError;

      toast({
        title: "Ticket created",
        description: `Your support ticket (${ticket.ticket_number}) has been created successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      toast({
        title: "Failed to create ticket",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-obsidian text-linen border-border-subtle">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">Create Support Ticket</DialogTitle>
          <DialogDescription className="text-stone">
            Please provide details about your issue so we can help you quickly.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stone">Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief summary of your issue" className="bg-surface text-linen border-border-subtle focus-visible:ring-gold" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone">Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-surface text-linen border-border-subtle focus:ring-gold">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-surface text-linen border-border-subtle">
                        <SelectItem value="ORDER">Order & Fulfillment</SelectItem>
                        <SelectItem value="PAYMENT">Payments & Billing</SelectItem>
                        <SelectItem value="SHIPPING">Shipping</SelectItem>
                        <SelectItem value="REFUND">Returns & Refunds</SelectItem>
                        <SelectItem value="ARTWORK">Artwork Issue</SelectItem>
                        <SelectItem value="ARTIST">Artist Relations</SelectItem>
                        <SelectItem value="CERTIFICATE">Certificates</SelectItem>
                        <SelectItem value="ACCOUNT">Account Details</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone">Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-surface text-linen border-border-subtle focus:ring-gold">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-surface text-linen border-border-subtle">
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="URGENT">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {(orderId || artworkId || certificateId) && (
              <div className="text-xs text-gold/80 bg-gold/10 p-2 rounded-md">
                This ticket will automatically be linked to the related {orderId ? "order" : artworkId ? "artwork" : "certificate"}.
              </div>
            )}

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stone">Message</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your issue in detail..."
                      className="min-h-[120px] bg-surface text-linen border-border-subtle focus-visible:ring-gold"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                className="mr-3 border-border-subtle text-linen hover:bg-surface-2"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-gold text-obsidian hover:bg-gold-light"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
