const {
  ComponentDialog,
  WaterfallDialog,
  ConfirmPrompt,
} = require("botbuilder-dialogs");
const { CardFactory } = require("botbuilder");

const { clearCart, showMenuDialog } = require("../Components/DialogId");
const { heroCard } = require("../Cards/mainCard");
const CONFIRM_PROMPT = "confirmprompt";

class clearCartDialog extends ComponentDialog {
  constructor(conversationState, cartItemsProperty) {
    super(clearCart);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;
    this.cartItemsProperty = cartItemsProperty;
    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(
      new WaterfallDialog("clearCardWF", [
        this.confirmPrompt.bind(this),
        this.handleChoice.bind(this),
      ])
    );

    this.initialDialogId = "clearCardWF";
  }

  async confirmPrompt(stepContext) {
    const promptMessage = "Would you like to Clear items from the cart?";
    const retryPromptMessage = "Please answer with 'yes' or 'no'.";
    return stepContext.prompt(CONFIRM_PROMPT, {
      prompt: promptMessage,
      retryPrompt: retryPromptMessage,
    });
  }

  async handleChoice(stepContext) {
    const userChoice = stepContext.result;
    if (userChoice === true) {
      await this.cartItemsProperty.set(stepContext.context, []);
      await stepContext.context.sendActivity(
        "Your cart has been cleared. It's like a fresh start! 🛒"
      );
      await stepContext.context.sendActivity({
        attachments: [CardFactory.adaptiveCard(heroCard())],
      });
    } else {
      await stepContext.context.sendActivity(
        "No items have been removed from the cart."
      );
      return await stepContext.replaceDialog(showMenuDialog);
    }
  }
}

module.exports.clearCartDialog = clearCartDialog;
