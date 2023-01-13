// Graphics & Fonts
var font = require('simple-fonts/minimal');

class StateDebugScreen {

    setup(battery) {
        this.battery = battery;
    }

    /**
     * 
     * @param {*} gc  Assumes a usable 120x120 centered region
     * @param {*} buffered 
     */
    render(gc, buffered = false) {
        let state = {
            batteryPercent: Number.parseFloat(this.battery.getBatteryPercentage()).toFixed(0),
        }

        if (buffered || this.lastState == undefined) {
            gc.clearScreen();
        }
        gc.setFont(font);
        gc.setFontScale(3, 3)
        gc.setFontColor(gc.color16(255, 255, 255));
        // Show the current time
        const now = new Date();
        const dateString = now.getHours().toString().padStart(2, '0') + ":"
            + now.getMinutes().toString().padStart(2, '0') + ":"
            + now.getSeconds().toString().padStart(2, '0')
            + "Z"; //TODO - future timezone handling
        gc.drawText(0, 10, dateString);

        if (buffered || this.lastState == undefined || state.batteryPercent !== this.lastState.batteryPercent) {
            // Battery percent
            const percent = state.batteryPercent;
            gc.drawText(0, 30, percent + "%")
        }

        this.lastState = state;
        if (buffered) {
            //display it
            gc.display();
        }
    }

}

exports.StateDebugScreen = StateDebugScreen;