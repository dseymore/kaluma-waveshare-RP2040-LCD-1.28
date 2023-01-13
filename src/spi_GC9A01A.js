const graphics = require("graphics");
const { PWM } = require('pwm');
const logger = require('loglevel');

/**
 * This class is the SPI interface for the GC9A01A display driver for the Waveshare IPS LCD 
 */
class GC9A01A {

    commands = {
        RESET: 0x01,
        //Memory Access Controls
        MEMACCESS: 0x36,
        //For window setting
        CASET: 0x2A,
        PASET: 0x2B,
        RAMWR: 0x2C,
    }

    log = logger.getLogger("GC9A01A");

    /**
     * Setup GC9A01A for SPI connection
     * @param {SPI} spi
     * @param {Object} options
     *   .width {number=240}
     *   .height {number=240}
     *   .dc {number=-1} - PIN for Command/Data Selection
     *   .rst {number=-1} - PIN for Reset
     *   .cs {number=-1} - PIN for Chip Select
     *   .bl {number=-1} - PIN for Backlight PWM
     *   .blDuty {number=1} - Duty for backlight between 0 and 1
     *   .extVcc {boolean=false}
     *   .rotation {number=0}
     */
    setup(spi, options, callback) {
        this.spi = spi;
        options = Object.assign(
            {
                width: 240,
                height: 240,
                dc: -1,
                rst: -1,
                cs: -1,
                bl: -1,
                blDuty: 1
            },
            options
        );
        if (this.log.getLevel() <= logger.levels.TRACE) {
            this.log.trace("Options:", JSON.stringify(options, null, 2));
        }
        this.width = options.width;
        this.height = options.height;
        this.dc = options.dc;
        this.rst = options.rst;
        this.cs = options.cs;
        this.bl = options.bl;
        this.blDuty = options.blDuty;
        this.context = null;
        if (this.dc > -1) pinMode(this.dc, OUTPUT);
        if (this.rst > -1) pinMode(this.rst, OUTPUT);
        if (this.cs > -1) pinMode(this.cs, OUTPUT);
        if (this.bl > -1) pinMode(this.bl, OUTPUT);

        const pwm = new PWM(this.bl, 1_000, this.blDuty); // Create the PWM instance with pin 1
        this.backlightPWM = pwm;
        this.backlightPWM.start(); // Generate PWM signal

        this.reset();
        //Set the resolution and scanning method of the screen
        this.setAttributes(true);

        //Set the initialization register
        this.LCD_1IN28_InitReg();
        delay(50);
    }

    setBacklightDuty(duty) {
        if (duty > 1 || duty < 0) {
            this.log.warn("Invalid duty cycle applied, ignoring", duty)
        } else {
            this.blDuty = duty;
            this.backlightPWM.setDuty(this.blDuty);
        }
    }


    reset() {
        if (this.log.getLevel() <= logger.levels.TRACE) {
            this.log.trace("Resetting LCD");
        }
        if (this.cs > -1) digitalWrite(this.cs, HIGH);
        // Handle a lack of a reset line
        if (this.rst < 0) {
            this.cmd(this.commands.RESET);
            delay(150);
        } else {
            digitalWrite(this.rst, HIGH);
            delay(10);
            digitalWrite(this.rst, LOW);
            delay(10);
            //normal execution should be Reset High
            digitalWrite(this.rst, HIGH);
            delay(100);
        }
    }

    setAttributes(horizontal) {
        //Get the screen scan direction
        let MemoryAccessReg = 0x08;

        if (horizontal) {
            MemoryAccessReg = 0xc8; //11001000 - first bit a 1, MH 1
        } else {
            MemoryAccessReg = 0x68; //01001000 - first bit a 0, MH 0
        }

        // Set the read / write scan direction of the frame memory
        this.cmd(this.commands.MEMACCESS, [MemoryAccessReg]);
    }

