const {
  WaterfallDialog,
  ComponentDialog,
  NumberPrompt,
  DialogSet,
  ChoicePrompt,
  ChoiceFactory,
  ListStyle,
} = require("botbuilder-dialogs");

const OrderData = require("../models/ordersModel");

const ORDER_ID_PROMPT = "orderIdPrompt";
const TRACK_ORDER_DIALOG = "trackPrompt";
const CHOICE_PROMPT = "choiceprompt";
const {
  trackorderDialog,
  showMenuDialog,
  cancelorderDialog,
} = require("../Constants/DialogId");
const { CardFactory } = require("botbuilder");
const { heroCard } = require("../Cards/mainCard");

class viewOrderBooking extends ComponentDialog {
  constructor(conversationState) {
    super(trackorderDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;

    this.dialogs = new DialogSet(
      this.conversationState.createProperty("DialogSet")
    );

    this.addDialog(new NumberPrompt(ORDER_ID_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

    this.addDialog(
      new WaterfallDialog(TRACK_ORDER_DIALOG, [
        this.askOrderid.bind(this),
        this.showStatus.bind(this),
        this.showOption.bind(this),
      ])
    );
    this.initialDialogId = TRACK_ORDER_DIALOG;
  }
  async askOrderid(stepContext) {
    return await stepContext.prompt(
      ORDER_ID_PROMPT,
      "I see you'd like to check your Order Status. To assist you better, please provide your Order ID, and we'll retrieve your Order details for you."
    );
  }

  async showStatus(stepContext) {
    const orderId = stepContext.result;
    const orderInfo = await OrderData.findOne({ orderId: orderId });

    if (orderInfo) {
      const userName = orderInfo.name;

      await stepContext.context.sendActivity(
        `Hello ${userName}, your order is currently being prepared.`
      );
      const options = ["Cancel Order", "Back"];
      return await stepContext.prompt(CHOICE_PROMPT, {
        prompt: "What's Next?",
        choices: ChoiceFactory.toChoices(options),
        style: ListStyle.heroCard,
      });
    } else {
      console.log("Reservation not found.");
      const options = ["Order Food", "Enter Order ID again", "Cancel"];
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
  async showOption(stepContext) {
    stepContext.values.choice = stepContext.result;
    const choice = stepContext.result.value;
    switch (choice) {
      case "Order Food":
        return await stepContext.beginDialog(showMenuDialog);
      case "Enter Order ID again":
        return await stepContext.replaceDialog(TRACK_ORDER_DIALOG);
      case "Cancel" || "Back":
        return await stepContext.context.sendActivity({
          attachements: [CardFactory.adaptiveCard(heroCard())],
        });
      case "Cancel Order":
        return await stepContext.beginDialog(cancelorderDialog);
    }

    return await stepContext.endDialog();
  }
}

module.exports.viewOrderBooking = viewOrderBooking;
