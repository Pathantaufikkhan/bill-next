import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
  const data = await req.json();

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Qwality Optical Invoice</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 40px;
        color: #000;
        font-size: 14px;
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
        margin-bottom: 20px;
      }
      .logo {
        height: 80px;
        margin-bottom: 10px;
      }
      .shop-details {
        font-weight: bold;
        font-size: 18px;
        margin-top: 5px;
      }
      .contact {
        font-size: 14px;
      }
      .section {
        margin-bottom: 25px;
      }
      .section-title {
        font-weight: bold;
        margin-bottom: 8px;
        text-decoration: underline;
      }
      .details p {
        margin: 4px 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      th, td {
        border: 1px solid #000;
        padding: 6px 10px;
        text-align: center;
      }
      th {
        background-color: #f0f0f0;
      }
      .footer {
        margin-top: 40px;
        text-align: center;
        font-size: 13px;
        color: #555;
        border-top: 1px dashed #ccc;
        padding-top: 10px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <img src="https://i.postimg.cc/B6jLyqcc/logo.jpg" alt="Qwality Optical Logo" class="logo" />
      <div class="shop-details">QWALITY OPTICAL</div>
      <div class="contact">Udhana Road No. 7, Mahavir Palace, Surat<br />
      Phone: +91 8980963599 | Email: qwalityoptical@gmail.com</div>
    </div>

    <div class="section details">
      <div class="section-title">Customer Information</div>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Email:</strong> ${data.to}</p>
      <p><strong>Bill No:</strong> ${data.bill_no}</p>
      <p><strong>Date:</strong> ${data.date}</p>
    </div>

    <div class="section details">
      <div class="section-title">Billing Summary</div>
      <p><strong>Frame:</strong> ${data.frame}</p>
      <p><strong>Lenses:</strong> ${data.lenses}</p>
      <p><strong>Total Amount:</strong> ₹${data.amount}</p>
      <p><strong>Advance Paid:</strong> ₹${data.deposit}</p>
      <p><strong>Balance:</strong> ₹${data.remaining}</p>
    </div>

    <div class="section">
      <div class="section-title">Prescription Details</div>
      <table>
        <thead>
          <tr>
            <th>Eye</th>
            <th>SPH</th>
            <th>CYL</th>
            <th>AXIS</th>
            <th>VN</th>
            <th>ADD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Right</td>
            <td>${data.rx_right.sph}</td>
            <td>${data.rx_right.cyl}</td>
            <td>${data.rx_right.axis}</td>
            <td>${data.rx_right.vn}</td>
            <td>${data.rx_right.addition || ""}</td>
          </tr>
          <tr>
            <td>Left</td>
            <td>${data.rx_left.sph}</td>
            <td>${data.rx_left.cyl}</td>
            <td>${data.rx_left.axis}</td>
            <td>${data.rx_left.vn}</td>
            <td>${data.rx_left.addition || ""}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      Thank you for choosing Qwality Optical. Visit again!
    </div>
  </body>
  </html>
  `;

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: data.to,
      subject: "Qwality Optical - Your Invoice",
      text: "Attached is your bill from Qwality Optical.",
      attachments: [
        {
          filename: `${data.bill_no || "Qwality_Invoice"}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error });
  } finally {
    if (browser) await browser.close();
  }
}
