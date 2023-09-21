const {
  WaterfallDialog,
  ComponentDialog,
  NumberPrompt,
  DialogSet,
  ChoicePrompt,
  ChoiceFactory,
  ListStyle,
} = require("botbuilder-dialogs");

const Reservation = require("../models/reservation");

const ORDER_ID_PROMPT = "orderIdPrompt";
const TRACK_TABLE_DIALOG = "cancelTable";
const CHOICE_PROMPT = "choiceprompt";
const {
  tracktableDialog,
  tablebookingDialog,
  showMenuDialog,
} = require("../Components/DialogId");
class viewTableBooking extends ComponentDialog {
  constructor(conversationState) {
    super(tracktableDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;

    this.dialogs = new DialogSet(
      this.conversationState.createProperty("DialogSet")
    );

    this.addDialog(new NumberPrompt(ORDER_ID_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));

    this.addDialog(
      new WaterfallDialog(TRACK_TABLE_DIALOG, [
        this.askOrderid.bind(this),
        this.showStatus.bind(this),
        this.showOption.bind(this),
      ])
    );
    this.initialDialogId = TRACK_TABLE_DIALOG;
  }
  async askOrderid(stepContext) {
    return await stepContext.prompt(
      ORDER_ID_PROMPT,
      "I see you'd like to check your reservation. To assist you better, please provide your Order ID, and we'll retrieve your reservation details for you."
    );
  }

  async showStatus(stepContext) {
    const orderId = stepContext.result;
    const orderInfo = await Reservation.findOne({ orderId: orderId });

    if (orderInfo) {
      const userName = orderInfo.userName;

      await stepContext.context.sendActivity(
        `Hello ${userName}, your reservation for ${
          orderInfo.no
        } guests on ${orderInfo.date.toLocaleDateString()} at ${
          orderInfo.time
        } is confirmed and all set! We're looking forward to hosting you for a fantastic dining experience.`
      );
      const options = ["View Menu", "Search another Booking", "Home"];
      return await stepContext.prompt(CHOICE_PROMPT, {
        prompt: "What's Next?",
        choices: ChoiceFactory.toChoices(options),
        style: ListStyle.heroCard,
      });
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
  async showOption(stepContext) {
    stepContext.values.choice = stepContext.result;
    const choice = stepContext.result.value;
    console.log(choice);
    switch (choice) {
      case "Make a new reservation":
        return await stepContext.beginDialog(tablebookingDialog);
      case "Enter Order ID again":
        return await stepContext.replaceDialog(TRACK_TABLE_DIALOG);
      case "Home":
        return await stepContext.context.sendActivity({
          attachements: [CardFactory.adaptiveCard(heroCard())],
        });
      case "Search another Booking":
        return await stepContext.replaceDialog(TRACK_TABLE_DIALOG);
      case "View Menu":
        return await stepContext.beginDialog(showMenuDialog);
    }
    return await stepContext.endDialog();
  }
}

module.exports.viewTableBooking = viewTableBooking;
