/**
 * Admin Notifications.tsx
 * Admin broadcast notification center.
 *
 * Allows admins to send controlled broadcast notifications to:
 * - All Users
 * - All Artists
 * - All Customers
 *
 * Broadcasts are executed via the `broadcast-notification` Edge Function
 * (server-side, admin-verified) — clients cannot bypass security.
 */

import React, { useState } from 'react';
import { Send, Users, Megaphone, CheckCircle2, AlertCircle, Loader2, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { trackEvent } from '@/lib/analytics';

type Audience = 'all' | 'artists' | 'customers';
type SendState = 'idle' | 'sending' | 'success' | 'error';

interface BroadcastForm {
  audience: Audience;
  title: string;
  message: string;
  ctaUrl: string;
}

const AUDIENCE_LABELS: Record<Audience, string> = {
  all: 'All Users',
  artists: 'All Artists',
  customers: 'All Customers (non-artists)',
};

const AdminNotifications: React.FC = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<BroadcastForm>({
    audience: 'all',
    title: '',
    message: '',
    ctaUrl: '',
  });
  const [sendState, setSendState] = useState<SendState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isValid = form.title.trim().length > 0 && form.message.trim().length > 0;

  const handleSend = async () => {
    if (!isValid || !user) return;
    setSendState('sending');
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data, error } = await supabase.functions.invoke('broadcast-notification', {
        body: {
          audience: form.audience,
          title: form.title.trim(),
          message: form.message.trim(),
          type: 'BROADCAST',
          metadata: form.ctaUrl.trim() ? { url: form.ctaUrl.trim() } : {},
        },
      });

      if (error) throw new Error(error.message);

      setSendState('success');
      setSuccessMsg(
        `Broadcast sent successfully to ${data?.count ?? 'target'} users.`
      );
      trackEvent('notification_broadcast_created', {
        audience: form.audience,
        admin_id: user.id,
      });
      setForm({ audience: 'all', title: '', message: '', ctaUrl: '' });
    } catch (err: any) {
      setSendState('error');
      setErrorMsg(err?.message ?? 'Failed to send broadcast. Please try again.');
    }
  };

  const preview = form.title || form.message
    ? { title: form.title || '(title)', message: form.message || '(message)' }
    : null;

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-serif">
          Notification Broadcasts
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Send transactional or informational notifications to users. These are delivered in-app.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Megaphone className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">New Broadcast</span>
        </div>

        {/* Audience */}
        <div className="space-y-1.5">
          <Label className="text-sm text-slate-600">Audience</Label>
          <Select
            value={form.audience}
            onValueChange={(v) => setForm((f) => ({ ...f, audience: v as Audience }))}
          >
            <SelectTrigger className="bg-white border-slate-200 text-slate-900 focus:ring-gold">
              <Users className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 text-slate-900">
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="artists">All Artists</SelectItem>
              <SelectItem value="customers">All Customers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label className="text-sm text-slate-600">
            Title <span className="text-red-400">*</span>
          </Label>
          <Input
            placeholder="e.g. Important Update from Fameuxarte"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            maxLength={100}
            className="bg-white border-slate-200 text-slate-900 focus-visible:ring-gold"
          />
          <p className="text-xs text-slate-400">{form.title.length}/100</p>
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <Label className="text-sm text-slate-600">
            Message <span className="text-red-400">*</span>
          </Label>
          <Textarea
            placeholder="Write a concise notification message..."
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            maxLength={300}
            rows={3}
            className="bg-white border-slate-200 text-slate-900 focus-visible:ring-gold resize-none"
          />
          <p className="text-xs text-slate-400">{form.message.length}/300</p>
        </div>

        {/* Optional CTA URL */}
        <div className="space-y-1.5">
          <Label className="text-sm text-slate-600">Destination URL (optional)</Label>
          <Input
            placeholder="e.g. /artworks or https://fameuxarte.com/..."
            value={form.ctaUrl}
            onChange={(e) => setForm((f) => ({ ...f, ctaUrl: e.target.value }))}
            className="bg-white border-slate-200 text-slate-900 focus-visible:ring-gold"
          />
          <p className="text-xs text-slate-400">
            When users tap this notification, they'll be taken to this URL.
          </p>
        </div>

        {/* Preview */}
        {preview && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Preview
            </p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                <Bell className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{preview.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{preview.message}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  To: {AUDIENCE_LABELS[form.audience]} · Just now
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status messages */}
        {sendState === 'success' && (
          <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 rounded-lg px-4 py-3 border border-green-200">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {successMsg}
          </div>
        )}
        {sendState === 'error' && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Send button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSend}
            disabled={!isValid || sendState === 'sending'}
            className="bg-gold text-obsidian hover:bg-gold/90 min-w-[140px]"
          >
            {sendState === 'sending' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Broadcast
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Info callout */}
      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Broadcast guidelines</p>
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          <li>Broadcasts are sent via a secure server-side Edge Function.</li>
          <li>Only use broadcasts for important, transactional updates.</li>
          <li>Avoid sending more than 1–2 broadcasts per week to prevent notification fatigue.</li>
          <li>This feature is logged. Abuse may be reviewed.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminNotifications;
