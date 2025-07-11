"use client";

import { useRef, useState} from "react";
import jsPDF from "jspdf";
import domtoimage from "dom-to-image";
import {  toast } from "sonner";
import Image from 'next/image';




import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function BillingPage() {
  // Customer & bill details state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [billNo, setBillNo] = useState("");
  const [date, setDate] = useState("");
  const [frameType, setFrameType] = useState("");
  const [lensType, setLensType] = useState("");
  const [amount, setAmount] = useState("");
  const [deposit, setDeposit] = useState("");

  // Prescription state
  const [rx, setRx] = useState({
    right: { sph: "", cyl: "", axis: "", vn: "", addition: "" },
    left: { sph: "", cyl: "", axis: "", vn: "", addition: "" },
  });

  const remaining = (Number(amount) || 0) - (Number(deposit) || 0);

  // Generate or increment bill number stored in localStorage
  // const generateBillNumber = () => {
  //   let lastBill = localStorage.getItem("lastBillNumber");
  //   let nextNumber = 1;
  //   if (lastBill) {
  //     nextNumber = parseInt(lastBill, 10) + 1;
  //   }
  //   localStorage.setItem("lastBillNumber", nextNumber.toString());
  //   return `BILL-${nextNumber.toString().padStart(5, "0")}`;
  // };

  // useEffect(() => {
  //   if (!billNo) setBillNo(generateBillNumber());
  //   if (!date) {
  //     const today = new Date().toISOString().split("T")[0];
  //     setDate(today);
  //   }
  // }, []);

  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = async () => {
    if (!printRef.current) return;

    try {
      const dataUrl = await domtoimage.toPng(printRef.current);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const img = document.createElement("img") as HTMLImageElement;
      img.src = dataUrl;
      img.onload = () => {
        const imgProps = pdf.getImageProperties(img);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${billNo || "Qwality_Optical_Bill"}.pdf`);
        toast.success("PDF generated successfully!");
      };
    } catch (err) {
      console.error("Error generating image:", err);
    }
  };
  const handleSmsSend = () => {
    if (!phone) return toast.error("Phone number is required");

    const message = `
QWALITY OPTICAL
Name: ${customerName}
Bill No: ${billNo}
Amount: ₹${amount}
Download your bill from shop.
  `.trim();

    const smsLink = `sms:91${phone}?body=${encodeURIComponent(message)}`;
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    if (!isMobile) {
      toast.error("SMS can only be sent from a mobile device.");
      return;
    }
    window.location.href = smsLink;
  };

  const handleWhatsAppSend = () => {
    if (!phone) return toast.error("Phone number is required");

    const message = `
QWALITY OPTICAL
Name: ${customerName}
Bill No: ${billNo}
Date: ${date}
Frame: ${frameType}
Lenses: ${lensType}
Amount: ₹${amount}
Deposit: ₹${deposit}
Remaining: ₹${remaining}

Thank you for choosing us!
  `.trim();

    const whatsappLink = `https://wa.me/91${phone}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappLink, "_blank");
  };

  const handleSendEmail = async () => {
    const response = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        name: customerName,
        phone,
        bill_no: billNo,
        date,
        frame: frameType,
        lenses: lensType,
        amount,
        deposit,
        remaining,
        rx_right: rx.right,
        rx_left: rx.left,
      }),
    });

    const result = await response.json();
    if (result.success) {
      toast.success("Email sent successfully!");
    } else {
      toast.error("Failed to send email");
    }
  };

  const [showPreview, setShowPreview] = useState(false);

  const handleGenerateBill = () => {
  if (!customerName || !phone || !amount) {
  return toast.error("Name, phone, and amount are required.");
}
      if (!date) {
        const today = new Date().toISOString().split("T")[0];
        setDate(today);
      }
    setShowPreview(true);
    toast.success(
      "Bill generated successfully! now you can print or send it via email."
    );
  };

  return (
    
    <div className="flex justify-center items-start min-h-screen bg-gray-50 p-4">
      <div className="space-y-8 w-full max-w-5xl">
        {/* Billing Form */}
        <Card className="shadow-lg">
          <CardContent className="space-y-6 p-6">
            <div className="text-center">
              <img
                src="/logo.jpg"
                alt="Qwality Optical Logo"
                className="mx-auto mb-2 h-16 w-auto"
              />
              <h1 className="text-2xl font-bold">QWALITY OPTICAL</h1>
              <p className="text-sm text-gray-600">Mobile No: +91 8980963599</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Customer Name</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter customer phone number"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter customer email"
                />
              </div>
              <div>
                <Label>Bill Number</Label>
                <Input
                  value={billNo}
                  onChange={(e) => setBillNo(e.target.value)}
                  disabled
                  placeholder="Manual add"
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <h2 className="font-semibold">Prescription Details</h2>
              <div className="grid grid-cols-6 gap-2 mt-2 text-center">
                <div></div>
                <Label>SPH</Label>
                <Label>CYL</Label>
                <Label>ADD</Label>
                <Label>AXIS</Label>
                <Label>VN</Label>

                <Label>Right Eye</Label>
                <Input
                  value={rx.right.sph}
                  onChange={(e) =>
                    setRx({
                      ...rx,
                      right: { ...rx.right, sph: e.target.value },
                    })
                  }
                />
                <Input
                  value={rx.right.cyl}
                  onChange={(e) =>
                    setRx({
                      ...rx,
                      right: { ...rx.right, cyl: e.target.value },
                    })
                  }
                />
                <Input
                  value={rx.right.addition}
                  onChange={(e) =>
                    setRx({
                      ...rx,
                      right: { ...rx.right, addition: e.target.value },
                    })
                  }
                />
                <Input
                  value={rx.right.axis}
                  onChange={(e) =>
                    setRx({
                      ...rx,
                      right: { ...rx.right, axis: e.target.value },
                    })
                  }
                />

                <Input
                  value={rx.right.vn}
                  onChange={(e) =>
                    setRx({ ...rx, right: { ...rx.right, vn: e.target.value } })
                  }
                />

                <Label>Left Eye</Label>
                <Input
                  value={rx.left.sph}
                  onChange={(e) =>
                    setRx({ ...rx, left: { ...rx.left, sph: e.target.value } })
                  }
                />
                <Input
                  value={rx.left.cyl}
                  onChange={(e) =>
                    setRx({ ...rx, left: { ...rx.left, cyl: e.target.value } })
                  }
                />
                <Input
                  value={rx.left.addition}
                  onChange={(e) =>
                    setRx({
                      ...rx,
                      left: { ...rx.left, addition: e.target.value },
                    })
                  }
                />
                <Input
                  value={rx.left.axis}
                  onChange={(e) =>
                    setRx({ ...rx, left: { ...rx.left, axis: e.target.value } })
                  }
                />
                <Input
                  value={rx.left.vn}
                  onChange={(e) =>
                    setRx({ ...rx, left: { ...rx.left, vn: e.target.value } })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Frame Type</Label>
                <Input
                  value={frameType}
                  onChange={(e) => setFrameType(e.target.value)}
                />
              </div>
              <div>
                <Label>Lenses Type</Label>
                <Input
                  value={lensType}
                  onChange={(e) => setLensType(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Full Amount</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Deposit</Label>
                <Input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                />
              </div>
              <div>
                <Label>Remaining</Label>
                <Input value={remaining.toString()} disabled />
              </div>
            </div>

            <Button className="w-full" onClick={handleGenerateBill}>
              Generate Bill
            </Button>
          </CardContent>
        </Card>

        {/* Live Print Preview */}
        {showPreview && (
          <div
            ref={printRef}
            className="bg-white p-6 shadow-lg"
            style={{ backgroundColor: "#ffffff" }}
          >
            <Card className="shadow-lg p-6 bg-white">
              <img
                src="/logo.jpg"
                alt="Qwality Optical Logo"
                className="mx-auto mb-2 h-16 w-auto"
              />
              <h2 className="text-xl font-semibold mb-2">Live Bill Preview</h2>

              <p>
                <strong>Customer:</strong> {customerName}
              </p>
              <p>
                <strong>Phone:</strong> {phone}
              </p>
              <p>
                <strong>Email:</strong> {email}
              </p>
              <p>
                <strong>Bill No:</strong> {billNo}
              </p>
              <p>
                <strong>Date:</strong> {date}
              </p>
              <p>
                <strong>Frame:</strong> {frameType}
              </p>
              <p>
                <strong>Lenses:</strong> {lensType}
              </p>
              <p>
                <strong>Amount:</strong> ₹{amount}
              </p>
              <p>
                <strong>Deposit:</strong> ₹{deposit}
              </p>
              <p>
                <strong>Remaining:</strong> ₹{remaining}
              </p>

              <h3 className="mt-4 font-semibold">Prescription</h3>
              <table className="w-full border mt-2 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-1">Eye</th>
                    <th className="border p-1">SPH</th>
                    <th className="border p-1">CYL</th>
                    <th className="border p-1">ADD</th>
                    <th className="border p-1">AXIS</th>
                    <th className="border p-1">VN</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-1">Right</td>
                    <td className="border p-1">{rx.right.sph}</td>
                    <td className="border p-1">{rx.right.cyl}</td>
                    <td className="border p-1">{rx.right.addition}</td>
                    <td className="border p-1">{rx.right.axis}</td>
                    <td className="border p-1">{rx.right.vn}</td>
                  </tr>
                  <tr>
                    <td className="border p-1">Left</td>
                    <td className="border p-1">{rx.left.sph}</td>
                    <td className="border p-1">{rx.left.cyl}</td>
                    <td className="border p-1">{rx.left.addition}</td>
                    <td className="border p-1">{rx.left.axis}</td>
                    <td className="border p-1">{rx.left.vn}</td>
                  </tr>
                </tbody>
              </table>

              <p className="mt-6 text-center italic text-gray-700">
                Thank you for shopping with Qwality Optical!
              </p>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        {showPreview && (
          <div className="flex gap-4">
            <Button onClick={handlePrint} variant="outline">
              Download PDF / Print
            </Button>

            <Button onClick={handleSendEmail} variant="outline">
              Send Email
            </Button>
            <Button variant="outline" onClick={handleWhatsAppSend}>
              Send on WhatsApp
            </Button>

            <Button variant="outline" onClick={handleSmsSend}>
              Send via SMS
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
