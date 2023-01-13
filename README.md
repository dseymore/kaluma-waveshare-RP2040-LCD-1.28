# What is this?
This package contains some sample Kaluma JavaScript code to interface with the Waveshare RP2040 1.28 LCD board: https://www.waveshare.com/wiki/RP2040-LCD-1.28

You'll find the index.js file initializes:
1. ADC for battery readings
2. I2C for the IMU, QMI8658
3. SPI for the 240x240 LCD, driven by GC9A01A

The implementation is based on the sample C & MicroPython code, and is in the most basic state to be able to use. Many of the APIs lack proper parameterization or state management to work well - but they got me running on my toy project.

# Kaluma Version Warning
Make sure you're using the latest, or later than this issue was resolved: https://github.com/kaluma-project/kaluma/issues/546

Why? The Kaluma implementation of SPI bus 1 mandated that the MISO (input line) is configured for SPI, but on the Waveshare RP2040 1.28 LCD requires the 12th GPIO PIN for the Reset line. 

# Building Kaluma
Instructions to setup the Kaluma build environment here: https://github.com/kaluma-project/kaluma/wiki/Build

# Building & Flashing your Device
1. See https://kalumajs.org/docs/getting-started to install Kaluma onto the device
2. Execute `kaluma flash ./src/index.js --bundle --shell` to both build and flash the system


# Other Environment Setup Reminders
* I think you need to `nvm alias default v16.16.0` - run npm list to see what you have installed before selecting, 16+
