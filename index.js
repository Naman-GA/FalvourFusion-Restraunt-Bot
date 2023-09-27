const express = require("express");
const {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
  MemoryStorage,
  ConversationState,
  TurnContext,
  CardFactory,
} = require("botbuilder");
const notificationTemplate = require("./adaptiveCards/notification-default.json");
const { notificationApp } = require("./initialize");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");
const { Bot } = require("./bot");
const { RootDialog } = require("./Dialogs/rootD");
const dotenv = require("dotenv");
const { Context } = require("mocha");
dotenv.config();
const app = express();
app.use(express.json());

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: process.env.MicrosoftAppId,
  MicrosoftAppPassword: process.env.MicrosoftAppPassword,
  MicrosoftAppType: process.env.MicrosoftAppType,
  MicrosoftAppTenantId: process.env.MicrosoftAppTenantId,
});

const botFrameworkAuthentication =
  createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

const adapter = new CloudAdapter(botFrameworkAuthentication);

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const rootDialoug = new RootDialog(conversationState);

const myBot = new Bot(conversationState, rootDialoug);
let sharedContext = null;
app.use("/api/messages", async (req, res) => {
  adapter.process(req, res, async (context) => {
    sharedContext = context;
    await myBot.run(context);
    console.log(context);
  });
});

app.post("/api/notification", async (req, res) => {
  try {
    // Extract the context from the request body (assuming it contains context information)

    // Check if the context object is valid and contains the necessary information
    if (sharedContext) {
      const botConversationReference = {
        bot: { id: sharedContext.activity.recipient.id },
        channelId: sharedContext.activity.channelId,
        serviceUrl: sharedContext.activity.serviceUrl,
        conversation: {
          id: sharedContext.activity.conversation.id,
        },
      };

      const orderNotification = "Hii this is notifiation";

      const message = {
        type: "message",
        text: `Order details: ${JSON.stringify(orderNotification)}`,
      };

      await adapter.continueConversationAsync(
        botConversationReference,
        async (innerContext) => {
          await innerContext.sendActivity(message);
        }
      );
      res.json({ success: true });
    } else {
      // Handle the case where the context is not available or lacks necessary information
      res.status(400).json({ error: "Invalid or incomplete context" });
    }
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({ error: "Error sending notification" });
  }
});

app.listen(3000, () => {
  console.log("Server Listening on 3000");
});
