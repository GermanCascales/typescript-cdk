import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Networking } from './networking';
import { DocumentManagementAPI } from './api';
import * as path from 'path';
import { DocumentManagementWebserver } from './webserver';

export class TypescriptCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const bucket = new s3.Bucket(this, 'DocumentsBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED
    });

    new s3Deploy.BucketDeployment(this, 'DocumentsBucketDeployment', {
      sources: [s3Deploy.Source.asset(path.join(__dirname, '..', 'documents'))],
      destinationBucket: bucket,
      memoryLimit: 512
    });
    
    new cdk.CfnOutput(this, 'DocumentsBucketNameExport', {
      value: bucket.bucketName,
      exportName: 'DocumentsBucketName'
    });
    
    const networkingStack = new Networking(this, 'NetworkingConstruct', {
      maxAzs: 2,
    });

    cdk.Tags.of(networkingStack).add('Module', 'Networking');

    const api = new DocumentManagementAPI(this, 'DocumentManagementAPI', {
      documentBucket: bucket
    });

    cdk.Tags.of(api).add('Module', 'API');

    const webserver = new DocumentManagementWebserver(this, 'DocumentManagementWebserver', {
      vpc: networkingStack.vpc,
      api: api.httpApi
    });

    cdk.Tags.of(webserver).add('Module', 'Webserver');

    // example resource
    // const queue = new sqs.Queue(this, 'TypescriptCdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
