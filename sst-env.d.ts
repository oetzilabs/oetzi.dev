/* tslint:disable */
/* eslint-disable */
import "sst"
declare module "sst" {
  export interface Resource {
    "Api": {
      "type": "sst.aws.ApiGatewayV2"
      "url": string
    }
    "SolidStartApp": {
      "type": "sst.aws.SolidStart"
      "url": string
    }
  }
}
export {}
