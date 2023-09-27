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
    if (sharedContext) {
      // Use the sharedContext to construct a conversation reference
      const conversationReference = TurnContext.getConversationReference(
        sharedContext.activity
      );

      // You can save the conversation reference to a database or in-memory storage here

      // Later, use the stored reference to send a proactive message
      await adapter.continueConversationAsync(
        conversationReference,
        async (proactiveContext) => {
          // Construct and send the notification message
          await proactiveContext.sendActivity({
            type: "message",
            text: "This is a proactive notification.",
          });
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
// Respond with a success message
app.listen(3000, () => {
  console.log("Server Listening on 3000");
});
