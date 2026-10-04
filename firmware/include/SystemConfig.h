#pragma once

#include <Arduino.h>

namespace SystemConfig {
constexpr unsigned long kSerialBaud = 115200;
constexpr unsigned long kTelemetryIntervalMs = 50;  // Approximately 20 Hz.
constexpr uint8_t kI2cMuxAddress = 0x70;
constexpr size_t kImuCount = 4;

constexpr const char* kDeviceName = "twork-it-feather";
constexpr const char* kFirmwareVersion = "0.1.0-scaffold";
}  // namespace SystemConfig
