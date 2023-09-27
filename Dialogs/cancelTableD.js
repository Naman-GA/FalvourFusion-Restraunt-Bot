const {
  WaterfallDialog,
  ComponentDialog,
  NumberPrompt,
  DialogSet,
  ListStyle,
} = require("botbuilder-dialogs");

const Reservation = require("../models/reservation");

const ORDER_ID_PROMPT = "orderIdPrompt";
const CANCEL_TABLE_DIALOG = "cancelTable";
const CHOICE_PROMPT = "choiceprompt";
const {
  canceltableDialog,
  tablebookingDialog,
} = require("../Constants/DialogId");
class cancelTableBooking extends ComponentDialog {
  constructor(conversationState) {
    super(canceltableDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;

    this.dialogs = new DialogSet(
      this.conversationState.createProperty("DialogSet")
    );

    this.addDialog(new NumberPrompt(ORDER_ID_PROMPT));

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
      "I understand that you want to cancel your reservation. Please provide your Order ID to help us locate your reservation."
    );
  }

  async processCancel(stepContext) {
    const orderId = stepContext.result;
    stepContext.values.orderId = orderId;
    if (await checkOrderId(orderId)) {
      console.log("Reservation found!");
      const orderId = stepContext.values.orderId;
      await Reservation.deleteOne({ orderId: orderId });
      await stepContext.context.sendActivity(
        "Your reservation has been successfully canceled. Thank you for using our service."
      );
      return await stepContext.endDialog();
    } else {
      console.log("Reservation not found.");
      const options = ["Make a new reservation", "Enter Order ID again"];
      await stepContext.context.sendActivity(
        "Sorry, we couldn't find a reservation with that Order ID. What would you like to do next?"
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
    if (choice === "Make a new reservation") {
      return await stepContext.beginDialog(tablebookingDialog);
    } else if (choice === "Enter Order ID again") {
      return await stepContext.replaceDialog(CANCEL_TABLE_DIALOG);
    }
    return await stepContext.endDialog();
  }
}

async function checkOrderId(orderId) {
  try {
    const data = await Reservation.findOne({ orderId: orderId });
    console.log("checkOrderId result:", data);
    if (data !== null) return true;
  } catch (error) {
    console.log(error);
  }
  return false;
}

module.exports.cancelTableBooking = cancelTableBooking;
