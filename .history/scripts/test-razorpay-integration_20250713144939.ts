#!/usr/bin/env tsx

/**
 * Test script for Razorpay integration
 * Run with: npx tsx scripts/test-razorpay-integration.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRazorpayIntegration() {
  console.log('🧪 Testing Razorpay Integration...\n');

  // Test 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const razorpayKey = process.env.VITE_RAZORPAY_KEY_ID;
  if (razorpayKey) {
    console.log('✅ VITE_RAZORPAY_KEY_ID is set');
    if (razorpayKey.startsWith('rzp_test_')) {
      console.log('✅ Using test mode (rzp_test_)');
    } else if (razorpayKey.startsWith('rzp_live_')) {
      console.log('⚠️  Using live mode (rzp_live_) - be careful!');
    } else {
      console.log('❌ Invalid Razorpay key format');
    }
  } else {
    console.log('❌ VITE_RAZORPAY_KEY_ID is not set');
  }

  // Test 2: Test Supabase connection
  console.log('\n2️⃣ Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('artworks').select('count').limit(1);
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (error) {
    console.log('❌ Supabase connection error:', error);
  }

  // Test 3: Test create-order function
  console.log('\n3️⃣ Testing create-order Edge Function...');
  try {
    const testItems = [
      {
        artwork: {
          id: 'test-artwork-1',
          title: 'Test Artwork',
          price: 100
        },
        quantity: 1
      }
    ];

    const { data, error } = await supabase.functions.invoke('create-order', {
      body: {
        items: testItems,
        totalAmount: 100,
        orderId: 'test-order-123'
      }
    });

    if (error) {
      console.log('❌ create-order function failed:', error.message);
      if (error.message.includes('Payment gateway not configured')) {
        console.log('💡 Make sure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in Supabase Edge Functions');
      }
    } else {
      console.log('✅ create-order function successful');
      console.log('📋 Order data:', data);
    }
  } catch (error) {
    console.log('❌ create-order function error:', error);
  }

  // Test 4: Check database tables
  console.log('\n4️⃣ Checking database tables...');
  try {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    if (ordersError) {
      console.log('❌ Orders table access failed:', ordersError.message);
    } else {
      console.log('✅ Orders table accessible');
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('count')
      .limit(1);
    
    if (itemsError) {
      console.log('❌ Order items table access failed:', itemsError.message);
    } else {
      console.log('✅ Order items table accessible');
    }
  } catch (error) {
    console.log('❌ Database table check error:', error);
  }

  console.log('\n🎯 Integration Test Summary:');
  console.log('📋 Check the results above to identify any issues');
  console.log('🔧 Refer to RAZORPAY_SETUP.md for configuration help');
  console.log('🧪 Test the actual payment flow in the browser');
}

testRazorpayIntegration().catch(console.error); 