"use strict";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import util from "util";
import appConfig from "./config/appConfig";
import networks from "./router/networks";
import sts from "./router/sts";
import logger from "morgan";

// global.__basedir = __dirname;

const app = express();
const PORT = appConfig._api_port;

app.use(cors());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// const { ApolloServer } = require("apollo-server-express");

app.get("/", (req, res) => {
    res.send("Hello World");
});
app.use("/api/networks", networks);
app.use("/api/security", sts);
app.listen(PORT, (req, res) => console.log(`Server is listening at ${PORT}`));
