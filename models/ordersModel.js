const mongoose = require("mongoose");

const OrderData = new mongoose.Schema({
  orderId: {
    type: Number,
  },
  name: {
    type: String,
  },
  mobileNo: {
    type: Number,
  },
  address: {
    type: String,
  },
  orderedItems: {
    type: [],
  },
  totalOrderAmount: {
    type: Number,
  },
});

module.exports = mongoose.model("ORDERDATA", OrderData);
