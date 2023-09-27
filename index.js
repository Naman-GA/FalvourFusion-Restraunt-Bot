const express = require("express");
const routes = require("./routes/route");

const app = express();
app.use(express.json());

app.use("/api/", routes);

const server = app.listen(3000, () => {
  console.log(`Server listening on port :- ${server.address().port}`);
});
