import { StackProps } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'

export interface MssStackProps extends StackProps {
  envName: string
}

export type DynamoTableSet = {
  customerTable: Table
  orderTable: Table
  itemOrderTable: Table
  calculatedItemOrderTable: Table
  listPricingTable: Table
}
