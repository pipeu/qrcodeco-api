# QRcode.co Api

Last updated: 02/20/21
Author: Luiz Couto


## Requirements
This project requires the installation of the [Serverless](https://serverless.com) framework:

```bash
npm install -g serverless
```
More details at: https://serverless.com/learn/quick-start/


To deploy on AWS Dev Env
sls deploy


This project is also dependent on [Lambda API](https://github.com/jeremydaly/lambda-api) and [serverless-stage-manager](https://github.com/jeremydaly/serverless-stage-manager). Both can be installed by running the following in the cloned project folder:

```bash
npm install
```

## Environments

dev, staging, prod
Default env: dev

regions
us-east-1 (Virginia) -> prod
us-west-2 (Oregon) -> dev/staging

## serverless.yml notes
Using serverless-bundle npm module that automatically add and manage webpack config

## Local development
serverless-offline - module for local tests
run 
```
sls offline
```
It will run dev mode (default) using aws dev env (Oregon region) 

23/07/20
@!@!
Attention: dev mode is using dynamo in Prod
