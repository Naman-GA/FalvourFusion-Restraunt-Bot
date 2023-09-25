const { BotBuilderCloudAdapter } = require("@microsoft/teamsfx");
const ConversationBot = BotBuilderCloudAdapter.ConversationBot;

// Create bot.
const notificationApp = new ConversationBot({
  // The bot id and password to create CloudAdapter.
  // See https://aka.ms/about-bot-adapter to learn more about adapters.
  adapterConfig: {
    MicrosoftAppId: "37497caf-1818-42fa-930a-1f14586c6bab",
    MicrosoftAppPassword: "3Mc8Q~w.vAxbmNOtPpdgJ_872eKU9JY-d2jyXasp",
    MicrosoftAppType: "MultiTenant",
  },
  // Enable notification
  notification: {
    enabled: true,
  },
});

module.exports = {
  notificationApp,
};
