const { Client } = require("mindee");
require('dotenv').config();
var receiptkey = process.env.MINDEE_RECEIPT_TOKEN;
var invoicekey = process.env.MINDEE_INVOICE_TOKEN;

// Receipt/invoice tokens can be set by Env (MINDEE_RECEIPT_TOKEN & MINDEE_INVOICE_TOKEN) as above or via params (Client({receiptToken: "token"}))
// for fin document "endpoint" both tokens must be used.
const mindeeClient = new Client(
  {
    //both endpoints must be set for this "API" to function correctly
    invoiceToken:invoicekey,
	  receiptToken: receiptkey
  }
);

// parsing receipt from picture
mindeeClient.financialDocument
  .parse({ input: "./documents/receipts/receipt.jpg" })
  .then((res) => {
    console.log("Success !");
    console.log(res.financialDocuments);
    console.log(res.financialDocument);
  })
  .catch((err) => {
    console.error(err);
  });

// parsing receipt from base64 picture
const fs = require("fs");
const base64 = fs.readFileSync("./documents/receipts/receipt.jpg", {
  encoding: "base64",
});
mindeeClient.financialDocument
  .parse({ input: base64, inputType: "base64" })
  .then((res) => {
    console.log("Success !");
    console.log(res.financialDocuments);
    console.log(res.financialDocument);
  })
  .catch((err) => {
    console.error(err);
  });
