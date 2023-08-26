import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as path from 'path';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apiGw from '@aws-cdk/aws-apigatewayv2-alpha'
import * as cdk from 'aws-cdk-lib';
import { Duration } from "aws-cdk-lib";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

interface DocumentManagementAPIProps {
    documentBucket: s3.IBucket;
}

export class DocumentManagementAPI extends Construct {
    public readonly httpApi: apiGw.HttpApi;

    constructor(scope: Construct, id: string, props: DocumentManagementAPIProps) {
        super(scope, id);

        // The code that defines your stack goes here
        const getDocumentsFunction = new NodejsFunction(this, 'GetDocumentsFunction', {
            runtime: Runtime.NODEJS_16_X,
            entry: path.join(__dirname, '..', 'api', 'getDocuments', 'index.ts'),
            handler: 'getDocuments',
            bundling: {
                externalModules: ['aws-sdk']
            },
            environment: {
                DOCUMENTS_BUCKET_NAME: props.documentBucket.bucketName
            }
        });

        const bucketPermissions = new PolicyStatement();
        bucketPermissions.addResources(`${props.documentBucket.bucketArn}/*`);
        bucketPermissions.addActions('s3:GetObject', 's3:PutObject');
        getDocumentsFunction.addToRolePolicy(bucketPermissions);

        const bucketContainerPermissions = new PolicyStatement();
        bucketContainerPermissions.addResources(props.documentBucket.bucketArn);
        bucketContainerPermissions.addActions('s3:ListBucket');
        getDocumentsFunction.addToRolePolicy(bucketContainerPermissions);
        
        this.httpApi = new apiGw.HttpApi(this, 'HttpAPI', {
            apiName: 'document-management-api',
            createDefaultStage: true,
            corsPreflight: {
                allowMethods: [apiGw.CorsHttpMethod.GET],
                allowOrigins: ['*'],
                maxAge: Duration.days(10)
            }
        });

        const integration = new HttpLambdaIntegration('GetDocumentsIntegration', getDocumentsFunction);

        this.httpApi.addRoutes({
            path: '/documents',
            methods: [apiGw.HttpMethod.GET],
            integration
        });

        new cdk.CfnOutput(this, 'APIEndpoint', {
            value: this.httpApi.url!,
            exportName: 'APIEndpoint'
        });
    }
}