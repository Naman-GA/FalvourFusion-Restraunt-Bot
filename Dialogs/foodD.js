const { ComponentDialog, WaterfallDialog } = require("botbuilder-dialogs");
const { orderFoodDialog } = require("../Constants/DialogId"); // Replace with your dialog ID
const { CardFactory } = require("botbuilder");
const { orderCard } = require("../Cards/mainCard");
const orderFoodDialogWF1 = "orderFoodDialogWF1";

class OrderFoodDialog extends ComponentDialog {
  constructor(conversationState) {
    super(orderFoodDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;

    this.addDialog(
      new WaterfallDialog(orderFoodDialogWF1, [
        this.sendOrderFoodOptions.bind(this),
      ])
    );

    this.initialDialogId = orderFoodDialogWF1;
  }

  async sendOrderFoodOptions(stepContext) {
    await stepContext.context.sendActivity(
      "Welcome to our restaurant! How can I assist you with your food order?"
    );
    return await stepContext.context.sendActivity({
      attachments: [CardFactory.adaptiveCard(orderCard())],
    });
  }
}

module.exports.OrderFoodDialog = OrderFoodDialog;
