const { ADC } = require('adc');
const logger = require('loglevel');

class BatteryADC {

    log = logger.getLogger("BatteryADC");

    setup(batteryPIN) {
        this.adc = new ADC(batteryPIN);
    }

    /**
     * This method takes a few samples of the voltage to generate a value
     * TODO - convert to async function
     * @returns 
     */
    getBatteryPercentage() {
        //read battery voltage per %
        let voltage = 0.0;
        let output = 0.0;
        //TODO - make these options
        const battery_max = 4.2; //maximum voltage of battery
        const battery_min = 2.5;  //minimum voltage of battery before shutdown

        voltage = this.getBatteryVoltage();
        output = ((voltage - battery_min) / (battery_max - battery_min)) * 100;
        if (output < 100)
            return output;
        else
            return 100.0;
    }

    getRawADCValue() {
        return this.adc.read()
    }

    getBatteryVoltage() {
        const conversionFactor = 3.3 * 2; //The Kaluma API already does the (1 << 12) division!
        const reading = this.getRawADCValue();
        const voltage = reading * conversionFactor;
        if (this.log.getLevel() <= logger.levels.TRACE) {
            this.log.trace("Conversion Factor:", conversionFactor)
            this.log.trace("Raw value: 0x%03x, voltage: %f V\n", reading, voltage);
        }
        return voltage
    }

}


exports.BatteryADC = BatteryADC;