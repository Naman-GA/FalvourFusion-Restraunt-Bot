module.exports = {
  heroCard: () => {
    return {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.3",
      body: [
        {
          type: "Image",
          url: "https://i.ibb.co/9vVF5xr/maincard-Image.png",
          //   size: "Large",
          width: "strech", // Use "stretch" to make it large in width
          height: "auto",
        },
        {
          type: "TextBlock",
          text: "Welcome to FlavorFusion! 😃",
          size: "Large",
          weight: "Bolder",
          wrap: true,
        },
        {
          type: "TextBlock",
          text: "How can we assist you today?",
          size: "Medium",
          wrap: true,
          separator: true,
        },
        {
          type: "ColumnSet",
          columns: [
            {
              type: "Column",
              width: "stretch",
              items: [
                {
                  type: "TextBlock",
                  text: "Order Food",
                  weight: "Bolder",
                  wrap: true,
                },
                {
                  type: "TextBlock",
                  text: "You can browse our menu, view your cart, place an order, cancel an order, or track your orders.",
                  wrap: true,
                },
                {
                  type: "ActionSet",
                  actions: [
                    {
                      type: "Action.Submit",
                      title: "Order Food",
                      data: {
                        action: "orderFood",
                      },
                    },
                  ],
                },
              ],
              spacing: "Large",
            },
            {
              type: "Column",
              width: "stretch",
              items: [
                {
                  type: "TextBlock",
                  text: "Table Reservation",
                  weight: "Bolder",
                  wrap: true,
                },
                {
                  type: "TextBlock",
                  text: "You can book a table, cancel a reservation, or view/track your reservations.",
                  wrap: true,
                },
                {
                  type: "ActionSet",
                  actions: [
                    {
                      type: "Action.Submit",
                      title: "Table Reservation",
                      data: {
                        action: "tableReservation",
                      },
                    },
                  ],
                },
              ],
              spacing: "Large",
            },
          ],
        },
      ],
    };
  },
  orderCard: () => {
    return {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.3",
      body: [
        {
          type: "TextBlock",
          text: "Welcome to FlavorFusion",
          size: "Large",
          weight: "Bolder",
          color: "Accent",
          wrap: true,
        },
        {
          type: "TextBlock",
          text: "How can we assist you today?",
          size: "Medium",
          wrap: true,
          separator: true,
        },
        {
          type: "ColumnSet",
          columns: [
            {
              type: "Column",
              width: "stretch",
              items: [
                {
                  type: "Image",
                  url: "https://i.ibb.co/9vVF5xr/maincard-Image.png",
                  width: "400px",
                  height: "230px",
                },
              ],
              separator: true,
            },
            {
              type: "Column",
              width: "stretch",
              items: [
                {
                  type: "TextBlock",
                  text: "Order Food",
                  weight: "Bolder",
                  wrap: true,
                },
                {
                  type: "TextBlock",
                  text: "Browse our menu, view your cart, place an order, cancel an order, or track your orders.",
                  wrap: true,
                },
                {
                  type: "ActionSet",
                  actions: [
                    {
                      type: "Action.Submit",
                      title: "Browse Menu",
                      data: {
                        action: "browseMenu",
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
                      title: "View/Track Orders",
                      data: {
                        action: "viewOrder",
                      },
                    },
                  ],
                },
              ],
              separator: true,
            },
          ],
        },
      ],
    };
  },
  reservationCard: () => {
    return {
      type: "AdaptiveCard",
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      version: "1.3",
      body: [
        {
          type: "TextBlock",
          text: "Welcome to FlavorFusion",
          size: "Large",
          weight: "Bolder",
          color: "Accent",
          wrap: true,
        },
        {
          type: "TextBlock",
          text: "How can we assist you today?",
          size: "Medium",
          wrap: true,
          separator: true,
        },
        {
          type: "ColumnSet",
          columns: [
            {
              type: "Column",
              width: "stretch",
              items: [
                {
                  type: "Image",
                  url: "https://i.ibb.co/9vVF5xr/maincard-Image.png",
                  width: "400px",
                  height: "230px",
                },
              ],
              separator: true,
            },
            {
              type: "Column",
              width: "stretch",
              items: [
                {
                  type: "TextBlock",
                  text: "Reservations",
                  weight: "Bolder",
                  wrap: true,
                },
                {
                  type: "TextBlock",
                  text: "You can book a table, cancel a reservation, or view/track your reservations.",
                  wrap: true,
                },
                {
                  type: "ActionSet",
                  actions: [
                    {
                      type: "Action.Submit",
                      title: "Make a Reservation",
                      data: {
                        action: "bookTable",
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "Cancel Reservation",
                      data: {
                        action: "cancelTable",
                      },
                    },
                    {
                      type: "Action.Submit",
                      title: "View/Track Reservations",
                      data: {
                        action: "viewTable",
                      },
                    },
                  ],
                },
              ],
              separator: true,
            },
          ],
        },
      ],
    };
  },
  menuCard: (menuItem) => {
    return {
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
              text: menuItem.name,
              size: "medium",
              weight: "bolder",
            },
            {
              type: "TextBlock",
              text: menuItem.description,
            },
            {
              type: "Input.Number",
              id: "quantity",
              title: "Quantity",
              placeholder: "Quantity",
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
    };
  },
};
