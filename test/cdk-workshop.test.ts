import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Template, Capture } from 'aws-cdk-lib/assertions';
import * as CdkWorkshop from '../lib/cdk-workshop-stack';
import {HitCounter} from "../lib/hitcounter";

test('SQS Queue and SNS Topic Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new CdkWorkshop.CdkWorkshopStack(app, 'MyTestStack');
  // THEN

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300
  });
  template.resourceCountIs('AWS::SNS::Topic', 1);
});

test('DynamoDb Table Created', () => {
  const stack = new cdk.Stack()

  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'hello.handler',
      code: lambda.Code.fromInline('lambda')
    }),
  });

  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs("AWS::DynamoDB::Table", 1);
  template.hasResourceProperties('AWS::DynamoDB::Table', {
    SSESpecification: {
      SSEEnabled: true
    }
  })
});


test('Lambda Has Environment Variables', () => {
  const stack = new cdk.Stack();

  // WHEN
  new HitCounter(stack, 'MyTestConstruct', {
    downstream: new lambda.Function(stack, 'TestFunction', {
      runtime: lambda.Runtime.NODEJS_16_X,
      handler: 'hello.handler',
      code: lambda.Code.fromAsset('lambda')
    })
  });

  // THEN
  const template = Template.fromStack(stack)
  const envCapture = new Capture()
  template.hasResourceProperties("AWS::Lambda::Function", {
    Environment: envCapture
  })

  expect(envCapture.asObject()).toEqual({
    Variables: {
      DOWNSTREAM_FUNCTION_NAME: {
        Ref: "TestFunction22AD90FC"
      },
      HITS_TABLE_NAME: {
        Ref: "MyTestConstructHits24A357F0"
      }
    }
  })
});


test('read capacity can be configured', () => {
  const stack = new cdk.Stack()

  expect(() => {
    new HitCounter(stack, 'MyTestConstruct', {
      downstream: new lambda.Function(stack, 'TestFunction', {
        runtime: lambda.Runtime.NODEJS_16_X,
        handler: 'hello.handler',
        code: lambda.Code.fromAsset('lambda')
      }),
      readCapacity: 3
    })
  })
    .toThrowError(/readCapacity must be greater than 5 and less than 20/)
})

