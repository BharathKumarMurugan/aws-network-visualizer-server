const appConfig = {};

appConfig._aws_profile = "default";
appConfig._api_port = process.env.API_PORT || 5000;
appConfig._aws_region = "eu-west-1";
appConfig._aws_ec2_api_version = "2016-11-15";
appConfig._aws_rds_api_version = "2014-10-31";
appConfig._aws_sts_api_version = "2011-06-15";
appConfig._aws_elbv2_api_version = "2015-12-01";

export default appConfig;
