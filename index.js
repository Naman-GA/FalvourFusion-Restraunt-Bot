const express = require("express");
const {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
  MemoryStorage,
  ConversationState,
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

app.use("/api/messages", (req, res) => {
  adapter.process(req, res, async (context) => {
    await myBot.run(context);
  });
});

app.post(
  "/api/notification",
  // Add more parsers if needed
  async (req, res) => {
    const pageSize = 100;
    console.log("pagesize", pageSize);
    let continuationToken = undefined;
    do {
      const pagedData =
        await notificationApp.notification.getPagedInstallations(
          pageSize,
          continuationToken
        );
      console.log(pagedData);
      console.log("Hii");
      const installations = pagedData.data;
      continuationToken = pagedData.continuationToken;

      for (const target of installations) {
        console.log("target", target);
        console.log(NotificationTargetType.Person);
        await target.sendAdaptiveCard(
          AdaptiveCards.declare(notificationTemplate).render({
            title: "New Event Occurred!",
            appName: "Contoso App Notification",
            description: `This is a sample http-triggered notification to ${target.type}`,
            notificationUrl: "https://aka.ms/teamsfx-notification-new",
          })
        );
      }
    } while (continuationToken);
    console.log("inside while");
    res.json({});
  }
);
app.listen(3000, () => {
  console.log("Server Listening on 3000");
});
