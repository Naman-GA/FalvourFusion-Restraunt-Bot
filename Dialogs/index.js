module.exports = {
  RootDialog: require("./rootD").RootDialog,
  OrderFoodDialog: require("./foodD").OrderFoodDialog,
  ReservationDialog: require("./tableD").ReservationDialog,
  TableReservationDialog: require("./reserveTableD").TableReservationDialog,
  CancelTable: require("./cancelTableD").cancelTableBooking,
  ViewTable: require("./trackTableD").viewTableBooking,
  ShowMenuDialog: require("./showMenuD").showOrderMenuDialog,
  ClearCartDialog: require("./clearCartD").clearCartDialog,
  CheckoutOrder: require("./checkoutD").checkOutOrder,
  CancelOrder: require("./cancelOrderD").cancelOrderBooking,
  TrackOrder: require("./trackOrderD").viewOrderBooking,
};
