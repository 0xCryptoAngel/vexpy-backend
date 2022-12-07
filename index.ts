import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import dbConfig from "./src/db/dbConfig";
const cors = require("cors");
const app = express();

///enabled CORS
app.use(cors());

///node body parse middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

///Port configuration
const PORT = process.env.PORT ?? 80;

/// Database connect
dbConfig();

app.get("/", (req, res) => {
  res.send("Well done!");
});

app.listen(PORT, () => {
  console.log(`Tasks server listening at http://localhost:${PORT}`);
});

const router = require("./routes")();
app.use("/api", router);
