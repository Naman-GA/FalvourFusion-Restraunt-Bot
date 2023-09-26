const { ActivityHandler, CardFactory } = require("botbuilder");
const { heroCard } = require("./Cards/mainCard");

class Bot extends ActivityHandler {
  constructor(conversationState, rootDialog) {
    super();
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;
    this.rootDialog = rootDialog;
    this.accessor = this.conversationState.createProperty("DialogAccessor");

    this.onMessage(async (context, next) => {
      // Continue with your existing logic for handling other messages
      await this.rootDialog.run(context, this.accessor);
      await next();
    });
    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
        if (membersAdded[cnt].id !== context.activity.recipient.id) {
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(heroCard())],
          });
        }
      }
      await next();
    });
  }
  async sendNotification(context) {
    // Create and send a notification text message here
    const notificationMessage =
      "This is a notification. Your notification message goes here.";

    await context.sendActivity(notificationMessage);
  }
  async run(context) {
    await super.run(context);
    await this.conversationState.saveChanges(context, false);
  }
}

module.exports.Bot = Bot;