    LCD_1IN28_InitReg() {

        this.cmd(0xEF);
        this.cmd(0xEB, [0x14]);

        this.cmd(0xFE);
        this.cmd(0xEF);

        this.cmd(0xEB, [0x14]);

        this.cmd(0x84, [0x40]);

        this.cmd(0x85, [0xFF]);

        this.cmd(0x86, [0xFF]);

        this.cmd(0x87, [0xFF]);

        this.cmd(0x88, [0x0A]);

        this.cmd(0x89, [0x21]);

        this.cmd(0x8A, [0x00]);

        this.cmd(0x8B, [0x80]);

        this.cmd(0x8C, [0x01]);

        this.cmd(0x8D, [0x01]);

        this.cmd(0x8E, [0xFF]);

        this.cmd(0x8F, [0xFF]);

        this.cmd(0xB6, [0x00, 0x20]); //Fixed 9:50AM

        //Set as vertical screen
        this.cmd(this.commands.MEMACCESS, [0x08]);

        //Pixel Format Set
        this.cmd(0x3A, [0x05]); //5 = 16-bit

        this.cmd(0x90, [0x08, 0x08, 0x08, 0x08]);

        this.cmd(0xBD, [0x06]);

        this.cmd(0xBC, [0x00]);

        this.cmd(0xFF, [0x60, 0x01, 0x04]);

        this.cmd(0xC3, [0x13]);

        this.cmd(0xC4, [0x13]);

        this.cmd(0xC9, [0x22]);

        this.cmd(0xBE, [0x11]);

        this.cmd(0xE1, [0x10, 0x0E]);

        this.cmd(0xDF, [0x21, 0x0c, 0x02]);

        this.cmd(0xF0, [0x45, 0x09, 0x08, 0x08, 0x26, 0x2A]);

        this.cmd(0xF1, [0x43, 0x70, 0x72, 0x36, 0x37, 0x6F]);

        this.cmd(0xF2, [0x45, 0x09, 0x08, 0x08, 0x26, 0x2A]);

        this.cmd(0xF3, [0x43, 0x70, 0x72, 0x36, 0x37, 0x6F]);

        this.cmd(0xED, [0x1B, 0x0B]);

        this.cmd(0xAE, [0x77]);

        this.cmd(0xCD, [0x63]);

        this.cmd(0x70, [0x07, 0x07, 0x04, 0x0E, 0x0F, 0x09, 0x07, 0x08, 0x03]);

        this.cmd(0xE8, [0x34]); //Framerate?

        this.cmd(0x62, [0x18, 0x0D, 0x71, 0xED, 0x70, 0x70, 0x18, 0x0F, 0x71, 0xEF, 0x70, 0x70]);

        this.cmd(0x63, [0x18, 0x11, 0x71, 0xF1, 0x70, 0x70, 0x18, 0x13, 0x71, 0xF3, 0x70, 0x70]);

        this.cmd(0x64, [0x28, 0x29, 0xF1, 0x01, 0xF1, 0x00, 0x07]);

        this.cmd(0x66, [0x3C, 0x00, 0xCD, 0x67, 0x45, 0x45, 0x10, 0x00, 0x00, 0x00]);

        this.cmd(0x67, [0x00, 0x3C, 0x00, 0x00, 0x00, 0x01, 0x54, 0x10, 0x32, 0x98]);

        this.cmd(0x74, [0x10, 0x85, 0x80, 0x00, 0x00, 0x4E, 0x00]);

        this.cmd(0x98, [0x3e, 0x07]);

        this.cmd(0x35); //tearing
        this.cmd(0x21); //display inversion off, on=0x21

        this.cmd(0x11); //exit sleep
        delay(120);
        this.cmd(0x29); //display on
        delay(20);
    }

    /**
    * Send command
    * @param {number} cmd
    * @param {Array<number>} data
    */
    cmd(cmd, data) {
        if (this.cs > -1) digitalWrite(this.cs, LOW);
        if (this.log.getLevel() <= logger.levels.TRACE) {
            this.log.trace("COMMAND", cmd.toString(16))
        }
        digitalWrite(this.dc, LOW); // command mode
        const sentCommand = this.spi.send(new Uint8Array([cmd]));
        if (this.log.getLevel() <= logger.levels.TRACE) {
            this.log.trace("Command sent: ", sentCommand)
        }
        if (data) {
            if (this.log.getLevel() <= logger.levels.TRACE) {
                this.log.trace("DATA size", data.length)
            }
            digitalWrite(this.dc, HIGH); // data mode
            if (this.cs > -1) digitalWrite(this.cs, LOW);
            const sentData = this.spi.send(new Uint8Array(data));
            if (this.log.getLevel() <= logger.levels.TRACE) {
                this.log.trace("Data sent: ", sentData)
            }
        }
        if (this.cs > -1) digitalWrite(this.cs, HIGH);
    }

