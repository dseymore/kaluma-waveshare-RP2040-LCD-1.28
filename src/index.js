//RP support
const { SPI } = require('spi');
const rp2 = require('rp2');
const { GPIO } = require('gpio');
// Waveshare RP2040 1.2 LCD Support
const { GC9A01A } = require("./spi_GC9A01A");
const { BatteryADC } = require('./battery');
//I2C for the IMU
const { I2C } = require('i2c');
const { QMI8658 } = require('./i2c_QMI8658');
//Screens
const { SplashScreen } = require('./screens/splash');
const { StateDebugScreen } = require('./screens/state-and-time')
// Logging - https://github.com/pimterry/loglevel
const log = require('loglevel');
const prefixer = require('loglevel-plugin-prefix');
// Logging Setup
// Quiet logging - not using persistence to avoid wearing out the flash
prefixer.reg(log);
prefixer.apply(log);
log.setLevel("info", false);
log.getLogger("GC9A01A").setLevel("warn", false);
log.getLogger("QMI8658").setLevel("warn", false);
log.getLogger("MotionMonitor").setLevel("info", false);
delay(50);


//GPIO23 is wired to INT1 on IMU
const IMU_INT1_GPIO_PIN = 23;

let i2c1 = new I2C(1, {
  scl: 7,
  sda: 6
})
const imu = new QMI8658();
imu.setup(i2c1);
delay(20);

//TODO - locale? timezone offset? Clock-setting at flash time is a todo.
const userConfiguration = {
  backlightBrightness: .05,
  activeBacklightBrightness: 1
}

const battery = new BatteryADC();
battery.setup(29);
delay(20);

// The SPI setup on the display is uni-directional, no MISO
var spi1 = new SPI(1, {
  mode: SPI.MODE_0,
  sck: 10,
  mosi: 11,
  miso: -1, //DEPENDS ON A PATCH TO KALUMA TO SUPPORT DISCONNECTED MISO
  baudrate: 40_000_000, //C is using 40M, Python is using 100M
  bitorder: SPI.MSB
});
delay(20);

const displayDriver = new GC9A01A();
displayDriver.setup(
  //On the Waveshare RP2040 the driver is on SPI1, SCK GPIO10, MOSI GPIO11,  MISO GPIO12
  spi1,
  {
    dc: 8, //gpio8
    cs: 9, //gpio9
    rst: 12, //gpio12
    bl: 25, //gpio25
    blDuty: userConfiguration.backlightBrightness
  });
delay(20);

// Use graphics APIs
//const gc = displayDriver.getContext();

// Set the IMU in the motion detection mode
imu.enableWakeOnMotion();
delay(100);


// Enter correct State Machine state
log.trace("Completed hardware startup.");
delay(100);

// Clear the entire screen. 
displayDriver.getContext("direct").clearScreen();

// Splash the screen using a buffered graphics context to flush in one go. 
new SplashScreen().render(displayDriver.getTemporaryContext(40, 40, 160, 160, "buffer"), true);
delay(1_000);

const wakePinGPIO = new GPIO(IMU_INT1_GPIO_PIN, INPUT);
//Listen to motion events that wake the device from the IMU
//CAUTION: I'm having spurious freezes with this, unsure root cause. 
/*
wakePinGPIO.irq((pin, event) => {
    //Note - pin and event are coming up undefined... 
    log.getLogger("MotionMonitor").trace("Inside Motion callback", pin, event);
}, RISING);
*/


const debugScreen = new StateDebugScreen();
debugScreen.setup(battery);
setInterval(function () {
  debugScreen.render(displayDriver.getTemporaryContext(60, 60, 120, 120, "buffer"), true);
}, 100);

// How to sleep and wake on the IMU
/*
  log.error("Starting to sleep!");
  rp2.dormant([IMU_INT1_GPIO_PIN], [RISING]);
*/