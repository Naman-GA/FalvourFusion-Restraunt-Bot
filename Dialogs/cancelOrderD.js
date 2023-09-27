const {
  WaterfallDialog,
  ComponentDialog,
  NumberPrompt,
  ChoicePrompt,
  DialogSet,
  ChoiceFactory,
  ListStyle,
} = require("botbuilder-dialogs");

const OrderData = require("../models/ordersModel");

const ORDER_ID_PROMPT = "orderIdPrompt";
const CANCEL_TABLE_DIALOG = "cancelTable";
const CHOICE_PROMPT = "choiceprompt";
const { cancelorderDialog, showMenuDialog } = require("../Constants/DialogId");

class cancelOrderBooking extends ComponentDialog {
  constructor(conversationState) {
    super(cancelorderDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;

    this.dialogs = new DialogSet(
      this.conversationState.createProperty("DialogSet")
    );

    this.addDialog(new NumberPrompt(ORDER_ID_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(
      new WaterfallDialog(CANCEL_TABLE_DIALOG, [
        this.askOrderid.bind(this),
        this.processCancel.bind(this),
        this.finalizeCancel.bind(this),
      ])
    );
    this.initialDialogId = CANCEL_TABLE_DIALOG;
  }
  async askOrderid(stepContext) {
    return await stepContext.prompt(
      ORDER_ID_PROMPT,
      "I understand that you want to cancel your Order. Please provide your Order ID to help us to fetch Order Data."
    );
  }

  async processCancel(stepContext) {
    const orderId = stepContext.result;
    stepContext.values.orderId = orderId;
    if (await checkOrderId(orderId)) {
      await stepContext.context.sendActivity(
        "Order found! Processing cancellation..."
      );
      const orderId = stepContext.values.orderId;
      await OrderData.deleteOne({ orderId: orderId });
      await stepContext.context.sendActivity(
        "Your Order has been successfully canceled. Thank you for using our service."
      );
      return await stepContext.endDialog();
    } else {
      const options = ["Order Food", "Enter Order ID again"];
      await stepContext.context.sendActivity(
        "Sorry, we couldn't find a Order with that Order ID. What would you like to do next?"
      );
      return await stepContext.prompt(CHOICE_PROMPT, {
        prompt: "Please select an option.",
        choices: ChoiceFactory.toChoices(options),
        style: ListStyle.heroCard,
      });
    }
  }

  async finalizeCancel(stepContext) {
    stepContext.values.choice = stepContext.result;
    const choice = stepContext.result.value;
    if (choice === "Order Food") {
      return await stepContext.beginDialog(showMenuDialog);
    } else if (choice === "Enter Order ID again") {
      return await stepContext.replaceDialog(CANCEL_TABLE_DIALOG);
    }
    return await stepContext.endDialog();
  }
}

async function checkOrderId(orderId) {
  try {
    console.log(orderId);
    const data = await OrderData.findOne({ orderId: orderId });
    console.log("checkOrderId result:", data);
    if (data !== null) return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

module.exports.cancelOrderBooking = cancelOrderBooking;
