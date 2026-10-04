#pragma once

class I2cMuxManager {
 public:
  bool begin();
  bool selectChannel(unsigned char channel);
};
