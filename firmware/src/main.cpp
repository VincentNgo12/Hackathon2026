#include <Arduino.h>

#include "AudioMonitor.h"
#include "EnvironmentManager.h"
#include "I2cMuxManager.h"
#include "ImuManager.h"
#include "SystemConfig.h"
#include "TelemetryManager.h"

namespace {
I2cMuxManager i2cMux;
ImuManager imus(SystemConfig::kImuCount);
EnvironmentManager environment;
AudioMonitor audio;
TelemetryManager telemetry;

void reportInitialization(const char* component, bool ready) {
  Serial.printf("[init] %-12s %s\n", component, ready ? "ready" : "failed");
}
}  // namespace

void setup() {
  Serial.begin(SystemConfig::kSerialBaud);
  delay(250);

  Serial.printf("%s firmware %s\n", SystemConfig::kDeviceName,
                SystemConfig::kFirmwareVersion);
  Serial.println("Scaffold mode: no sensor drivers or network transport configured.");

  reportInitialization("i2c-mux", i2cMux.begin());
  reportInitialization("imus", imus.begin());
  reportInitialization("environment", environment.begin());
  reportInitialization("audio", audio.begin());
  reportInitialization("telemetry", telemetry.begin());
}

void loop() {
  imus.update();
  environment.update();
  audio.update();
  telemetry.update(millis());
  delay(1);
}
