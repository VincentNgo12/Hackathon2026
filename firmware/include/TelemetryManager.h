#pragma once

class TelemetryManager {
 public:
  bool begin();
  void update(unsigned long nowMs);

 private:
  unsigned long lastPublishMs_ = 0;
};
