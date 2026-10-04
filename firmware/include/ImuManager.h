#pragma once

#include <cstddef>

class ImuManager {
 public:
  explicit ImuManager(std::size_t sensorCount);
  bool begin();
  void update();

 private:
  std::size_t sensorCount_;
};
