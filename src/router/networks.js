import path from "path";
import fs from "fs";
import express from "express";
import AWS from "../lib/awsConn";
import appConfig from "../config/appConfig";

const networks = express.Router();

const EC2 = new AWS.EC2({ apiVersion: appConfig._aws_api_version });

// const dataPath = __basedir + path.sep + "data";

/**
 * Fetch all VPCs
 */
const getAllVpcs = async () => {
    const params = {
        DryRun: false,
    };
    try {
        const { Vpcs: data } = await EC2.describeVpcs(params).promise();
        if (data.length > 0) {
            let vpcList = [];
            for (const {
                VpcId,
                Tags,
                CidrBlock,
                InstanceTenancy,
                DhcpOptionsId,
                State,
            } of data) {
                let item = {};
                item["Id"] = VpcId;
                item["CidrBlock"] = CidrBlock;
                item["Tenancy"] = InstanceTenancy;
                item["DhcpOptionsId"] = DhcpOptionsId;
                item["State"] = State;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] =
                    Tags[index] != null ? Tags[index]["Value"] : null;
                vpcList.push(item);
            }
            return vpcList;
        } else return "0 VPCs";
    } catch (err) {
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};
/**
 * Fetch VPC
 */
const getVpc = async (vpcID) => {
    const params = {
        DryRun: false,
        // VpcIds: [vpcID] || null,
        VpcIds: [vpcID],
    };
    try {
        const { Vpcs: data } = await EC2.describeVpcs(params).promise();
        if (data.length > 0) {
            let vpc = [];
            for (const {
                VpcId,
                Tags,
                CidrBlock,
                InstanceTenancy,
                DhcpOptionsId,
                State,
            } of data) {
                let item = {};
                item["Id"] = VpcId;
                item["CidrBlock"] = CidrBlock;
                item["Tenancy"] = InstanceTenancy;
                item["DhcpOptionsId"] = DhcpOptionsId;
                item["State"] = State;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] =
                    Tags[index] != null ? Tags[index]["Value"] : null;
                vpc.push(item);
            }
            return vpc;
        } else return "0 VPCs";
    } catch (err) {
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};
/**
 * Fetch Subnets
 */
const getSubnet = async (vpcID) => {
    const params = {
        DryRun: false,
        Filters: [
            {
                Name: "vpc-id",
                Values: [vpcID],
            },
        ],
    };
    try {
        const { Subnets: data } = await EC2.describeSubnets(params).promise();
        if (data.length > 0) {
            let subnetList = [];
            for (const {
                SubnetId,
                Tags,
                AvailabilityZone,
                CidrBlock,
                State,
                AvailableIpAddressCount,
                MapPublicIpOnLaunch,
            } of data) {
                let item = {};
                item["Id"] = SubnetId;
                item["AZ"] = AvailabilityZone;
                item["CidrBlock"] = CidrBlock;
                item["State"] = State;
                item["AvailableIP"] = AvailableIpAddressCount;
                item["MapPublicIpOnLaunch"] = MapPublicIpOnLaunch;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] =
                    Tags[index] != null ? Tags[index]["value"] : null;
                subnetList.push(item);
            }
            return subnetList;
        } else return "0 Subnets";
    } catch (err) {
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};
/**
 * Fetch Route Tables
 */
const getRouteTable = async (vpcID) => {
    const params = {
        DryRun: false,
        Filters: [
            {
                Name: "vpc-id",
                Values: [vpcID],
            },
        ],
    };
    try {
        let { RouteTables: data } = await EC2.describeRouteTables(
            params
        ).promise();
        if (data.length > 0) {
            // write something
            return data;
        } else return "0 Route Tables";
    } catch (err) {
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};
/**
 * Fetch Internet Gateway
 */
const getInternetGateway = async (vpcID) => {
    const params = {
        DryRun: false,
        Filters: [
            {
                Name: "attachment.vpc-id",
                Values: [vpcID],
            },
        ],
    };
    try {
        let { InternetGateways: data } = await EC2.describeInternetGateways(
            params
        ).promise();
        if (data.length > 0) {
            let igwList = [];
            for (const { InternetGatewayId, Tags, Attachments } of data) {
                let item = {};
                item["Id"] = InternetGatewayId;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] =
                    Tags[index] != null ? Tags[index]["Value"] : null;
                let [{ State }] = Attachments;
                item["State"] = State;
                igwList.push(item);
            }
            return igwList;
        } else return "0 Internet Gateways";
    } catch (err) {
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};
/**
 * Fetch Network ACLs
 */
const getNetworkAcl = async (vpcId) => {
    const params = {
        DryRun: false,
        Filters: [{ Name: "vpc-id", Values: [vpcId] || null }],
    };
    try {
        let { NetworkAcls: data } = await EC2.describeNetworkAcls(
            params
        ).promise();
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
/**
 * Fetch NAT Gateway
 */
const getNatGateway = async (vpcID) => {
    const params = {
        DryRun: false,
        Filters: [
            {
                Name: "vpc-id",
                Values: [vpcID],
            },
        ],
    };
    try {
        let data = await EC2.describeNatGateways(params).promise();
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

networks.get("/vpc/all", async (req, res) => {
    try {
        const data = await getAllVpcs();
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});

//sample --> delete later
networks.get("/vpc:vpcId", async (req, res) => {
    try {
        const data = await getVpc(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});

networks.get("/subnet:vpcId", async (req, res) => {
    try {
        const data = await getSubnet(req.query.vpcId);
        res.status(200).send(data);
        console.log("I'm in subnet API call");
    } catch (err) {
        res.send(err);
    }
});

networks.get("/igw:vpcId", async (req, res) => {
    try {
        const data = await getInternetGateway(req.query.vpcId);
        res.status(200).send(data);
        console.log("I'm in IGW API call");
    } catch (err) {
        res.send(err);
    }
});

export default networks;
// module.exports = router;

