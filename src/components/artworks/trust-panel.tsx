import React from 'react';
import { ShieldCheck, FileText, Truck, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function TrustPanel() {
  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: 'Verified Artist',
      description: 'Identity and portfolio reviewed',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      icon: FileText,
      title: 'Certificate Included',
      description: 'Digital certificate issued after purchase',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Truck,
      title: 'Ships Directly from Artist',
      description: 'Professionally packaged and tracked',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      icon: Lock,
      title: 'Secure Payment',
      description: 'Protected checkout via Razorpay',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    }
  ];

  return (
    <div className="space-y-4 py-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Buyer Protection</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trustFeatures.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <Card key={idx} className="border-none bg-gray-50/50 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md">
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`p-2 rounded-lg ${feature.bgColor} ${feature.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
