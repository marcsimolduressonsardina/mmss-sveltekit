import { type Attribute, AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import type { DynamoTableSet } from '../types.js';

export function createDynamoTables(scope: Construct, envName: string): DynamoTableSet {
	return {
		customerTable: createCustomerTable(scope, envName),
		orderTable: createOrderTable(scope, envName),
		calculatedItemOrderTable: createCalculatedItemOrderTable(scope, envName),
		listPricingTable: createListPricingTable(scope, envName),
		fileTable: createFileTable(scope, envName),
		configTable: createConfigTable(scope, envName),
		orderAuditTrailTable: createOrderAuditTrailTable(scope, envName)
	};
}

function createCustomerTable(scope: Construct, envName: string): Table {
	return addUuidGsi(
		createTable(
			scope,
			envName,
			`${envName}-customer`,
			{
				name: 'storeId',
				type: AttributeType.STRING
			},
			{
				name: 'phone',
				type: AttributeType.STRING
			}
		)
	);
}

function createConfigTable(scope: Construct, envName: string): Table {
	return createTable(
		scope,
		envName,
		`${envName}-config`,
		{
			name: 'storeId',
			type: AttributeType.STRING
		},
		{
			name: 'id',
			type: AttributeType.STRING
		}
	);
}

function createFileTable(scope: Construct, envName: string): Table {
	return createTable(
		scope,
		envName,
		`${envName}-file`,
		{
			name: 'orderUuid',
			type: AttributeType.STRING
		},
		{
			name: 'fileUuid',
			type: AttributeType.STRING
		}
	);
}

function createOrderTable(scope: Construct, envName: string): Table {
	const table = addUuidGsi(
		createTable(
			scope,
			envName,
			`${envName}-order`,
			{
				name: 'customerUuid',
				type: AttributeType.STRING
			},
			{
				name: 'timestamp',
				type: AttributeType.NUMBER
			}
		)
	);

	table.addGlobalSecondaryIndex({
		indexName: `shortId`,
		partitionKey: {
			name: 'shortId',
			type: AttributeType.STRING
		}
	});

	table.addGlobalSecondaryIndex({
		indexName: `statusIndex`,
		partitionKey: {
			name: 'status',
			type: AttributeType.STRING
		},
		sortKey: {
			name: 'timestamp',
			type: AttributeType.NUMBER
		}
	});

	return table;
}

function createListPricingTable(scope: Construct, envName: string): Table {
	return addUuidGsi(
		createTable(
			scope,
			envName,
			`${envName}-list-pricing`,
			{
				name: 'type',
				type: AttributeType.STRING
			},
			{
				name: 'id',
				type: AttributeType.STRING
			}
		)
	);
}

function createCalculatedItemOrderTable(scope: Construct, envName: string): Table {
	return createTable(scope, envName, `${envName}-calculated-item-order`, {
		name: 'orderUuid',
		type: AttributeType.STRING
	});
}

function createOrderAuditTrailTable(scope: Construct, envName: string): Table {
	return createTable(
		scope,
		envName,
		`${envName}-order-audit-trail`,
		{
			name: 'orderUuid',
			type: AttributeType.STRING
		},
		{
			name: 'timestamp',
			type: AttributeType.NUMBER
		}
	);
}

function createTable(
	scope: Construct,
	envName: string,
	tableName: string,
	partitionKey: Attribute,
	sortKey?: Attribute
): Table {
	return new Table(scope, `${tableName}-table`, {
		tableName,
		partitionKey,
		sortKey,
		billingMode: BillingMode.PAY_PER_REQUEST,
		pointInTimeRecovery: envName === 'prod'
	});
}

function addUuidGsi(table: Table): Table {
	table.addGlobalSecondaryIndex({
		indexName: `uuid`,
		partitionKey: {
			name: 'uuid',
			type: AttributeType.STRING
		}
	});

	return table;
}
