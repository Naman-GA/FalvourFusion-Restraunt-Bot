const {
  ComponentDialog,
  WaterfallDialog,
  ChoicePrompt,
  TextPrompt,
  NumberPrompt,
  ChoiceFactory,
  ListStyle,
} = require("botbuilder-dialogs");
const { CardFactory } = require("botbuilder");

const NAME_PROMPT = "namePrompt";
const MOBILE_NUMBER_PROMPT = "mobileNumberPrompt";
const ADDRESS_PROMPT = "addressPrompt";
const CHOICE_PROMPT = "choiceprompt";
const sendEmail = require("../utils/nodemailer");
const axios = require("axios");
const {
  checkoutOrder,
  cancelorderDialog,
  trackorderDialog,
} = require("../Components/DialogId");
const { heroCard } = require("../Cards/mainCard");
const OrderData = require("../models/ordersModel");

class checkOutOrder extends ComponentDialog {
  constructor(conversationState, cartItemsProperty) {
    super(checkoutOrder);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;
    this.cartItemsProperty = cartItemsProperty;

    this.addDialog(new TextPrompt(NAME_PROMPT));
    this.addDialog(new NumberPrompt(MOBILE_NUMBER_PROMPT));
    this.addDialog(new TextPrompt(ADDRESS_PROMPT));
    this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
    this.addDialog(
      new WaterfallDialog("checkoutCartWF", [
        this.askForName.bind(this),
        this.askForMobileNumber.bind(this),
        this.askForAddress.bind(this),
        this.showOrderSummary.bind(this),
        this.showOption.bind(this),
      ])
    );

    this.initialDialogId = "checkoutCartWF";
  }

  async askForName(stepContext) {
    await stepContext.context.sendActivity(
      "Awesome! 🎉Let's proceed with your order checkout. To ensure a smooth experience, please take a moment to answer a few quick questions:"
    );
    return await stepContext.prompt(NAME_PROMPT, "What is your name?");
  }

  async askForMobileNumber(stepContext) {
    stepContext.values.name = stepContext.result;

    return await stepContext.prompt(
      MOBILE_NUMBER_PROMPT,
      "What is your mobile number?"
    );
  }

  async askForAddress(stepContext) {
    stepContext.values.mobileNumber = stepContext.result;
    return await stepContext.prompt(
      ADDRESS_PROMPT,
      "Please Help me with an address for Food delivery?"
    );
  }

