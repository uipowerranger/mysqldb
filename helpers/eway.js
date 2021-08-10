const rapid = require("eway-rapid");

var key =
    "F9802CQJVbYLvDZXPdzYhPsTdIN00OfdRJZ6qVTv8kbRAArtuGpJWkcTZBlPZxMMfuAlNP",
  password = "wBV6Abrx",
  endpoint = "sandbox";

var client = rapid.createClient(key, password, endpoint);

exports.getAccessCode = (AccessCode) => {
  return client.queryTransaction(AccessCode);
};

exports.payment = (data) => {
  return client.createTransaction(rapid.Enum.Method.RESPONSIVE_SHARED, {
    // Customer: {
    //   FirstName: "John",
    //   LastName: "Smith",
    //   Street1: "Level 5",
    //   Street2: "369 Queen Street",
    //   City: "Sydney",
    //   State: "NSW",
    //   PostalCode: "2000",
    //   Country: "au",
    //   Email: "demo@example.org",
    // },
    // Payment: {
    //   TotalAmount: 1000,
    //   InvoiceNumber: "Inv 4444",
    //   InvoiceDescription: "Individual Invoice Description",
    //   InvoiceReference: "513456",
    //   CurrencyCode: "AUD",
    // },
    ...data,
    // Change these to your server
    RedirectUrl: process.env.PAYMENT_URL + "/#/thanks",
    CancelUrl: process.env.PAYMENT_URL + "/#/transactionfailed",
    TransactionType: "Purchase",
  });
};
