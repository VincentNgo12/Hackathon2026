#include "TelemetryManager.h"

#include <Arduino.h>

#include "SystemConfig.h"

bool TelemetryManager::begin() {
  // Scaffold only: the hardware transport and payload encoding are undecided.
  return true;
}

void TelemetryManager::update(unsigned long nowMs) {
  if (nowMs - lastPublishMs_ < SystemConfig::kTelemetryIntervalMs) {
    return;
  }

  lastPublishMs_ = nowMs;
  // Intentionally do not emit fabricated sensor telemetry from firmware.
}
