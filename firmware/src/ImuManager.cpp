#include "ImuManager.h"

ImuManager::ImuManager(std::size_t sensorCount) : sensorCount_(sensorCount) {}

bool ImuManager::begin() {
  // Scaffold only: no MPU-6050 driver or orientation estimator is configured.
  return sensorCount_ == 4;
}

void ImuManager::update() {}
