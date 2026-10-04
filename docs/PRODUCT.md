# Product overview

## Purpose

T'Work It is a NatHacks 2026 prototype exploring how wearable, environmental,
cardiac, and EEG signals could be brought into one supervisor-facing worker
safety dashboard. It is a demonstration system, not a medical device, and its
outputs must not be described as clinically validated.

This scaffold proves that each software boundary can work before physical
hardware and interpretation algorithms are added.

## Intended experience

A worker wears four back-mounted motion sensors and other non-invasive sensors.
A supervisor sees a live application-level summary in a browser. The eventual
hero view is a real-time 3D representation of the worker's spine/body, supported
by compact posture, environment, heart-rate, fall-state, and EEG panels.

## Hardware scope

- Adafruit ESP32-S3 Feather, product 5477
- Four MPU-6050 IMUs connected through a PCA9548/TCA9548A I2C multiplexer
- Approximate IMU regions: pelvis, lumbar, thoracic, and upper thoracic
- ENS160 plus AHT21 for air quality, temperature, and humidity
- VEML7700 ambient-light sensor
- INMP441 I2S microphone for relative noise exposure
- MAX30102 heart-rate sensor
- OpenBCI Cyton with its wireless dongle, connected independently to the laptop

## Product capabilities

The target system will:

- estimate one orientation quaternion per MPU-6050 on the ESP32;
- capture four neutral IMU orientations during calibration;
- calculate relative posture and higher-level interpretations on the laptop;
- display lumbar and thoracic posture values, fall state, and heart rate;
- display temperature, humidity, ENS160 air-quality values, relative noise, and
  ambient light;
- show a small EEG waveform, signal-quality indication, and cognitive-alertness
  panel;
- stream aggregated telemetry from FastAPI to React over WebSockets; and
- support synthetic and recorded replay sources so UI development never depends
  on connected hardware.

## Current scaffold boundaries

The current milestone uses synthetic data and only proves component structure,
typed telemetry, WebSocket delivery, and basic 3D rendering. Sensor drivers,
hardware transports, calibration persistence, BrainFlow/OpenBCI acquisition,
EEG processing, fall detection, posture algorithms, risk logic, data storage,
authentication, and the final dashboard design remain future work.
