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
  // Create an instance of your Bot class and run it
  const myBot = new Bot(conversationState, rootDialoug);
  const notificationCard = {
    type: "AdaptiveCard",
    version: "1.0",
    body: [
      {
        type: "TextBlock",
        text: "Notification",
        size: "large",
        weight: "bolder",
      },
      {
        type: "TextBlock",
        text: "Title",
        size: "medium",
        weight: "bolder",
      },
      {
        type: "TextBlock",
        text: "Your notification title goes here",
        wrap: true,
      },
      {
        type: "TextBlock",
        text: "Description",
        size: "medium",
        weight: "bolder",
      },
      {
        type: "TextBlock",
        text: "Your notification description goes here",
        wrap: true,
      },
    ],
  };

  // Send the Adaptive Card as a response
  await context.sendActivity({
    attachments: [CardFactory.adaptiveCard(notificationCard)],
  });

  // Respond with a success message
  res.send("Notification sent.");

  // Respond with a success message
});

<<<<<<< HEAD
=======
      // Respond with a success message
      res.send("Notification sent.");

      // Respond with a success message
    };
  }
);
>>>>>>> parent of 74b5f1c (notification)
app.listen(3000, () => {
  console.log("Server Listening on 3000");
});
