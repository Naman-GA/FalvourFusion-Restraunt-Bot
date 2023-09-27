const { ComponentDialog, WaterfallDialog } = require("botbuilder-dialogs");
const { reserveTableDialog } = require("../Constants/DialogId"); // Replace with your dialog ID
const { CardFactory } = require("botbuilder");
const { reservationCard } = require("../Cards/mainCard");
const reservationDialogWF1 = "reservationDialogWF1";

class ReservationDialog extends ComponentDialog {
  constructor(conversationState) {
    super(reserveTableDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;

    this.addDialog(
      new WaterfallDialog(reservationDialogWF1, [
        this.sendReservationOptions.bind(this),
      ])
    );

    this.initialDialogId = reservationDialogWF1;
  }

  async sendReservationOptions(stepContext) {
    await stepContext.context.sendActivity(
      "Welcome to our restaurant! How can I assist you with your Table Booking?"
    );
    return await stepContext.context.sendActivity({
      attachments: [CardFactory.adaptiveCard(reservationCard())],
    });
  }
}

module.exports.ReservationDialog = ReservationDialog;
