import * as cdk from 'aws-cdk-lib/core';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface NetworkingProps {
    maxAzs: number; // max number availability zones
}

export class Networking extends Construct {
    public readonly vpc: ec2.Vpc;
    constructor(scope: Construct, id: string, props: NetworkingProps) {
        super(scope, id);

        // The code that defines your stack goes here
        this.vpc = new ec2.Vpc(this, 'AppVPC', {
            ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
            maxAzs: props.maxAzs,
            subnetConfiguration: [
                {
                    subnetType: ec2.SubnetType.PUBLIC,
                    name: 'Public',
                    cidrMask: 24
                },
                {
                    subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
                    name: 'Private',
                    cidrMask: 24
                }
            ]
        });
    }
}
