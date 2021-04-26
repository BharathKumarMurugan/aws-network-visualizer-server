import express from "express";
import AWS from "../lib/awsConn";
import appConfig from "../config/appConfig";

const sts = express.Router();

const client = new AWS.STS({ apiVersion: appConfig._aws_sts_api_version});

const getAccountId = async () => {
    const params = {};
    try {
        let { Account: data } = await client
            .getCallerIdentity(params)
            .promise();
        return data;
    } catch (err) {
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};

sts.get("/", async (req, res) => {
    try {
        let data = [];
        data[0] = await getAccountId();
        data[1] = appConfig._aws_region.toString();
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});

export default sts;
