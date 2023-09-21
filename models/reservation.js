const { mongoose } = require("../utils/db");

const reversvationSchema = new mongoose.Schema({
  userName: {
    type: String,
  },
  mobileNo: {
    type: Number,
  },
  date: {
    type: Date,
  },
  time: {
    type: String,
  },
  no: {
    type: Number,
  },
  orderId: {
    type: Number,
  },
});

module.exports = mongoose.model("RESERVATION", reversvationSchema);
