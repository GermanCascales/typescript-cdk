import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as path from 'path';
import * as apiGw from '@aws-cdk/aws-apigatewayv2-alpha'
import { Construct } from 'constructs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { ContainerImage } from 'aws-cdk-lib/aws-ecs';
import { CfnOutput } from 'aws-cdk-lib';

interface DocumentManagementWebserverProps {
    vpc: ec2.IVpc;
    api: apiGw.HttpApi;
}

export class DocumentManagementWebserver extends Construct {
    constructor(scope: Construct, id: string, props: DocumentManagementWebserverProps) {
        super(scope, id);

        const webserverDocker = new DockerImageAsset(this, 'WebserverDocker', {
            directory: path.join(__dirname, '..', 'containers', 'webserver')
        });

        const fargateService = new ApplicationLoadBalancedFargateService(this, 'WebserverService', {
            vpc: props.vpc,
            taskImageOptions: {
                image: ContainerImage.fromDockerImageAsset(webserverDocker),
                environment: {
                    SERVER_PORT: '8080',
                    API_BASE: props.api.url!,
                },
                containerPort: 8080
            }
    });

        new CfnOutput(this, 'WebserverHost', {
            exportName: 'WebserverHost',
            value: fargateService.loadBalancer.loadBalancerDnsName
        })
    }
}