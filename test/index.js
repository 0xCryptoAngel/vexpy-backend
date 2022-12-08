"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dbConfig_1 = __importDefault(require("./src/db/dbConfig"));
const cors = require("cors");
const app = (0, express_1.default)();
///enabled CORS
app.use(cors());
///node body parse middleware
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
///Port configuration
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 80;
/// Database connect
(0, dbConfig_1.default)();
/// connect router
const router = require("./src/routes")();
app.use("/api", router);
app.get("/", (req, res) => {
    res.send("Well done!");
});
app.listen(PORT, () => {
    console.log(`Tasks server listening at http://localhost:${PORT}`);
});
