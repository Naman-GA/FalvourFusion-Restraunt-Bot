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
      const text = context.activity.text.toLowerCase();

      if (text.includes("hi") || text.includes("hello")) {
        // Respond with "Hi" when the message contains "hi" or "hello"
        await context.sendActivity("Hi");
      } else {
        // Continue with your existing logic for handling other messages
        await this.rootDialog.run(context, this.accessor);
      }

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
  async run(context) {
    await super.run(context);
    await this.conversationState.saveChanges(context, false);
  }
}

module.exports.Bot = Bot;
