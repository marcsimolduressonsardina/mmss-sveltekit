import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { createDynamoTables } from './database/dynamo-db.construct.js'
import type { MssStackProps } from './types.js'

export class MmSsStack extends Stack {
  private readonly props: MssStackProps
  constructor(scope: Construct, id: string, props: MssStackProps) {
    super(scope, id, props)
    this.props = props

    // Create tables
    createDynamoTables(this, this.props.envName)
  }
}
