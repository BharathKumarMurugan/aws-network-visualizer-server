import path from "path";
import fs from "fs";
import express from "express";
import AWS from "../lib/awsConn";
import appConfig from "../config/appConfig";

const networks = express.Router();

const EC2 = new AWS.EC2({ apiVersion: appConfig._aws_ec2_api_version });
var RDS = new AWS.RDS({ apiVersion: appConfig._aws_rds_api_version });
var ELBv2 = new AWS.ELBv2({ apiVersion: appConfig._aws_elbv2_api_version });

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
                item["State"] = State;
                item["Id"] = VpcId;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] =
                    Tags[index] != null ? Tags[index]["Value"] : null;
                item["CidrBlock"] = CidrBlock;
                item["Tenancy"] = InstanceTenancy;
                item["DhcpOptionsId"] = DhcpOptionsId;

                vpcList.push(item);
            }
            return vpcList;
        } else return [];
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
                item["State"] = State;
                item["Id"] = VpcId;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] =
                    Tags[index] != null ? Tags[index]["Value"] : null;
                item["CidrBlock"] = CidrBlock;
                item["Tenancy"] = InstanceTenancy;
                item["DhcpOptionsId"] = DhcpOptionsId;

                vpcList.push(item);
            }
            return vpcList;
        } else return [];
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
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] =
                    Tags[index] != null ? Tags[index]["Value"] : null;
                item["AZ"] = AvailabilityZone;
                item["CidrBlock"] = CidrBlock;
                item["State"] = State;
                item["AvailableIP"] = AvailableIpAddressCount;
                item["MapPublicIpOnLaunch"] = MapPublicIpOnLaunch;
                subnetList.push(item);
            }
            return subnetList;
        } else return [];
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
const getRouteTables = async (vpcID) => {
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
            let rtList = [];
            for (const { RouteTableId, Tags, Routes, Associations } of data) {
                let item = {};
                item["Id"] = RouteTableId;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] =
                    Tags[index] != null ? Tags[index]["Value"] : null;
                const routesDestination = () => {
                    return Routes.map((r) =>
                        r["DestinationCidrBlock"]
                            ? r["DestinationCidrBlock"]
                            : r["DestinationPrefixListId"]
                    );
                };
                const routesTarget = () => {
                    return Routes.map((r) => {
                        if ("VpcPeeringConnectionId" in r)
                            return r["VpcPeeringConnectionId"];
                        if ("GatewayId" in r) return r["GatewayId"];
                        if ("NatGatewayId" in r) return r["NatGatewayId"];
                        if ("TransitGatewayId" in r)
                            return r["TransitGatewayId"];
                        else return null;
                    });
                };
                const routesStatus = () => {
                    return Routes.map((r) => r["State"]);
                };
                const asscSubnet = () =>
                    Associations.map((assc) =>
                        assc["SubnetId"] ? assc["SubnetId"] : ""
                    );
                item["SubnetAssociation"] = asscSubnet();
                item["Main"] = Associations[0]["Main"] ? "Yes" : "No";
                item["RoutesDestination"] = routesDestination();
                item["RoutesTarget"] = routesTarget();
                item["RoutesState"] = routesStatus();
                rtList.push(item);
            }
            // write something
            return rtList;
        } else return [];
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
                let [{ State }] = Attachments;
                item["State"] = State;
                item["Id"] = InternetGatewayId;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] =
                    Tags[index] != null ? Tags[index]["Value"] : null;

                igwList.push(item);
            }
            return igwList;
        } else return [];
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
 * Fetch All Security Groups
 */
