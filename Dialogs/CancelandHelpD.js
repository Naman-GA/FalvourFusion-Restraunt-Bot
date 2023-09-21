const { InputHints, CardFactory } = require("botbuilder");
const { ComponentDialog, DialogTurnStatus } = require("botbuilder-dialogs");
const { heroCard } = require("../Cards/mainCard");

class CancelAndHelpDialog extends ComponentDialog {
  async onContinueDialog(innerDc) {
    const result = await this.interrupt(innerDc);
    if (result) {
      return result;
    }
    return await super.onContinueDialog(innerDc);
  }

  async interrupt(innerDc) {
    if (innerDc.context.activity.text) {
      const text = innerDc.context.activity.text.toLowerCase();

      switch (text) {
        case "help":
        case "?": {
          const helpMessageText = "How Could I help You?";
          await innerDc.context.sendActivity(
            helpMessageText,
            helpMessageText,
            InputHints.ExpectingInput
          );
          return await innerDc.context.sendActivity({
            attachments: [CardFactory.adaptiveCard(heroCard())],
          });
          //   return { status: DialogTurnStatus.waiting };
        }
        case "cancel":
        case "quit": {
          const cancelMessageText = "Cancelling... Type Hii to Start";
          await innerDc.context.sendActivity(
            cancelMessageText,
            cancelMessageText,
            InputHints.IgnoringInput
          );
          return await innerDc.cancelAllDialogs();
        }
      }
    }
  }
}

module.exports.CancelAndHelpDialog = CancelAndHelpDialog;
