const { createInvoice } = require("./createInvoice.js");
const nodemailer=require('nodemailer');
const mongoose = require('mongoose');
const express=require("express");
const app=express();

mongoose.connect("mongodb://localhost:27017/invoice", {useNewUrlParser: true,useUnifiedTopology:true},()=>{
    console.log("database connected");
});

var invoice =mongoose.Schema ({

    name: {
      type:String
    },
    address:{
      type:String
    },
    city: {
      type:String
    },
    state:{
      type:String
    } ,
    country:{
      type:String
    } ,
    postal_code: {
      type:Number
    },
  items: [
    {
      item: {
        type:String
      },
      description: {
        type:String
      },
      quantity:  {
        type:Number
      },
      amount: {
        type:Number
      }
    },{strict:false}
    
  ],
  subtotal:{
    type:Number
  } ,
  paid: {
    type:Number
  },
  invoice_nr:{
    type:Number
  }
});
const Invoice=mongoose.model("Invoice",invoice);




app.post('/create',(req,res)=>{
  var go={
    name:req.body.name,
    city:req.body.city,
    address:req.body.address,
    state:req.body.state,
    country:req.body.country,
    postal_code:req.body.postal_code,
    items:req.body.items,
    subtotal:req.body.subtotal,
    paid:req.body.paid,
    invoice_nr:req.body.invoice_nr
}
var newGo=new Invoice(go)
    newGo.save().then(()=>{
        console.log("Template created");
        res.send("Done");
    }).catch((err)=>{
        if(err){
            throw err
        }
    });

function createInvoice(invoice, path) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateHeader(doc) {
  doc
    .image("logo.png", 50, 45, { width: 50 })
    .fillColor("#444444")
    .fontSize(20)
    .text("ACME Inc.", 110, 57)
    .fontSize(10)
    .text("ACME Inc.", 200, 50, { align: "right" })
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("New York, NY, 10025", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font("Helvetica")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(
      formatCurrency(invoice.subtotal - invoice.paid),
      150,
      customerInformationTop + 30
    )

    .font("Helvetica-Bold")
    .text(invoice.name, 300, customerInformationTop)
    .font("Helvetica")
    .text(invoice.address, 300, customerInformationTop + 15)
    .text(
      invoice.city +
        ", " +
        invoice.state +
        ", " +
        invoice.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Unit Cost",
    "Quantity",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("Helvetica");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      item.description,
      formatCurrency(item.amount / item.quantity),
      item.quantity,
      formatCurrency(item.amount)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(invoice.subtotal)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Paid To Date",
    "",
    formatCurrency(invoice.paid)
  );

  const duePosition = paidToDatePosition + 25;
  doc.font("Helvetica-Bold");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Balance Due",
    "",
    formatCurrency(invoice.subtotal - invoice.paid)
  );
  doc.font("Helvetica");
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}
createInvoice(invoice, "invoice.pdf");

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'yourid@gmail.com',
    pass: 'yourpassword'
  }
});

var mailOptions = {
  from: 'noreply@gmail.com',
  to: 'something@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'Dynamically sent!',
  attachments:[{
      filename:'invoice',
      path:`C:/Users/Shivam Mehra/Desktop/node basics of libraries/pdfkit-invoice/invoice.pdf`,
      contentType:'application/pdf'
  }]
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
 
});


app.listen(5454,function(){
  console.log("server started");
});
