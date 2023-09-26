const { BotBuilderCloudAdapter } = require("@microsoft/teamsfx");
const ConversationBot = BotBuilderCloudAdapter.ConversationBot;

// Create bot.
const notificationApp = new ConversationBot({
  // The bot id and password to create CloudAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    MicrosoftAppId: "4dec64d7-c13d-4fef-8edf-0840d7e65769",
    MicrosoftAppPassword: "lir8Q~RuOYFB59dGxgtu2kkBXhidN8uBDkxSgas9",
    MicrosoftAppType: "MultiTenant",
    MicrosoftAppTenantId: "969d68be-82fa-4de4-905c-6a8db4f67f38",
  },
  // Enable notification
  notification: {
    enabled: true,
  },
});

module.exports = {
  notificationApp,
};
