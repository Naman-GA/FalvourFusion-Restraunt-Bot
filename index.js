const express = require("express");
const {
  CloudAdapter,
  ConfigurationServiceClientCredentialFactory,
  createBotFrameworkAuthenticationFromConfiguration,
  MemoryStorage,
  ConversationState,
} = require("botbuilder");
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

app.listen(3000, () => {
  console.log("Server Listening on 3000");
});
