const mongoose = require("mongoose");
const { MongoClient } = require("mongodb");

const mongoURI =
  "mongodb+srv://ngarg:Naman@cluster0.4uy4zu5.mongodb.net/?retryWrites=true&w=majority";
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(mongoURI, mongooseOptions)
  .then(() => console.log("Connected to MongoDB using Mongoose"))
  .catch((error) => console.error("Mongoose Connection Error:", error));

const client = new MongoClient(mongoURI, mongooseOptions);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB using MongoDB Native Driver");
  } catch (error) {
    console.error("MongoDB Native Driver Connection Error:", error);
  }
}

module.exports = {
  mongoose,
  connectToDatabase,
  client,
};
