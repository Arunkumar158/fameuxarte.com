import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { PDFDocument, rgb, StandardFonts } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Generate a unique cert number like FA-2026-ABCD1234
function generateCertificateNumber() {
  const prefix = "FA";
  const year = new Date().getFullYear();
  const randomChars = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${year}-${randomChars}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let requestData: any = {};
  
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    try {
      requestData = await req.json();
    } catch (e) {
      throw new Error("Invalid JSON body");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // We use the service role key to insert records and upload files bypassing RLS
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Extract user token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabaseAdmin.auth.getUser(token);
    if (userErr || !user) throw new Error("Unauthorized");

    const { artwork_id, collector_id, order_item_id } = requestData;
    if (!artwork_id || !collector_id || !order_item_id) {
      throw new Error("Missing artwork_id, collector_id, or order_item_id");
    }

    // Fetch Artwork and Artist details
    const { data: artwork, error: artworkError } = await supabaseAdmin
      .from('artworks')
      .select('id, title, artist_id, creation_year, dimensions, medium')
      .eq('id', artwork_id)
      .single();

    if (artworkError || !artwork) throw new Error("Artwork not found");

    const { data: artist, error: artistError } = await supabaseAdmin
      .from('profiles')
      .select('full_name, verification_status')
      .eq('id', artwork.artist_id)
      .single();

    if (artistError || !artist) throw new Error("Artist not found");
    
    // Optional: Only generate for verified artists or let it generate for all?
    // According to specs, we generate it for all artworks but verified artists have higher trust.
    
    const certNumber = generateCertificateNumber();
    
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]); // Portrait

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Draw borders and background
    page.drawRectangle({
      x: 20, y: 20, width: 560, height: 760,
      borderColor: rgb(0.8, 0.7, 0.2), // Gold-ish border
      borderWidth: 4,
    });

    page.drawText('FAMEUXARTE', {
      x: 210, y: 700, size: 28, font: fontBold, color: rgb(0, 0, 0)
    });

    page.drawText('CERTIFICATE OF AUTHENTICITY', {
      x: 135, y: 650, size: 20, font: fontBold, color: rgb(0.2, 0.2, 0.2)
    });

    page.drawText(`This certificate verifies that the following artwork is a genuine`, {
      x: 100, y: 600, size: 12, font, color: rgb(0.3, 0.3, 0.3)
    });
    page.drawText(`and authentic original piece of art.`, {
      x: 200, y: 580, size: 12, font, color: rgb(0.3, 0.3, 0.3)
    });

    // Details
    const startY = 520;
    const lineSpacing = 35;
    
    page.drawText(`Artwork Title:`, { x: 100, y: startY, size: 12, font: fontBold });
    page.drawText(artwork.title || 'Untitled', { x: 220, y: startY, size: 12, font });

    page.drawText(`Artist Name:`, { x: 100, y: startY - lineSpacing, size: 12, font: fontBold });
    page.drawText(artist.full_name || 'Unknown', { x: 220, y: startY - lineSpacing, size: 12, font });

    page.drawText(`Creation Year:`, { x: 100, y: startY - lineSpacing * 2, size: 12, font: fontBold });
    page.drawText(artwork.creation_year?.toString() || 'N/A', { x: 220, y: startY - lineSpacing * 2, size: 12, font });

    page.drawText(`Medium:`, { x: 100, y: startY - lineSpacing * 3, size: 12, font: fontBold });
    page.drawText(artwork.medium || 'N/A', { x: 220, y: startY - lineSpacing * 3, size: 12, font });

    page.drawText(`Certificate No:`, { x: 100, y: startY - lineSpacing * 4, size: 12, font: fontBold });
    page.drawText(certNumber, { x: 220, y: startY - lineSpacing * 4, size: 12, font });

    // Footer
    page.drawText(`Issue Date: ${new Date().toLocaleDateString()}`, {
      x: 100, y: 200, size: 12, font
    });

    page.drawText(`Verify at: fameuxarte.com/verify/${certNumber}`, {
      x: 100, y: 150, size: 10, font: fontBold, color: rgb(0, 0, 0.8)
    });

    const pdfBytes = await pdfDoc.save();
    
    const filePath = `${certNumber}.pdf`;
    
    // Upload PDF to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('certificates')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Save record to DB
    const { data: certData, error: dbError } = await supabaseAdmin
      .from('certificates')
      .insert({
        artwork_id: artwork_id,
        artist_id: artwork.artist_id,
        collector_id: collector_id,
        order_item_id: order_item_id,
        certificate_number: certNumber,
        pdf_url: filePath,
        certificate_status: 'active'
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, certificate: certData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error: any) {
    console.error("Certificate Generation Error:", error.message);
    
    // Attempt to log failure to certificates table for retry mechanisms
    try {
      const { artwork_id, collector_id, order_item_id, artist_id } = requestData || {};
      if (artwork_id && collector_id && order_item_id) {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: { persistSession: false },
        });

        // Use 'pending' status for failed ones so they can be identified and retried,
        // and attach the error_message.
        await supabaseAdmin.from('certificates').insert({
          artwork_id,
          collector_id,
          order_item_id,
          artist_id: artist_id || '00000000-0000-0000-0000-000000000000', // Need artist_id per schema
          certificate_number: 'FAIL-' + Date.now().toString().substring(5),
          certificate_status: 'pending',
          error_message: error.message
        });
      }
    } catch (e) {
      console.error("Failed to log certificate error to database:", e);
    }

    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400
    });
  }
});
