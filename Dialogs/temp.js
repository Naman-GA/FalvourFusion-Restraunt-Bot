const {
  ComponentDialog,
  WaterfallDialog,
  ChoicePrompt,
  ConfirmPrompt,
  NumberPrompt,
  TextPrompt,
  DialogTurnStatus,
} = require("botbuilder-dialogs");
const { orderFood } = require("../constants/Dialogids");
const { CardFactory, MessageFactory } = require("botbuilder");
const {
  connectToMongoDB,
  fetchFoodItemsFromMongoDB,
  saveOrderToMongoDB,
} = require("../database/dbConfig");
const { v4: uuidv4 } = require("uuid"); // Import the UUID library

class OrderFoodDialog extends ComponentDialog {
  constructor(conversationState) {
    super(orderFood);
    this.addDialog(new ChoicePrompt("foodChoicePrompt"));
    this.addDialog(new NumberPrompt("quantityPrompt"));
    this.addDialog(new TextPrompt("showCartPrompt"));
    this.addDialog(new ConfirmPrompt("confirmPrompt"));

    this.addDialog(
      new WaterfallDialog("orderFoodWaterfall", [
        this.initialize.bind(this),
        this.showFoodCarousel.bind(this),
        this.handleFoodSelection.bind(this),
        this.handleQuantityPrompt.bind(this),
        this.handleAddToCart.bind(this),
        this.askAddMoreItems.bind(this),
        this.handleAddMoreItems.bind(this),
        this.showCart.bind(this),
        this.handleOrderActions.bind(this),
      ])
    );

    this.cart = [];
    this.selectedFood = null;
    this.initialDialogId = "orderFoodWaterfall";
    this.conversationState = conversationState;
  }

  async initialize(stepContext) {
    await connectToMongoDB();
    this.foodItems = await fetchFoodItemsFromMongoDB();
    return stepContext.next();
  }

  async showFoodCarousel(stepContext) {
    const foodCards = this.foodItems.map((food, index) => {
      const card = CardFactory.adaptiveCard({
        type: "AdaptiveCard",
        $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
        version: "1.0",
        body: [
          {
            type: "Container",
            items: [
              {
                type: "Image",
                url: food.image,
                size: "Large",
                horizontalAlignment: "Center",
              },
              {
                type: "TextBlock",
                text: food.name,
                size: "Medium",
                weight: "Bolder",
              },
              {
                type: "TextBlock",
                text: food.description,
              },
              {
                type: "TextBlock",
                text: `Price: $${food.price.toFixed(2)}`,
              },
            ],
          },
        ],
        actions: [
          {
            type: "Action.Submit",
            title: "Add to Cart",
            data: {
              action: "add",
              food: food,
            },
          },
          {
            type: "Action.Submit",
            title: "Remove",
            data: {
              action: "remove",
              food: food,
            },
          },
        ],
      });

      return card;
    });

    const reply = MessageFactory.carousel(foodCards);
    await stepContext.context.sendActivity(reply);
    return Dialog.EndOfTurn;
  }

  async handleFoodSelection(stepContext) {
    const selectedAction = stepContext.context.activity.value;
    if (selectedAction.action === "add") {
      this.selectedFood = selectedAction.food;
      return stepContext.prompt("quantityPrompt", "How many do you want?");
    }
    return stepContext.next();
  }

  async handleQuantityPrompt(stepContext) {
    const quantity = stepContext.result;
    this.selectedFood.quantity = quantity;
    return stepContext.next();
  }

  async handleAddToCart(stepContext) {
    if (this.selectedFood) {
      const itemId = uuidv4();
      const existingItemIndex = this.cart.findIndex(
        (item) => item._id === itemId
      );

      if (existingItemIndex !== -1) {
        this.cart[existingItemIndex].quantity += this.selectedFood.quantity;
      } else {
        this.cart.push({
          _id: itemId,
          name: this.selectedFood.name,
          description: this.selectedFood.description,
          price: this.selectedFood.price,
          image: this.selectedFood.image,
          quantity: this.selectedFood.quantity,
        });
      }

      this.selectedFood = null;
    }
    return stepContext.next();
  }

  async askAddMoreItems(stepContext) {
    return stepContext.prompt(
      "confirmPrompt",
      "Do you want to add more items to your cart?"
    );
  }

