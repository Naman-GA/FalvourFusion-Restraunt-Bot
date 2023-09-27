const {
  ComponentDialog,
  WaterfallDialog,
  ConfirmPrompt,
} = require("botbuilder-dialogs");
const { CardFactory, MessageFactory } = require("botbuilder");
const { ObjectId } = require("mongodb");

const {
  showMenuDialog,
  clearCart,
  checkoutOrder,
  orderFoodDialog,
} = require("../Constants/DialogId");

const showMenuDialogWF1 = "showMenuDialogWF1";
const CONFIRM_PROMPT = "confirmprompt";

const { clearCartDialog } = require("./clearCartD");
const { checkOutOrder } = require("./checkoutD");
const { heroCard, menuCard } = require("../Cards/mainCard");

const { connectToDatabase, client } = require("../utils/db");

(async function initialize() {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();
const database = client.db();
const collection = database.collection("menu");

class showOrderMenuDialog extends ComponentDialog {
  constructor(conversationState) {
    super(showMenuDialog);
    if (!conversationState) throw Error("Conversational State Not Found");
    this.conversationState = conversationState;
    this.cartItemsProperty = this.conversationState.createProperty("cartItems");

    this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
    this.addDialog(
      new WaterfallDialog(showMenuDialogWF1, [
        this.displayMenu.bind(this),
        this.handleChoice.bind(this),
        this.promtforMoreItemchoice.bind(this),
        this.handleMoreItemChoice.bind(this),
        this.checkoutCancel.bind(this),
      ])
    );
    this.addDialog(
      new clearCartDialog(conversationState, this.cartItemsProperty)
    );
    this.addDialog(
      new checkOutOrder(conversationState, this.cartItemsProperty)
    );
    this.initialDialogId = showMenuDialogWF1;
  }

  async displayMenu(stepContext) {
    const menuItems = await collection.find().toArray();
    const menuCards = menuItems.map((menuItem) => {
      return CardFactory.adaptiveCard({
        type: "AdaptiveCard",
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.3",
        height: "250px",
        body: [
          {
            type: "Container",
            items: [
              {
                type: "Image",
                url: menuItem.image_url,
                size: "stretch",
              },
              {
                type: "TextBlock",
                text: menuItem.title,
                size: "medium",
                weight: "bolder",
              },
              {
                type: "TextBlock",
                text: menuItem.description,
              },
              {
                type: "TextBlock",
                text: `Price :${menuItem.price}`,
                weight: "bolder",
              },
              {
                type: "Input.Number",
                id: "quantity",
                title: "Quantity",
                placeholder: "Quantity",
                min: 0,
                default: 0,
              },
            ],
          },
        ],
        actions: [
          {
            type: "Action.Submit",
            title: "Add to Cart",
            data: {
              type: "addToCart",
              itemId: menuItem._id,
            },
          },
          {
            type: "Action.Submit",
            title: "Clear Cart",
            data: {
              type: "clearCart",
            },
          },
          {
            type: "Action.Submit",
            title: "Cancel",
            data: {
              type: "cancel",
            },
          },
        ],
      });
    });

    const reply = MessageFactory.carousel(menuCards);

    await stepContext.context.sendActivity(reply);

    return await stepContext.EndofTurn;
  }
  async handleChoice(stepContext) {
    const action = stepContext.context.activity.value.type;
    console.log(stepContext.context.activity);
    switch (action) {
      case "addToCart":
        const objectId = new ObjectId(
          stepContext.context.activity.value.itemId
        );
        const data = await collection.findOne({ _id: objectId });
        if (
          stepContext.context.activity.value.quantity === undefined ||
          stepContext.context.activity.value.quantity === "0"
        ) {
          await stepContext.context.sendActivity(
            "Please add one or more Item."
          );
          return stepContext.replaceDialog(showMenuDialog);
        }
        console.log(data);
        const cartItem = {
          name: data.title,
          quantity: stepContext.context.activity.value.quantity,
          image_url: data.image_url,
          price: data.price,
        };
        const cartItems = await this.cartItemsProperty.get(
          stepContext.context,
          []
        );
        const existingItemIndex = cartItems.findIndex(
          (item) => item.name === cartItem.name
        );
        if (existingItemIndex != -1) {
          console.log(typeof parseInt(cartItems[existingItemIndex].quantity));
          cartItems[existingItemIndex].quantity =
            parseInt(cartItems[existingItemIndex].quantity) +
            parseInt(cartItem.quantity);
          await stepContext.context.sendActivity(
            `You've updated the quantity of "${data.title}" to ${cartItems[existingItemIndex].quantity} in your cart. More deliciousness! 🍔🛒`
          );
        } else {
          cartItems.push(cartItem);
          await stepContext.context.sendActivity(
            `Added ${cartItem.quantity} quantity of ${data.title} to the cart.`
          );
        }
        await this.cartItemsProperty.set(stepContext.context, cartItems);
        console.log("item in cart", cartItems);
        return stepContext.next();
      case "clearCart":
        return await stepContext.beginDialog(clearCart);
      case "cancel":
        return await stepContext.context.sendActivity({
          attachments: [CardFactory.adaptiveCard(heroCard())],
        });
    }
  }
  async promtforMoreItemchoice(stepContext) {
    const promptMessage = "Would you like to add more items to the cart?";
    const retryPromptMessage = "Please answer with 'yes' or 'no'.";
    return stepContext.prompt(CONFIRM_PROMPT, {
      prompt: promptMessage,
      retryPrompt: retryPromptMessage,
    });
  }

  async handleMoreItemChoice(stepContext) {
    const userResponse = stepContext.result;
    console.log(userResponse);
    if (userResponse === true) {
      return stepContext.beginDialog(showMenuDialog);
    } else if (userResponse == false) {
      const cartItems = await this.cartItemsProperty.get(
        stepContext.context,
        []
      );
      if (cartItems.length > 0) {
        const card = CardFactory.adaptiveCard({
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          type: "AdaptiveCard",
          version: "1.3",
          body: [
            {
              type: "Container",
              style: "default",
              items: [
                {
                  type: "TextBlock",
                  text: "Items in Your Cart",
                  size: "large",
                  weight: "bolder",
                },
              ],
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
            {
              type: "TextBlock",
              text: `Total Bill Amount: Rs.${cartItems.reduce(
                (total, item) =>
                  total + parseInt(item.price) * parseInt(item.quantity),
                0
              )}/-`,

              weight: "bolder",
              size: "large",
            },
          ],
          actions: [
            {
              type: "Action.Submit",
              title: "Cancel",
              data: {
                type: "cancelCheckout",
              },
            },
            {
              type: "Action.Submit",
              title: "Checkout",
              data: {
                type: "startCheckout",
                buttonClicked: "checkout",
              },
            },
          ],
        });
        await stepContext.context.sendActivity({
          attachments: [card],
        });
      } else {
        await stepContext.context.sendActivity("Your cart is empty.");
      }
    }
  }
  async checkoutCancel(stepContext) {
    const action = stepContext.context.activity.value.buttonClicked;
    if (action && action === "checkout") {
      return await stepContext.beginDialog(
        checkoutOrder,
        this.cartItemsProperty
      );
    } else {
      return await stepContext.beginDialog(orderFoodDialog);
    }
  }
}

module.exports.showOrderMenuDialog = showOrderMenuDialog;
