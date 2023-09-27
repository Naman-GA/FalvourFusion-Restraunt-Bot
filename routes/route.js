// require("dotenv").config();
// const express = require("express");
// const router = express.Router();
// const {
//   CloudAdapter,
//   ConversationState,
//   MemoryStorage,
//   ConfigurationBotFrameworkAuthentication,
//   BotFrameworkAdapter,
// } = require("botbuilder");
// const { BotActivityHandler } = require("./botActivityHandler.js");
// const { RootDialog } = require("../Dialogs/rootD.js");

// const notificationTemplate = require("../adaptiveCards/notification-default.json");
// const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");

// const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
//   process.env
// );
// // Creating a adapter
// const { BotBuilderCloudAdapter } = require("@microsoft/teamsfx");
// const ConversationBot = BotBuilderCloudAdapter.ConversationBot;

// const adapter = new CloudAdapter(botFrameworkAuthentication);

// const notificationApp = new ConversationBot({
//   // The bot id and password to create CloudAdapter.
//   // See https://aka.ms/about-bot-adapter to learn more about adapters.
//   adapterConfig: {
//     MicrosoftAppId: process.env.MicrosoftAppId,
//     MicrosoftAppPassword: process.env.MicrosoftAppPassword,
//     MicrosoftAppType: "MultiTenant",
//   },
//   // Enable notification
//   notification: {
//     enabled: true,
//   },
// });

// adapter.OnTurnError = async function (context, error) {
//   if (error) {
//     console.log(`Some error: ${error}`);
//     await context.sendActivity(`Some error: ${error}`);
//   }
// };

// const memory = new MemoryStorage();
// // Create conversation and user state with in-memory storage provider.
// const conversationState = new ConversationState(memory);
// const rootDialog = new RootDialog(conversationState);
// const bot = new BotActivityHandler(conversationState, rootDialog);

// router.post("/messages", (req, res) => {
//   notificationApp.adapter.process(req, res, async (context) => {
//     // must include await otherwise throw an error
//     await bot.run(context);
//   });
// });

// router.post("/notifications", async (req, res) => {
//   let continuationToken = undefined;
//   do {
//     const members = await notificationApp.notification.findAllMembers(
//       async (m) => m.account.email?.endsWith("com")
//     );
//     for (const member of members) {
//       await member.sendAdaptiveCard(
//         AdaptiveCards.declare(notificationTemplate).render({
//           title: "New Event Occurred!",
//           appName: "Contoso App Notification",
//           description: `This is a sample http-triggered notification to ${target.type}`,
//           notificationUrl: "https://aka.ms/teamsfx-notification-new",
//         })
//       );
//     }
//     console.log("member", members);
//   } while (continuationToken);
// });
// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  BotBuilderCloudAdapter,
} = require("@microsoft/teamsfx");
const { BotActivityHandler } = require("./botActivityHandler.js");
const { RootDialog } = require("../Dialogs/rootD.js");

const notificationTemplate = require("../adaptiveCards/notification-default.json");
const { AdaptiveCards } = require("@microsoft/adaptivecards-tools");

const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication(
  process.env
);

// Creating a adapter
const adapter = new CloudAdapter(botFrameworkAuthentication);

const notificationApp = new BotBuilderCloudAdapter.ConversationBot({
  // The bot id and password to create CloudAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppType: "MultiTenant",
  },
  // Enable notification
  notification: {
    enabled: true,
  },
});

adapter.OnTurnError = async function (context, error) {
  if (error) {
    console.log(`Some error: ${error}`);
    await context.sendActivity(`Some error: ${error}`);
  }
};

// Create conversation state with in-memory storage provider.
const conversationState = new BotBuilderCloudAdapter.CloudConversationState();

const rootDialog = new RootDialog(conversationState);
const bot = new BotActivityHandler(conversationState, rootDialog);

router.post("/messages", (req, res) => {
  notificationApp.adapter.process(req, res, async (context) => {
    // must include await otherwise throw an error
    await bot.run(context);
  });
});

router.post("/notifications", async (req, res) => {
  let continuationToken = undefined;
  do {
    const members = await notificationApp.notification.findAllMembers(
      async (m) => m.account.email?.endsWith("com")
    );
    for (const member of members) {
      await member.sendAdaptiveCard(
        AdaptiveCards.declare(notificationTemplate).render({
          title: "New Event Occurred!",
          appName: "Contoso App Notification",
          description: "This is a sample http-triggered notification.",
          notificationUrl: "https://aka.ms/teamsfx-notification-new",
        })
      );
    }
    console.log("member", members);
  } while (continuationToken);

  res.status(200).send("Notifications sent successfully");
});

module.exports = router;
