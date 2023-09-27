const {
  ComponentDialog,
  DialogSet,
  DialogTurnStatus,
  WaterfallDialog,
} = require("botbuilder-dialogs");
const { CardFactory } = require("botbuilder");
const {
  rootDialog,
  orderFoodDialog,
  reserveTableDialog,
  tablebookingDialog,
  canceltableDialog,
  tracktableDialog,
  showMenuDialog,
  cancelorderDialog,
  trackorderDialog,
} = require("../Constants/DialogId");
const {
  OrderFoodDialog,
  ReservationDialog,
  TableReservationDialog,
  CancelTable,
  ViewTable,
  ShowMenuDialog,
  CancelOrder,
  TrackOrder,
} = require("./index");

const { heroCard } = require("../Cards/mainCard");
const parseMessage = "parseMessage";

class RootDialog extends ComponentDialog {
  constructor(conversationState) {
    super(rootDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;

    this.addDialog(
      new WaterfallDialog(parseMessage, [this.routeMessage.bind(this)])
    );

    this.addDialog(new OrderFoodDialog(conversationState));
    this.addDialog(new ShowMenuDialog(conversationState));
    this.addDialog(new CancelOrder(conversationState));
    this.addDialog(new TrackOrder(conversationState));
    this.addDialog(new ReservationDialog(conversationState));
    this.addDialog(new TableReservationDialog(conversationState));
    this.addDialog(new CancelTable(conversationState));
    this.addDialog(new ViewTable(conversationState));

    this.initialDialogId = parseMessage;
  }

  async run(context, accessor) {
    try {
      const dialogSet = new DialogSet(accessor);
      dialogSet.add(this);
      const dialogContext = await dialogSet.createContext(context);
      const results = await dialogContext.continueDialog();
      if (
        results &&
        results.status &&
        results.status === DialogTurnStatus.empty
      ) {
        await dialogContext.beginDialog(this.id);
      } else {
        console.log("Dialog Stack is Empty");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async routeMessage(stepContext) {
    switch (stepContext.context.activity.value.action) {
      case "orderFood":
        return await stepContext.beginDialog(orderFoodDialog);
      case "browseMenu":
        return await stepContext.beginDialog(showMenuDialog);
      case "cancelOrder":
        return await stepContext.beginDialog(cancelorderDialog);
      case "viewOrder":
        return await stepContext.beginDialog(trackorderDialog);
      case "tableReservation":
        return await stepContext.beginDialog(reserveTableDialog);
      case "bookTable":
        return await stepContext.beginDialog(tablebookingDialog);
      case "cancelTable":
        return await stepContext.beginDialog(canceltableDialog);
      case "viewTable":
        return await stepContext.beginDialog(tracktableDialog);
      default:
        await stepContext.context.sendActivity("Currently Learning");
    }
    return await stepContext.endDialog();
  }
}

module.exports.RootDialog = RootDialog;
