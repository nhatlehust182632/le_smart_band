#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TinyTcnModel, NSObject)

RCT_EXTERN_METHOD(
  runModel:
  (NSArray *)ppgValues
  accValues:(NSArray *)accValues
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

@end
