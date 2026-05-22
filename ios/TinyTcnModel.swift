import Foundation
import CoreML
import React

@objc(TinyTcnModel)
class TinyTcnModel: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  /**
   Hàm sigmoid:
   probability = 1 / (1 + e^(-logit))

   Model TinyTCN sinh ra logit.
   App chuyển logit qua sigmoid để lấy xác suất đoạn tín hiệu thuộc lớp rung nhĩ.
   */
  private func sigmoid(_ logit: Double) -> Double {
    return 1.0 / (1.0 + exp(-logit))
  }

  @objc(runModel:accValues:resolver:rejecter:)
  func runModel(
    _ ppgValues: [NSNumber],
    accValues: [NSNumber],
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    do {
      if ppgValues.count != 1500 || accValues.count != 1500 {
        rejecter(
          "INVALID_INPUT_LENGTH",
          "PPG and ACC must both have length 1500",
          nil
        )
        return
      }

      let config = MLModelConfiguration()
      let model = try TinyTCN_AF(configuration: config)

      let inputArray = try MLMultiArray(
        shape: [1, 2, 1500],
        dataType: .float32
      )

      for i in 0..<1500 {
        inputArray[[0, 0, NSNumber(value: i)]] = NSNumber(
          value: ppgValues[i].floatValue
        )

        inputArray[[0, 1, NSNumber(value: i)]] = NSNumber(
          value: accValues[i].floatValue
        )
      }

      let input = TinyTCN_AFInput(input: inputArray)
      let output = try model.prediction(input: input)

      /**
       Output của CoreML là logit.
       Sau đó dùng sigmoid để chuyển logit thành xác suất AF.
       */
      let logit = output.logit[0].doubleValue
      let probability = sigmoid(logit)

      resolver([
        "logit": logit,
        "probability": probability
      ])
    } catch {
      rejecter(
        "MODEL_RUN_ERROR",
        error.localizedDescription,
        error
      )
    }
  }
}
