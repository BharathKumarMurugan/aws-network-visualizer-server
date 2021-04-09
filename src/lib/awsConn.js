"use strict";
import AWS from "aws-sdk";
import appConfig from "../config/appConfig";

const credentials = new AWS.SharedIniFileCredentials({
    profile: appConfig._aws_profile,
});
AWS.config.credentials = credentials;
AWS.config.update({ region: appConfig._aws_region });

export default AWS;
// module.exports = AWS;