    LCD_1IN28_SetWindows(Xstart, Ystart, Xend, Yend) {
        if (this.log.getLevel() <= logger.levels.TRACE) {
            this.log.trace("Setting window size", JSON.stringify({ Xs: Xstart, Ys: Ystart, Xe: Xend, Ye: Yend }, null, 2));
        }
        //set the X coordinates
        this.cmd(this.commands.CASET, [0x00, Xstart, (Xend - 1) >> 8, Xend - 1]);

        //set the Y coordinates
        this.cmd(this.commands.PASET, [0x00, Ystart, (Yend - 1) >> 8, Yend - 1]);
        this.cmd(this.commands.RAMWR);
    }

    sendData(buffer, timeout = 5000, count = 1) {
        if (this.cs > -1) digitalWrite(this.cs, LOW);
        digitalWrite(this.dc, HIGH); //data mode
        const result = this.spi.send(buffer, timeout, count);
        if (this.log.getLevel() <= logger.levels.TRACE) {
            this.log.trace("Buffer sent: ", result)
        }
        if (this.cs > -1) digitalWrite(this.cs, HIGH);
    }

    _newBufferedGraphics(xoffset, yoffset, width, height) {
        return new graphics.BufferedGraphicsContext(width, height, {
            rotation: 0, //TODO -hardcoded, matters?
            bpp: 16,
            display: (buffer) => {
                this.cmd("0x2A", [0x00, xoffset, 0x00, xoffset + width - 1]);
                this.cmd("0x2B", [0x00, yoffset, 0x00, yoffset + height - 1]);
                this.cmd("0x2C");
                this.sendData(buffer);
            },
        });
    }

    _newDirectGraphics(xoffset, yoffset, width, height) {
        return new graphics.GraphicsContext(width, height, {
            rotation: 0, // TODO
            setPixel: (x, y, c) => {
                this.cmd("0x2A", [0x00, xoffset + x, 0x00, xoffset + x + 1]);
                this.cmd("0x2B", [0x00, yoffset + y, 0x00, yoffset + y + 1]);
                //write 16 bits of the 1 pixel
                this.cmd("0x2C", [c >> 8, c]);
            },
            fillRect: (x, y, w, h, c) => {
                this.cmd("0x2A", [0x00, xoffset + x, 0x00, (xoffset + x + w - 1)]);
                this.cmd("0x2B", [0x00, yoffset + y, 0x00, (yoffset + y + h - 1)]);
                this.cmd("0x2C");
                //write 16 bits of the 1 pixel, times the number of pixles
                this.sendData(new Uint8Array([c >> 8, c]), 5000, w * h);
            }
        });
    }

    /**
     * Creates a non-memoized graphics context for use in scenarios where direct-driving
     * the whole screen is too slow, or buffering the whole screen requires too much memory.
     * @param {*} xoffset 
     * @param {*} yoffset 
     * @param {*} width 
     * @param {*} height 
     * @param {*} type 
     * @returns 
     */
    getTemporaryContext(xoffset, yoffset, width, height, type = "buffer") {
        if (type === "buffer") {
            return this._newBufferedGraphics(xoffset, yoffset, width, height);
        } else {
            return this._newDirectGraphics(xoffset, yoffset, width, height);
        }
    }

    getContext(type = "direct") {
        if (!this.context) {
            if (type === "buffer") {
                this.context = new graphics.BufferedGraphicsContext(this.width, this.height, {
                    rotation: 0, //TODO -hardcoded, matters?
                    bpp: 16,
                    display: (buffer) => {
                        // this.LCD_1IN28_SetWindows(0, 0, this.width, this.height);
                        this.cmd("0x2A", [0x00, 0x00, 0x00, this.width - 1]);
                        this.cmd("0x2B", [0x00, 0x00, 0x00, this.height - 1]);
                        this.cmd("0x2C");
                        this.sendData(buffer);
                    },
                });
            } else {
                this.context = new graphics.GraphicsContext(this.width, this.height, {
                    rotation: 0, // TODO
                    setPixel: (x, y, c) => {
                        this.cmd("0x2A", [0x00, x, 0x00, x + 1]);
                        this.cmd("0x2B", [0x00, y, 0x00, y + 1]);
                        this.cmd("0x2C", [c >> 8, c]); //write 16 bits of the 1 pixel
                    },
                    fillRect: (x, y, w, h, c) => {
                        this.cmd("0x2A", [0x00, x, 0x00, (x + w - 1)]);
                        this.cmd("0x2B", [0x00, y, 0x00, (y + h - 1)]);
                        this.cmd("0x2C");
                        this.sendData(new Uint8Array([c >> 8, c]), 5000, w * h);
                    }
                });
            }
        }
        return this.context;
    }

}

exports.GC9A01A = GC9A01A;