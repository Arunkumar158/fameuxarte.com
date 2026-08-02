import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 
  | 'new_order' 
  | 'order_accepted'
  | 'order_shipped' 
  | 'order_delivered' 
  | 'order_cancelled' 
  | 'payment_failed'
  | 'high_value_sale';

export interface SendNotificationParams {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, any>;
  emailHtml?: string;
  emailTo?: string;
  emailSubject?: string;
}

export const sendNotification = async (params: SendNotificationParams) => {
  try {
    // 1. Insert in-app notification
    const { error: dbError } = await supabase.from('notifications').insert({
      user_id: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      metadata: params.metadata || {}
    });

    if (dbError) {
      console.error('Error inserting notification:', dbError);
    }

    // 2. Send email if email params are provided
    if (params.emailHtml && params.emailTo && params.emailSubject) {
      const { error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.emailTo,
          subject: params.emailSubject,
          html: params.emailHtml
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
};
