#include "I2cMuxManager.h"

bool I2cMuxManager::begin() {
  // Scaffold only: future code will initialize Wire and probe the mux.
  return true;
}

bool I2cMuxManager::selectChannel(unsigned char channel) {
  // Preserve the expected mux channel constraint without touching hardware.
  return channel < 8;
}
