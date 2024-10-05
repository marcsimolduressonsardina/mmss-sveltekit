import type { StackProps } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import type { Bucket } from 'aws-cdk-lib/aws-s3';

export interface MssStackProps extends StackProps {
	envName: string;
	allowedUploadOrigins: string[];
}

export type DynamoTableSet = {
	customerTable: Table;
	orderTable: Table;
	calculatedItemOrderTable: Table;
	listPricingTable: Table;
	fileTable: Table;
	configTable: Table;
	orderAuditTrailTable: Table;
};

export type BucketSet = {
	moldPricesBucket: Bucket;
	filesBucket: Bucket;
};
