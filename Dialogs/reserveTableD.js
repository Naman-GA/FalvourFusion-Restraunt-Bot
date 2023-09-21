const {
  WaterfallDialog,
  ComponentDialog,
  TextPrompt,
  NumberPrompt,
  DateTimePrompt,
  DialogSet,
  ChoiceFactory,
  ChoicePrompt,
  ListStyle,
} = require("botbuilder-dialogs");
const Reservation = require("../models/reservation");
const { tablebookingDialog } = require("../Components/DialogId");
const DATE_TIME_PROMPT = "dateTimePrompt";
const NAME_PROMPT = "namePrompt";
const MOBILE_NUMBER_PROMPT = "mobileNumberPrompt";
const NUMBER_OF_GUESTS_PROMPT = "numberOfGuestsPrompt";
const TIME_SELECTION_PROMPT = "timeSelectionPrompt";
const { CancelAndHelpDialog } = require("./CancelandHelpD");

class TableReservationDialog extends CancelAndHelpDialog {
  constructor(conversationState) {
    super(tablebookingDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;

    this.dialogs = new DialogSet(
      this.conversationState.createProperty("DialogSet")
    );

    this.addDialog(new TextPrompt(NAME_PROMPT));
    this.addDialog(new NumberPrompt(MOBILE_NUMBER_PROMPT));
    this.addDialog(new NumberPrompt(NUMBER_OF_GUESTS_PROMPT));
    this.addDialog(
      new DateTimePrompt(DATE_TIME_PROMPT, this.dateTimeValidator)
    );
    this.addDialog(new ChoicePrompt(TIME_SELECTION_PROMPT));

    this.addDialog(
      new WaterfallDialog("reservationWaterfall", [
        this.askForName.bind(this),
        this.askForMobileNumber.bind(this),
        this.askForNumberOfGuests.bind(this),
        this.askForDate.bind(this),
        this.promptForTime.bind(this),
        this.showAvailableTimes.bind(this),
        this.finalizeReservation.bind(this),
      ])
    );
    this.initialDialogId = "reservationWaterfall";
  }

  async askForName(stepContext) {
    await stepContext.context.sendActivity(
      "Great,I'll help you with your table booking! Please Answer following questions."
    );
    return await stepContext.prompt(NAME_PROMPT, "What is your name?");
  }

  async askForMobileNumber(stepContext) {
    stepContext.values.name = stepContext.result;

    return await stepContext.prompt(
      MOBILE_NUMBER_PROMPT,
      "What is your mobile number?"
    );
  }

  async askForNumberOfGuests(stepContext) {
    stepContext.values.mobileNumber = stepContext.result;

    return await stepContext.prompt(
      NUMBER_OF_GUESTS_PROMPT,
      "How many guests will be joining you?"
    );
  }

  async askForDate(stepContext) {
    stepContext.values.numberOfGuests = stepContext.result;
    const dateTimePromptOptions = {
      prompt: "For What date would you like to reserve a table?",
      retryPrompt: "Please enter a valid date.",
    };
    return await stepContext.prompt(DATE_TIME_PROMPT, dateTimePromptOptions);
  }

  async promptForTime(stepContext) {
    console.log("inside");
    const selectedDate =
      stepContext.result && stepContext.result.values.selectedDate;
    console.log(selectedDate);
    console.log("inside time", stepContext.result);
    stepContext.values.reservationDate = stepContext.result[0].value;
    const timeOfDayChoices = [
      "Morning 10-12",
      "Afternoon 12-4",
      "Evening 6-9",
      "Night 9-11",
    ];
    const promptOptions = {
      prompt: "Please select a time of day for your reservation:",
      choices: ChoiceFactory.toChoices(timeOfDayChoices),
      style: ListStyle.heroCard,
    };
    return await stepContext.prompt(TIME_SELECTION_PROMPT, promptOptions);
  }

  async showAvailableTimes(stepContext) {
    const selectedTimeOfDay = stepContext.result.value.toLowerCase();
    let availableTimes = [];
    console.log(selectedTimeOfDay);
    switch (selectedTimeOfDay) {
      case "morning 10-12":
        availableTimes = ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"];
        break;
      case "afternoon 12-4":
        availableTimes = [
          "12:00 PM",
          "12:30 PM",
          "1:00 PM",
          "1:30 PM",
          "2:00 PM",
          "2:30 PM",
          "3:00 PM",
          "4:00 PM",
        ];
        break;
      case "evening 6-9":
        availableTimes = [
          "6:00 PM",
          "6:30 PM",
          "7:00 PM",
          "7:30 PM",
          "8:00 PM",
          "8:30 PM",
          "9:00 PM",
        ];
        break;
      case "night 9-11":
        availableTimes = ["9:30 PM", "10:00 PM", "10:30 PM"];
    }
    if (availableTimes.length === 0) {
      await stepContext.context.sendActivity(
        "No available times for the selected time of day."
      );
      return await stepContext.endDialog();
    }

    const promptOptions = {
      prompt: "Please select an available time:",
      choices: ChoiceFactory.toChoices(availableTimes),
      style: ListStyle.heroCard,
    };
    return await stepContext.prompt(TIME_SELECTION_PROMPT, promptOptions);
  }
  async finalizeReservation(stepContext) {
    const reservationDate = stepContext.values.reservationDate;
    const selectedTime = stepContext.result.value;
    const name = stepContext.values.name;
    const mobileNumber = stepContext.values.mobileNumber;
    const numberOfGuests = stepContext.values.numberOfGuests;
    const OrderId = Math.floor(Math.random() * 1000000);

    const reservationAtTime = await Reservation.find({
      date: reservationDate,
      time: selectedTime,
    });
    const currReserv = reservationAtTime.reduce(
      (total, reservation) => total + reservation.no,
      0
    );
    const currCapcity = 80 - currReserv;
    if (currCapcity >= numberOfGuests) {
      console.log(reservationAtTime);
      const reservationDetails = new Reservation({
        date: reservationDate,
        userName: name,
        mobileNo: mobileNumber,
        no: numberOfGuests,
        time: selectedTime,
        orderId: OrderId,
      });

      try {
        await reservationDetails.save();
        await stepContext.context.sendActivity(
          `Great, ${name}! Your table reservation for ${numberOfGuests} guests on ${reservationDate.toLocaleString()} is confirmed. Your Order ID is ${OrderId}. Please keep it for future reference. Enjoy your dining experience! 🍽️`
        );

        return await stepContext.endDialog();
      } catch (error) {
        console.error("Error saving reservation:", error);
        await stepContext.context.sendActivity(
          "There was an error while saving your reservation. Please try again later."
        );
        return await stepContext.endDialog();
      }
    } else {
      return await stepContext.context.sendActivity(
        `Sorry, there are not enough available seats for ${numberOfGuests} guests at ${selectedTime}.`
      );
    }
  }

  async dateTimeValidator(promptContext) {
    const currDate = new Date();
    currDate.setHours(0, 0, 0, 0);
    const userDateTime = promptContext.recognized.value[0].value;
    if (
      userDateTime &&
      new Date(userDateTime) instanceof Date &&
      new Date(userDateTime) >= currDate
    ) {
      return userDateTime;
    }
    await promptContext.context.sendActivity(
      "Please enter a valid date and time in the future."
    );
    return undefined;
  }
}
module.exports.TableReservationDialog = TableReservationDialog;