const getAllSecurityGroups = async (vpcId) => {
    const params = {
        DryRun: false,
        Filters: [{ Name: "vpc-id", Values: [vpcId] }],
    };
    try {
        let { SecurityGroups: data } = await EC2.describeSecurityGroups(
            params
        ).promise();
        if (data.length > 0) {
            let securityGroups = [];
            for (const {
                GroupId,
                GroupName,
                Description,
                IpPermissions,
                IpPermissionsEgress,
            } of data) {
                let item = {};
                item["Id"] = GroupId;
                item["Name"] = GroupName;
                item["Description"] = Description;

                // console.log(sgIngress());
                // item["Inbound"] = sgIngress();
                // item["Outbound"] = sgEgress();
                securityGroups.push(item);
            }
            return securityGroups;
        } else return [];
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
 * Fetch specific Security Group
 */
const getSecurityGroup = async (securityGroupId) => {
    const params = {
        DryRun: false,
        Filters: [{ Name: "group-id", Values: [securityGroupId] || null }],
    };
    try {
        let { SecurityGroups: data } = await EC2.describeSecurityGroups(
            params
        ).promise();
        // console.log(JSON.stringify(data));
        if (data.length > 0) {
            let securityGroup = [];
            for (const { IpPermissions, IpPermissionsEgress } of data) {
                let item = {};
                const sgIngressSourceCIDR = () => {
                    for (const [IpRanges] of IpPermissions) {
                        return IpRanges.map((sg) => sg["CidrIp"]);
                    }
                };
                const sgEgressDestCIDR = () => {
                    for (const { IpRanges } of IpPermissionsEgress) {
                        return IpRanges.map((sg) => sg["CidrIp"]);
                    }
                };
                const sgIngressProtocol = () => {
                    return IpPermissions.map((sg) =>
                        sg["IpProtocol"] === "-1"
                            ? "All Traffic"
                            : sg["IpProtocol"]
                    );
                };
                const sgEgressProtocol = () => {
                    return IpPermissionsEgress.map((sg) =>
                        sg["IpProtocol"] === "-1"
                            ? "All Traffic"
                            : sg["IpProtocol"]
                    );
                };
                item["IngressProtocol"] = sgIngressProtocol();
                item["IngressCIDR"] = sgIngressSourceCIDR();
                item["EgressProtocol"] = sgEgressProtocol();
                item["EgressCIDR"] = sgEgressDestCIDR();
                securityGroup.push(item);
            }
            // console.log(securityGroup);
            return securityGroup;
        } else return [];
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
        Filter: [
            {
                Name: "vpc-id",
                Values: [vpcID],
            },
        ],
    };
    try {
        let { NatGateways: data } = await EC2.describeNatGateways(
            params
        ).promise();
        if (data.length > 0) {
            let natList = [];
            for (const {
                NatGatewayId,
                State,
                SubnetId,
                NatGatewayAddresses,
                Tags,
            } of data) {
                let item = {};
                item["State"] = State;
                item["Id"] = NatGatewayId;
                const index = Tags.findIndex((tag) => tag["Key" === "Name"]);
                item["Name"] =
                    Tags[index] != null ? Tags[index]["Value"] : null;
                const natAllocPubIP = () => {
                    return NatGatewayAddresses.map((nat) => nat["PublicIp"]);
                };
                const natAllocPvtIP = () => {
                    return NatGatewayAddresses.map((nat) => nat["PrivateIp"]);
                };
                item["PublicIP"] = natAllocPubIP();
                item["PrivateIP"] = natAllocPvtIP();
                item["SubnetId"] = SubnetId;

                natList.push(item);
            }
            return natList;
        } else return [];
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
 * Fetch NACL of specific VPC
 */
const getNetworkACLs = async (vpcID) => {
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
        const { NetworkAcls: data } = await EC2.describeNetworkAcls(
            params
        ).promise();
        if (data.length > 0) {
            let networkAcls = [];
            for (const {
                NetworkAclId,
                Tags,
                Associations,
                Entries,
                IsDefault,
            } of data) {
                let item = {};
                item["Id"] = NetworkAclId;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] = Tags[index] ? Tags[index]["Value"] : null;
                const naclSubnets = () => {
                    return Associations.map((nacl) => nacl["SubnetId"]);
                };
                item["Subnets"] = naclSubnets();
                item["Default"] = IsDefault;
                const countEgress = () => {
                    let count = 0;
                    return Entries.forEach((nacl, index) => {
                        if (nacl["Egress"]) return count + index;
                    });
                };
                const countIngress = () => {
                    let count = 0;
                    return Entries.forEach((nacl, index) => {
                        if (!nacl["Egress"]) return count + index;
                    });
                };
                item["EgressCount"] = countEgress();
                item["IngressCount"] = countIngress();
                // console.log(item);
                networkAcls.push(item);
            }
            return networkAcls;
        } else return [];
    } catch (err) {
        console.error(err);
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};
/**
 * Fetch All Instances of a VPC
 */
const getAllComputeInstances = async (vpcID) => {
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
        let { Reservations: data } = await EC2.describeInstances(
            params
        ).promise();
        if (data.length > 0) {
            let instnaceList = [];
            for (const { Instances } of data) {
                for (const {
                    InstanceId,
                    Tags,
                    PrivateIpAddress,
                    PublicIpAddress,
                    State,
                    SubnetId,
                } of Instances) {
                    let item = {};
                    item["State"] = State["Name"];
                    item["Id"] = InstanceId;
                    const index = Tags.findIndex(
                        (tag) => tag["Key"] === "Name"
                    );
                    item["Name"] = Tags[index] ? Tags[index]["Value"] : null;
                    item["PrivateIpAddress"] = PrivateIpAddress;
                    item["PublicIpAddress"] = PublicIpAddress
                        ? PublicIpAddress
                        : null;
                    item["SubnetId"] = SubnetId;

                    instnaceList.push(item);
                }
            }
            return instnaceList;
        } else return [];
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
 * Fetch VPC Peering Connections
 */
const getVpcPeeringConnection = async (vpcID) => {
    const params = {
        DryRun: false,
    };
    try {
        let {
            VpcPeeringConnections: data,
        } = await EC2.describeVpcPeeringConnections(params).promise();
        let vpcPeeringList = [];
        for (const {
            VpcPeeringConnectionId,
            Tags,
            Status,
            AccepterVpcInfo,
            RequesterVpcInfo,
        } of data) {
            let item = {};
            item["Id"] = VpcPeeringConnectionId;
            const index = Tags.findIndex((tag) => tag["Key"] === "Name");
            item["Name"] = Tags[index] ? Tags[index]["Value"] : "";
            item["AccepterVPC"] = AccepterVpcInfo["VpcId"];
            item["RequesterVPC"] = RequesterVpcInfo["VpcId"];
            item["Status"] = Status["Code"];
            if (
                AccepterVpcInfo["VpcId"] === vpcID ||
                RequesterVpcInfo["VpcId"] === vpcID
            ) {
                vpcPeeringList.push(item);
            }
        }
        // console.log("vpc peer list: ", vpcPeeringList);
        return vpcPeeringList;
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
 * Fetch All VPC Peering Connections
 */
const getAllVpcPeeringConnection = async (vpcID) => {
    const params = {
        DryRun: false,
    };
    try {
        let {
            VpcPeeringConnections: data,
        } = await EC2.describeVpcPeeringConnections(params).promise();
        let vpcPeeringList = [];
        for (const {
            VpcPeeringConnectionId,
            Tags,
            Status,
            AccepterVpcInfo,
            RequesterVpcInfo,
        } of data) {
            let item = {};
            item["Status"] = Status["Code"];
            item["Id"] = VpcPeeringConnectionId;
            const index = Tags.findIndex((tag) => tag["Key"] === "Name");
            item["Name"] = Tags[index] ? Tags[index]["Value"] : "";
            const requesterCIDRs = () => {
                return RequesterVpcInfo["CidrBlockSet"].map((req) => {
                    return req["CidrBlock"];
                });
            };
            const accepterCIDRs = () => {
                return AccepterVpcInfo["CidrBlockSet"].map((req) => {
                    return req["CidrBlock"];
                });
            };
            item[
                "RequesterVPC"
            ] = `${RequesterVpcInfo["VpcId"]} (${RequesterVpcInfo["Region"]})`;
            item["RequesterCIDR"] = requesterCIDRs();
            item["Requester"] = RequesterVpcInfo["OwnerId"];
            item[
                "AccepterVPC"
            ] = `${AccepterVpcInfo["VpcId"]} (${AccepterVpcInfo["Region"]})`;
            item["AccepterCIDR"] = accepterCIDRs();
            item["Accepter"] = AccepterVpcInfo["OwnerId"];
            vpcPeeringList.push(item);
        }
        return vpcPeeringList;
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
 * Fetch all RDS within a VPC
 */
const getAllRDSInstances = async (vpc_ID) => {
    const params = {};
    try {
        let { DBInstances: data } = await RDS.describeDBInstances(
            params
        ).promise();
        // console.log(data);
        let rdsList = [];
        if (data.length > 0) {
            for (const {
                DBInstanceIdentifier,
                Engine,
                DBInstanceStatus,
                DBSubnetGroup,
            } of data) {
                // console.log("I'm inside FOR");
                let item = {};
                // console.log("VPC: ", VpcId);

                // console.log("I'm inside IF");
                if (DBSubnetGroup !== undefined || DBSubnetGroup !== null) {
                    item["Name"] = DBInstanceIdentifier;
                    item["Engine"] = Engine;
                    item["Status"] = DBInstanceStatus;
                    item["VpcID"] = DBSubnetGroup;
                    rdsList.push(item);
                }

                // console.log("rds list: ", rdsList);
            }
            // console.log("rds inside: ", rdsList);
        }
        // console.log("rds outside: ", rdsList);
        return rdsList.length > 0 ? rdsList : [];
    } catch (err) {
        console.error(err);
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};
/**
 * Fetch Load Balancers
 */
const getAllLoadBalancers = async () => {
    const params = {};
    try {
        let { LoadBalancers: data } = await ELBv2.describeLoadBalancers(
            params
        ).promise();
        if (data.length > 0) {
            let loadBalancers = [];
            for (const {
                DNSName,
                CanonicalHostedZoneId,
                LoadBalancerName,
                Scheme,
                VpcId,
                State: { Code },
                Type,
                AvailabilityZones,
                SecurityGroups,
                IpAddressType,
            } of data) {
                let item = {};
                item["State"] = Code;
                item["Name"] = LoadBalancerName;
                item["Type"] = Type;
                item["Scheme"] = Scheme;
                item["DNS"] = DNSName;
                item["VPC"] = VpcId;
                const lbAZName = () => {
                    return AvailabilityZones.map((lb) => lb["ZoneName"]);
                };
                const lbAZSubnet = () => {
                    return AvailabilityZones.map((lb) => lb["SubnetId"]);
                };
                item["AZs"] = lbAZName();
                item["Subnets"] = lbAZSubnet();
                item["SecurityGroups"] = SecurityGroups;
                item["IPType"] = IpAddressType;

                loadBalancers.push(item);
            }
            return loadBalancers;
        } else return [];
    } catch (err) {
        console.error(err);
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};
/**
 * Fetch All Transit Gateway
 */
const getAllTransitGateways = async () => {
    const params = {};
    try {
        let { TransitGateways: data } = await EC2.describeTransitGateways(
            params
        ).promise();
        if (data.length > 0) {
            let transitGateways = [];
            for (const {
                TransitGatewayId,
                State,
                Tags,
                Options: { TransitGatewayCidrBlocks },
                Options: { DnsSupport },
            } of data) {
                let item = {};
                item["State"] = State;
                item["Id"] = TransitGatewayId;
                const index = Tags.findIndex((tag) => tag["Key"] === "Name");
                item["Name"] = Tags[index] ? Tags[index]["Value"] : "";
                item["TransitGatewayCIDR"] = TransitGatewayCidrBlocks;
                item["DnsSupport"] = DnsSupport;
                transitGateways.push(item);
            }
            return transitGateways;
        } else return [];
    } catch (err) {
        console.error(err);
        return {
            requestID: err.requestId,
            statusCode: err.statusCode,
            message: err.code,
            time: err.time,
        };
    }
};
/**
 * Fetch All VPN Connections
 */
const getAllVPNConnections = async () => {
    const params = {
        DryRun: false,
    };
    let { VpnConnections: data } = await EC2.describeVpnConnections(
        params
    ).promise();
    if (data.length > 0) {
        let vpnList = [];
        for (const {
            VpnConnectionId,
            VpnGatewayId,
            Category,
            Type,
            CustomerGatewayId,
            TransitGatewayId,
            State,
            Tags,
            Routes,
        } of data) {
            let item = {};
            item["State"] = State;
            item["Id"] = VpnConnectionId;
            const index = Tags.findIndex((tag) => tag["Key"] === "Name");
            item["Name"] = Tags[index] ? Tags[index]["Value"] : "";
            item["Type"] = Type;
            item["Category"] = Category;
            item["VpnGateway"] = VpnGatewayId ? VpnGatewayId : "";
            item["CustomerGateway"] = CustomerGatewayId
                ? CustomerGatewayId
                : "";
            item["TransitGateway"] = TransitGatewayId ? TransitGatewayId : "";
            const routesCIDR = () => {
                return Routes.map((r) => {
                    return `${r["DestinationCidrBlock"]}, ${r["Source"]}, ${r["State"]}`;
                });
            };
            item["Routes"] = routesCIDR();
            vpnList.push(item);
        }
        return vpnList;
    } else return [];
};
networks.get("/vpc/all", async (req, res) => {
    try {
        const data = await getAllVpcs();
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});

networks.get("/vpc:vpcId?", async (req, res) => {
    try {
        const data = await Promise.all([
            getVpc(req.query.vpcId),
            getInternetGateway(req.query.vpcId),
            getSubnet(req.query.vpcId),
            getRouteTables(req.query.vpcId),
            getAllSecurityGroups(req.query.vpcId),
            getNatGateway(req.query.vpcId),
            getAllComputeInstances(req.query.vpcId),
            getVpcPeeringConnection(req.query.vpcId),
        ]);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/elb/all", async (req, res) => {
    try {
        const data = await getAllLoadBalancers();
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/transit/all", async (req, res) => {
    try {
        const data = await getAllTransitGateways();
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/peer/all", async (req, res) => {
    try {
        const data = await getAllVpcPeeringConnection();
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/rds:vpcId?", async (req, res) => {
    try {
        // const data = await getAllSecurityGroups(req.query.vpcId);
        const data = await getAllRDSInstances(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/nacl:vpcId?", async (req, res) => {
    try {
        // const data = await getAllSecurityGroups(req.query.vpcId);
        const data = await getNetworkACLs(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/vpn/all", async (req, res) => {
    try {
        // const data = await getAllSecurityGroups(req.query.vpcId);
        const data = await getAllVPNConnections();
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
/*
networks.get("/ec2:vpcId?", async (req, res) => {
    try {
        const data = await getAllComputeInstances(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/peer:vpcId?", async (req, res) => {
    try {
        const data = await getVpcPeeringConnection(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});

networks.get("/subnet:vpcId?", async (req, res) => {
    try {
        const data = await getSubnet(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});

networks.get("/igw:vpcId?", async (req, res) => {
    try {
        const data = await getInternetGateway(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/rds:vpcId?", async (req, res) => {
    try {
        // const data = await getAllSecurityGroups(req.query.vpcId);
        const data = await getAllRDSInstances(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/rt:vpcId?", async (req, res) => {
    // console.log("I'm in RT");
    try {
        const data = await getRouteTables(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/nat:vpcId?", async (req, res) => {
    // console.log("I'm in NAT");
    try {
        const data = await getNatGateway(req.query.vpcId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
networks.get("/sg:sgId?", async (req, res) => {
    try {
        const data = await getSecurityGroups(req.query.sgId);
        res.status(200).send(data);
    } catch (err) {
        res.send(err);
    }
});
*/

export default networks;
// module.exports = router;