  async handleAddMoreItems(stepContext) {
    const addToCart = stepContext.result;

    if (addToCart === true) {
      return stepContext.replaceDialog("orderFoodWaterfall");
    } else {
      if (addToCart === false) {
        if (this.cart.length > 0) {
          const totalPrice = this.calculateTotalPrice(this.cart);

          const cardBody = [
            {
              type: "TextBlock",
              text: "Food items in your cart:",
              size: "Medium",
              weight: "Bolder",
            },
            ...this.cart.map((item) => ({
              type: "Container",
              items: [
                {
                  type: "Image",
                  url: item.image,
                  size: "Medium",
                  horizontalAlignment: "Center",
                },
                {
                  type: "TextBlock",
                  text: `${item.name} (Quantity: ${
                    item.quantity
                  }) - $${item.price.toFixed(2)}`,
                  size: "Medium",
                },
              ],
            })),
            {
              type: "TextBlock",
              text: `Total Price: $${totalPrice.toFixed(2)}`,
              size: "Medium",
            },
            {
              type: "TextBlock",
              text: "What would you like to do next?",
              size: "Medium",
            },
          ];

          const cardActions = [
            {
              type: "Action.Submit",
              title: "Place Order",
              data: {
                action: "placeOrder",
              },
            },
            {
              type: "Action.Submit",
              title: "Cancel Order",
              data: {
                action: "cancelOrder",
              },
            },
            {
              type: "Action.Submit",
              title: "Track Order",
              data: {
                action: "trackOrder",
              },
            },
          ];

          const card = CardFactory.adaptiveCard({
            type: "AdaptiveCard",
            $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
            version: "1.0",
            body: cardBody,
            actions: cardActions,
          });

          const reply = MessageFactory.attachment(card);
          await stepContext.context.sendActivity(reply);

          return Dialog.EndOfTurn;
        } else {
          return stepContext.endDialog(
            "Your cart is empty. Please add items to your cart before placing an order."
          );
        }
      } else {
        return stepContext.endDialog(
          "I'm sorry, I couldn't understand your response."
        );
      }
    }
  }

  calculateTotalPrice(cart) {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }
  async showCart(stepContext) {
    let totalPrice = 0;
    const cartItems = this.cart.map((item) => {
      const price = item.price * item.quantity;
      totalPrice += price;
      return {
        name: item.name,
        quantity: item.quantity,
        price: price.toFixed(2),
        image: item.image,
      };
    });

    const cardBody = [
      {
        type: "TextBlock",
        text: "Food items in your cart:",
        size: "Medium",
        weight: "Bolder",
      },
      ...cartItems.map((item) => ({
        type: "Container",
        items: [
          {
            type: "Image",
            url: item.image,
            size: "Medium",
            horizontalAlignment: "Center",
          },
          {
            type: "TextBlock",
            text: `${item.name} (Quantity: ${item.quantity}) - $${item.price}`,
            size: "Medium",
          },
        ],
      })),
      {
        type: "TextBlock",
        text: `Total Price: $${totalPrice.toFixed(2)}`,
        size: "Medium",
      },
      {
        type: "TextBlock",
        text: "What would you like to do next?",
        size: "Medium",
      },
    ];

    const cardActions = [
      {
        type: "Action.Submit",
        title: "Place Order",
        data: {
          action: "placeOrder",
        },
      },
      {
        type: "Action.Submit",
        title: "Cancel Order",
        data: {
          action: "cancelOrder",
        },
      },
      {
        type: "Action.Submit",
        title: "Track Order",
        data: {
          action: "trackOrder",
        },
      },
    ];

    const card = CardFactory.adaptiveCard({
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.0",
      body: cardBody,
      actions: cardActions,
    });

    const reply = MessageFactory.attachment(card);
    await stepContext.context.sendActivity(reply);

    return stepContext.next();
  }

  async handleOrderActions(stepContext) {
    console.log("handle order actions", stepContext.context.activity);
    const activityValue = stepContext.context.activity.value;

    if (!activityValue || !activityValue.action) {
      return stepContext.endDialog(
        "I'm sorry, I couldn't understand your request."
      );
    }

    const action = activityValue.action;

    if (action === "placeOrder") {
      if (this.cart.length === 0) {
        return stepContext.endDialog(
          "Your cart is empty. Please add items to your cart before placing an order."
        );
      }

      let totalPrice = 0;
      const formattedCart = this.cart.map((item) => {
        const price = item.price * item.quantity;
        totalPrice += price;
        return {
          name: item.name,
          quantity: item.quantity,
          price: price.toFixed(2),
          image: item.image,
        };
      });

      try {
        await saveOrderToMongoDB(formattedCart);
        this.cart = [];

        const confirmationCard = CardFactory.adaptiveCard({
          type: "AdaptiveCard",
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          version: "1.0",
          body: [
            {
              type: "TextBlock",
              text: "Your order has been placed successfully!",
              size: "Medium",
              weight: "Bolder",
            },
          ],
        });

        const confirmationReply = MessageFactory.attachment(confirmationCard);
        await stepContext.context.sendActivity(confirmationReply);

        return stepContext.endDialog();
      } catch (error) {
        console.error("Error saving order to the database:", error);
        return stepContext.endDialog(
          "There was an issue placing your order. Please try again later."
        );
      }
    } else if (action === "cancelOrder") {
      this.cart = [];
      return stepContext.endDialog("Your order has been canceled.");
    } else if (action === "trackOrder") {
      if (this.cart.length === 0) {
        return stepContext.endDialog(
          "Your cart is empty. Please add items to your cart before tracking an order."
        );
      }
      await stepContext.context.sendActivity(
        "Here are the items in your cart for tracking:"
      );
      for (const item of this.cart) {
        const message = `${item.name} (Quantity: ${item.quantity}) - $${(
          item.price * item.quantity
        ).toFixed(2)}`;
        await stepContext.context.sendActivity(message);
      }
      return stepContext.endDialog();
    } else {
      return stepContext.endDialog(
        "I'm sorry, I couldn't understand your request."
      );
    }
  }
}

module.exports.OrderFoodDialog = OrderFoodDialog;
