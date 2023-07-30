// files
const express = require("express");
const app = express();
require("dotenv").config({ path: "./src/config.env" });

const User = require("./models/UserSchema");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("./Database/databaseConnection");
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
    credentials: true,
  })
  
);

app.use(cookieParser());

app.use(express.json());

const router = require("./Router/router");

app.use(router);

app.listen(process.env.PORT, () => {
  console.log("Listening at port number " + process.env.PORT);
});
