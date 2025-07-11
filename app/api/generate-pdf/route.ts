import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xkvxizwwmxsxcqrdrnib.supabase.co";  // Replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrdnhpend3bXhzeGNxcmRybmliIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjE1NjkwMiwiZXhwIjoyMDY3NzMyOTAyfQ.1uwfRevX3_qAsT4eWaRqA6jSd1hQbURhZq5ioDd1LpA";  // Replace with your anon public key
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            phone,
            bill_no,
            date,
            frame,
            lenses,
            amount,
            deposit,
            remaining,
            rx_right,
            rx_left,
        } = body;

        // Create PDF document
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text("Qwality Optical Bill", 10, 20);

        doc.setFontSize(12);
        doc.text(`Customer Name: ${name}`, 10, 40);
        doc.text(`Phone: ${phone}`, 10, 50);
        doc.text(`Bill No: ${bill_no}`, 10, 60);
        doc.text(`Date: ${date}`, 10, 70);
        doc.text(`Frame: ${frame}`, 10, 80);
        doc.text(`Lenses: ${lenses}`, 10, 90);
        doc.text(`Amount: ₹${amount}`, 10, 100);
        doc.text(`Deposit: ₹${deposit}`, 10, 110);
        doc.text(`Remaining: ₹${remaining}`, 10, 120);

        doc.text("Prescription - Right Eye:", 10, 140);
        doc.text(
            `SPH: ${rx_right.sph}, CYL: ${rx_right.cyl}, ADD: ${rx_right.addition}, AXIS: ${rx_right.axis}, VN: ${rx_right.vn}`,
            10,
            150
        );

        doc.text("Prescription - Left Eye:", 10, 170);
        doc.text(
            `SPH: ${rx_left.sph}, CYL: ${rx_left.cyl}, ADD: ${rx_left.addition}, AXIS: ${rx_left.axis}, VN: ${rx_left.vn}`,
            10,
            180
        );

        // Export PDF as Uint8Array (binary)
        const pdfBytes = doc.output("arraybuffer");
        const pdfBuffer = new Uint8Array(pdfBytes);

        // Prepare file name
        const fileName = `bills/${bill_no}_${Date.now()}.pdf`;

        // Upload PDF to Supabase Storage bucket
        const { data, error } = await supabase.storage
            .from("bills")
            .upload(fileName, pdfBuffer, {
                contentType: "application/pdf",
                upsert: true,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
        }

        // Get public URL for the uploaded PDF (if bucket is public)
        const { data: urlData } = supabase.storage
            .from("bills")
            .getPublicUrl(fileName);

        if (!urlData || !urlData.publicUrl) {
            console.error("Supabase public URL error: No public URL returned");
            return NextResponse.json({ success: false, message: "Failed to get file URL" }, { status: 500 });
        }

        return NextResponse.json({ success: true, pdfUrl: urlData.publicUrl });
    } catch (error) {
        console.error("Error in API:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
