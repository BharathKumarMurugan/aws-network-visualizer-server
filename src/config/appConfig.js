const appConfig = {};

appConfig._aws_profile = "fs-devops";
appConfig._api_port = process.env.API_PORT || 5000;
appConfig._aws_region = "eu-west-1";
appConfig._aws_api_version = "2016-11-15";

export default appConfig;