  async showOrderSummary(stepContext) {
    stepContext.values.address = stepContext.result;
    const cartItems = await this.cartItemsProperty.get(stepContext.context, []);

    if (cartItems.length > 0) {
      const OrderId = Math.floor(Math.random() * 1000000);
      const newOrderData = new OrderData({
        orderId: OrderId,
        name: stepContext.values.name,
        mobileNo: stepContext.values.mobileNumber,
        address: stepContext.values.address,
        orderedItems: cartItems.map((item) => ({
          itemName: item.name,
          OrderQty: item.quantity,
          price: item.price,
        })),
        totalOrderAmount: cartItems.reduce(
          (total, item) =>
            total + parseInt(item.price) * parseInt(item.quantity),
          0
        ),
      });
      try {
        const data = await newOrderData.save();
        // let orderDetails =
        //   `Order ID: ${data.orderId}\n` +
        //   `Name: ${stepContext.values.name}\n` +
        //   `Mobile Number: ${stepContext.values.mobileNumber}\n` +
        //   `Delivery Address: ${stepContext.values.address}\n` +
        //   "Order Details:\n";

        // for (const item of cartItems) {
        //   orderDetails += `- Item: ${item.name}, Quantity: ${item.quantity}, Price: Rs.${item.price}/-\n`;
        // }

        // orderDetails += `Total Order Amount: Rs.${data.totalOrderAmount}/-`;

        // // Send order confirmation email
        // const recipientEmail = "n"; // Replace with the customer's email
        // const emailSubject = "Order Confirmation";

        // const mail = {
        //   from: "ngmarch15@gmail.com", // Replace with your sender email
        //   to: recipientEmail,
        //   subject: emailSubject,
        //   text: orderDetails, // Use the formatted order details here
        // };

        // try {
        //   const messageId = await sendEmail(mail);
        //   console.log(
        //     `Order confirmation email sent successfully. Message ID: ${messageId}`
        //   );
        // } catch (error) {
        //   console.error("Error sending order confirmation email:", error);
        // }
        const notificationUrl =
          "https://long-blue-crayfish-hem.cyclic.cloud/api/notification"; // Replace with your bot's URL

        try {
          const response = await axios.post(notificationUrl, data);
          console.log(response);
          console.log("Notification request sent successfully:", response.data);
        } catch (error) { 
          console.error("Error sending notification request:", error);
        }
        const orderSummaryCard = CardFactory.adaptiveCard({
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.3",
          body: [
            {
              type: "Container",
              items: [
                {
                  type: "TextBlock",
                  text: "Order Summary",
                  size: "large",
                  weight: "bolder",
                },
                {
                  type: "TextBlock",
                  text: "Customer Information:",
                  size: "medium",
                  weight: "bolder",
                  spacing: "small",
                },
                {
                  type: "TextBlock",
                  text: `Name: ${stepContext.values.name}`,
                  spacing: "none",
                },
                {
                  type: "TextBlock",
                  text: `Mobile Number: ${stepContext.values.mobileNumber}`,
                  spacing: "none",
                },
                {
                  type: "TextBlock",
                  text: `Delivery Address: ${stepContext.values.address}`,
                  spacing: "none",
                },
                {
                  type: "TextBlock",
                  text: "Order Details:",
                  size: "medium",
                  weight: "bolder",
                  spacing: "small",
                },
                {
                  type: "Container",
                  style: "emphasis",
                  separator: true,
                  items: cartItems.map((item) => ({
                    type: "ColumnSet",
                    columns: [
                      {
                        type: "Column",
                        width: "auto",
                        items: [
                          {
                            type: "Image",
                            url: item.image_url,
                            size: "medium",
                            altText: item.name,
                          },
                        ],
                      },
                      {
                        type: "Column",
                        width: "stretch",
                        items: [
                          {
                            type: "TextBlock",
                            text: item.name,
                            weight: "bolder",
                          },
                          {
                            type: "TextBlock",
                            text: `Quantity: ${item.quantity}.`,
                          },
                          {
                            type: "TextBlock",
                            text: `Price per Qty: Rs.${item.price}/-`,
                          },
                          {
                            type: "TextBlock",
                            text: `Total Amount: Rs.${
                              parseInt(item.price) * parseInt(item.quantity)
                            }/-`,
                          },
                        ],
                      },
                    ],
                  })),
                },
              ],
            },
          ],
        });
        await stepContext.context.sendActivity({
          attachments: [orderSummaryCard],
        });
        await stepContext.context.sendActivity(
          `Your order (Order ID: ${newOrderData.orderId}) has been successfully placed! 🛒 Thank you for choosing us. We'll start preparing your delicious items right away. 😊`
        );
        const options = ["Cancel Order", "Track Order", "Home"];
        return await stepContext.prompt(CHOICE_PROMPT, {
          prompt: "What's Next?",
          choices: ChoiceFactory.toChoices(options),
          style: ListStyle.heroCard,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("No item In Cart");
    }
  }
  async showOption(stepContext) {
    stepContext.values.choice = stepContext.result;
    const choice = stepContext.result.value;
    switch (choice) {
      case "Track Order":
        return await stepContext.beginDialog(trackorderDialog);
      case "Home":
        return await stepContext.context.sendActivity({
          attachements: [CardFactory.adaptiveCard(heroCard())],
        });
      case "Cancel Order":
        return await stepContext.beginDialog(cancelorderDialog);
    }
    return await stepContext.endDialog();
  }
}

module.exports.checkOutOrder = checkOutOrder;
