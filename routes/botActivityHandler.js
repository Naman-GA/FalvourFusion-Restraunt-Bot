const { ActivityHandler, CardFactory } = require("botbuilder");
const { heroCard } = require("../Cards/mainCard");

class BotActivityHandler extends ActivityHandler {
  constructor(conversationState, rootDialog) {
    super();
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;
    this.rootDialog = rootDialog;
    this.accessor = this.conversationState.createProperty("DialogAccessor");

    this.onMessage(async (context, next) => {
      try {
        if (
          context.activity &&
          context.activity.text &&
          context.activity.text.toLowerCase() == "hi"
        ) {
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(heroCard())],
          });
        } else {
          await this.rootDialog.run(context, this.accessor);
        }
      } catch (error) {
        console.log("Error in botActivityHandler :- " + error);
        await context.sendActivity("Error in botActivityHandler....");
      }

      await next();
    });
    this.onMembersAdded(async (context, next) => {
      // const membersAdded = context.activity.membersAdded;
      // for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
      //   if (membersAdded[cnt].id !== context.activity.recipient.id) {
      //     await context.sendActivity({
      //       attachments: [CardFactory.adaptiveCard(heroCard())],
      //     });
      //   }
      // }
      await next();
    });
    this.onConversationUpdate(async (context, next) => {
      try {
        if (
          context.activity.membersAdded &&
          context.activity.membersAdded[1].id == context.activity.from.id
        ) {
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(heroCard())],
          });
        } else {
          await this.rootDialog.run(context, this.accessor);
        }
      } catch (error) {
        console.log("Error in botActivityHandler :- " + error);
        await context.sendActivity("Error in botActivityHandler....");
      }
      await next();
    });
  }

  async run(context) {
    await super.run(context);
    await this.conversationState.saveChanges(context, false);
  }
}

module.exports.BotActivityHandler = BotActivityHandler;
