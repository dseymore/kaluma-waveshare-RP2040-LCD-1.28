const logger = require('loglevel');

const QMI8658_SLAVE_ADDR_L = 0x6A;
const QMI8658_SLAVE_ADDR_H = 0x6B;

const QMI8658_CTRL7_DISABLE_ALL = 0x0;
const QMI8658_CTRL7_ACC_ENABLE = 0x1;
const QMI8658_CTRL7_GYR_ENABLE = 0x2;
const QMI8658_CTRL7_MAG_ENABLE = 0x4;
const QMI8658_CTRL7_AE_ENABLE = 0x8;
const QMI8658_CTRL7_GYR_SNOOZE_ENABLE = 0x10;
const QMI8658_CTRL7_ENABLE_MASK = 0xF;

//TODO - Expose to setup which features to enable
const QMI8658_CONFIG_ACCGYR_ENABLE = (QMI8658_CTRL7_ACC_ENABLE | QMI8658_CTRL7_GYR_ENABLE)


const QMI8658Register = Object.freeze({
    /*! \brief FIS device identifier register. */
    QMI8658Register_WhoAmI: 0x00, // 0
    /*! \brief FIS hardware revision register. */
    QMI8658Register_Revision: 1, // 1
    /*! \brief General and power management modes. */
    QMI8658Register_Ctrl1: 2, // 2
    /*! \brief Accelerometer control. */
    QMI8658Register_Ctrl2: 3, // 3
    /*! \brief Gyroscope control. */
    QMI8658Register_Ctrl3: 4, // 4
    /*! \brief Magnetometer control. */
    QMI8658Register_Ctrl4: 5, // 5
    /*! \brief Data processing settings. */
    QMI8658Register_Ctrl5: 6, // 6
    /*! \brief AttitudeEngine control. */
    QMI8658Register_Ctrl6: 7, // 7
    /*! \brief Sensor enabled status. */
    QMI8658Register_Ctrl7: 8, // 8
    /*! \brief Reserved - do not write. */
    QMI8658Register_Ctrl8: 9, // 9
    /*! \brief Host command register. */
    QMI8658Register_Ctrl9: 10, // 10
    /*! \brief Calibration register 1 most significant byte. */
    QMI8658Register_Cal1_L: 11,
    QMI8658Register_Cal1_H: 12,
    /*! \brief FIFO control register. */
    QMI8658Register_FifoCtrl: 19,
    /*! \brief Output data overrun and availability. */
    QMI8658Register_StatusInt: 45,
    /*! \brief Output data overrun and availability. */
    QMI8658Register_Status0: 46,
    /*! \brief Miscellaneous status register. */
    QMI8658Register_Status1: 47,
    /*! \brief timestamp low. */
    QMI8658Register_Timestamp_L: 48,
    /*! \brief tempearture low. */
    QMI8658Register_Tempearture_L: 51,
    /*! \brief Accelerometer X axis least significant byte. */
    QMI8658Register_Ax_L: 53,
    /*! \brief Gyroscope X axis least significant byte. */
    QMI8658Register_Gx_L: 59,
    /*! \brief Magnetometer X axis least significant byte. */
    QMI8658Register_Mx_L: 65,
    /*! \brief Quaternion increment W least significant byte. */
    QMI8658Register_Q1_L: 73,
    /*! \brief Velocity increment X least significant byte. */
    QMI8658Register_Dvx_L: 81,
    /*! \brief AttitudeEngine reg1. */
    QMI8658Register_AeReg1: 87,
    QMI8658Register_I2CM_STATUS: 110
});


const QMI8658_AccRange = Object.freeze({
    QMI8658AccRange_2g: 0x00 << 4, /*!< \brief +/- 2g range */
    QMI8658AccRange_4g: 0x01 << 4, /*!< \brief +/- 4g range */
    QMI8658AccRange_8g: 0x02 << 4, /*!< \brief +/- 8g range */
    QMI8658AccRange_16g: 0x03 << 4 /*!< \brief +/- 16g range */
});


const QMI8658_AccOdr = Object.freeze({
    QMI8658AccOdr_8000Hz: 0x00,         /*!< \brief High resolution 8000Hz output rate. */
    QMI8658AccOdr_4000Hz: 0x01,         /*!< \brief High resolution 4000Hz output rate. */
    QMI8658AccOdr_2000Hz: 0x02,         /*!< \brief High resolution 2000Hz output rate. */
    QMI8658AccOdr_1000Hz: 0x03,         /*!< \brief High resolution 1000Hz output rate. */
    QMI8658AccOdr_500Hz: 0x04,          /*!< \brief High resolution 500Hz output rate. */
    QMI8658AccOdr_250Hz: 0x05,          /*!< \brief High resolution 250Hz output rate. */
    QMI8658AccOdr_125Hz: 0x06,          /*!< \brief High resolution 125Hz output rate. */
    QMI8658AccOdr_62_5Hz: 0x07,         /*!< \brief High resolution 62.5Hz output rate. */
    QMI8658AccOdr_31_25Hz: 0x08,        /*!< \brief High resolution 31.25Hz output rate. */
    QMI8658AccOdr_LowPower_128Hz: 0x0c, /*!< \brief Low power 128Hz output rate. */
    QMI8658AccOdr_LowPower_21Hz: 0x0d,  /*!< \brief Low power 21Hz output rate. */
    QMI8658AccOdr_LowPower_11Hz: 0x0e,  /*!< \brief Low power 11Hz output rate. */
    QMI8658AccOdr_LowPower_3Hz: 0x0f    /*!< \brief Low power 3Hz output rate. */
});


const QMI8658_GyrRange = Object.freeze({
    QMI8658GyrRange_32dps: 0 << 4,   /*!< \brief +-32 degrees per second. */
    QMI8658GyrRange_64dps: 1 << 4,   /*!< \brief +-64 degrees per second. */
    QMI8658GyrRange_128dps: 2 << 4,  /*!< \brief +-128 degrees per second. */
    QMI8658GyrRange_256dps: 3 << 4,  /*!< \brief +-256 degrees per second. */
    QMI8658GyrRange_512dps: 4 << 4,  /*!< \brief +-512 degrees per second. */
    QMI8658GyrRange_1024dps: 5 << 4, /*!< \brief +-1024 degrees per second. */
    QMI8658GyrRange_2048dps: 6 << 4, /*!< \brief +-2048 degrees per second. */
    QMI8658GyrRange_4096dps: 7 << 4  /*!< \brief +-2560 degrees per second. */
});

/*!
 * \brief Gyroscope output rate configuration.
 */
const QMI8658_GyrOdr = Object.freeze({
    QMI8658GyrOdr_8000Hz: 0x00, /*!< \brief High resolution 8000Hz output rate. */
    QMI8658GyrOdr_4000Hz: 0x01, /*!< \brief High resolution 4000Hz output rate. */
    QMI8658GyrOdr_2000Hz: 0x02, /*!< \brief High resolution 2000Hz output rate. */
    QMI8658GyrOdr_1000Hz: 0x03, /*!< \brief High resolution 1000Hz output rate. */
    QMI8658GyrOdr_500Hz: 0x04,  /*!< \brief High resolution 500Hz output rate. */
    QMI8658GyrOdr_250Hz: 0x05,  /*!< \brief High resolution 250Hz output rate. */
    QMI8658GyrOdr_125Hz: 0x06,  /*!< \brief High resolution 125Hz output rate. */
    QMI8658GyrOdr_62_5Hz: 0x07, /*!< \brief High resolution 62.5Hz output rate. */
    QMI8658GyrOdr_31_25Hz: 0x08 /*!< \brief High resolution 31.25Hz output rate. */
});


const QMI8658_MagOdr = Object.freeze({
    QMI8658MagOdr_1000Hz: 0x00, /*!< \brief 1000Hz output rate. */
    QMI8658MagOdr_500Hz: 0x01,  /*!< \brief 500Hz output rate. */
    QMI8658MagOdr_250Hz: 0x02,  /*!< \brief 250Hz output rate. */
    QMI8658MagOdr_125Hz: 0x03,  /*!< \brief 125Hz output rate. */
    QMI8658MagOdr_62_5Hz: 0x04, /*!< \brief 62.5Hz output rate. */
    QMI8658MagOdr_31_25Hz: 0x05 /*!< \brief 31.25Hz output rate. */
});


const QMI8658_MagDev = Object.freeze({
    MagDev_AKM09918: (0 << 3), /*!< \brief AKM09918. */
});


const QMI8658_AeOdr = Object.freeze({
    QMI8658AeOdr_1Hz: 0x00,   /*!< \brief 1Hz output rate. */
    QMI8658AeOdr_2Hz: 0x01,   /*!< \brief 2Hz output rate. */
    QMI8658AeOdr_4Hz: 0x02,   /*!< \brief 4Hz output rate. */
    QMI8658AeOdr_8Hz: 0x03,   /*!< \brief 8Hz output rate. */
    QMI8658AeOdr_16Hz: 0x04,  /*!< \brief 16Hz output rate. */
    QMI8658AeOdr_32Hz: 0x05,  /*!< \brief 32Hz output rate. */
    QMI8658AeOdr_64Hz: 0x06,  /*!< \brief 64Hz output rate. */
    QMI8658AeOdr_128Hz: 0x07, /*!< \brief 128Hz output rate. */
    /*!
     * \brief Motion on demand mode.
     *
     * In motion on demand mode the application can trigger AttitudeEngine
     * output samples as necessary. This allows the AttitudeEngine to be
     * synchronized with external data sources.
     *
     * When in Motion on Demand mode the application should request new data
     * by calling the QMI8658_requestAttitudeEngineData() function. The
     * AttitudeEngine will respond with a data ready event (INT2) when the
     * data is available to be read.
     */
    QMI8658AeOdr_motionOnDemand: 128
});


const QMI8658_LpfConfig = Object.freeze({
    QMI8658Lpf_Disable: 0, /*!< \brief Disable low pass filter. */
    QMI8658Lpf_Enable: 1  /*!< \brief Enable low pass filter. */
});


const QMI8658_StConfig = Object.freeze({
    QMI8658St_Disable: 0, /*!< \brief Disable high pass filter. */
    QMI8658St_Enable: 1 /*!< \brief Enable high pass filter. */
});


const QMI8658_LpfMode = Object.freeze({
    A_LSP_MODE_0: 0x00 << 1,
    A_LSP_MODE_1: 0x01 << 1,
    A_LSP_MODE_2: 0x02 << 1,
    A_LSP_MODE_3: 0x03 << 1,

    G_LSP_MODE_0: 0x00 << 5,
    G_LSP_MODE_1: 0x01 << 5,
    G_LSP_MODE_2: 0x02 << 5,
    G_LSP_MODE_3: 0x03 << 5
});


const QMI8658_Interrupt = Object.freeze({
    /*! \brief FIS INT1 line. */
    QMI8658_Int1: (0 << 6),
    /*! \brief FIS INT2 line. */
    QMI8658_Int2: (1 << 6)
});

const QMI8658_InterruptState = Object.freeze({
    QMI8658State_high: (1 << 7), /*!< Interrupt high. */
    QMI8658State_low: (0 << 7)   /*!< Interrupt low. */
});

const QMI8658_WakeOnMotionThreshold = Object.freeze({
    QMI8658WomThreshold_high: 128, /*!< High threshold - large motion needed to wake. */
    QMI8658WomThreshold_low: 32    /*!< Low threshold - small motion needed to wake. */
});

const QMI8658_Ctrl9Command = Object.freeze({
    QMI8658_Ctrl9_Cmd_NOP: 0X00,
    QMI8658_Ctrl9_Cmd_GyroBias: 0X01,
    QMI8658_Ctrl9_Cmd_Rqst_Sdi_Mod: 0X03,
    QMI8658_Ctrl9_Cmd_WoM_Setting: 0x08,
    QMI8658_Ctrl9_Cmd_AccelHostDeltaOffset: 0x09,
    QMI8658_Ctrl9_Cmd_GyroHostDeltaOffset: 0x0A,
    QMI8658_Ctrl9_Cmd_Dbg_WoM_Data_Enable: 0xF8,
});

class QMI8658 {

    setup(i2c) {
        this.i2c = i2c;
        this.log = logger.getLogger("QMI8658");
        this.QMI8658Config = QMI8658_init(this.i2c, this.log)
    }

    //TODO - parameterize for the two differnt unit options
    readXYZ() { //returns accel, gyro, timestamp?
        let acceleration = { x: 0.0, y: 0.0, z: 0.0 };
        let gyro = { x: 0.0, y: 0.0, z: 0.0 };

        //TODO - there is some timestamp logic, I guess to optimize away unecessary reads
        const readA = QMI8658_read_reg(this.i2c, this.QMI8658Config.slaveAddr, QMI8658Register.QMI8658Register_Ax_L, 12);

        let rawAcc = {
            x: (readA[1] << 8) | (readA[0]),
            y: (readA[3] << 8) | (readA[2]),
            z: (readA[5] << 8) | (readA[4])
        }

        let rawGyro = {
            x: (readA[7] << 8) | (readA[6]),
            y: (readA[9] << 8) | (readA[8]),
            z: (readA[11] << 8) | (readA[10])
        }


        // mg
        acceleration.x = (rawAcc.x * 1000.0) / this.QMI8658Config.acc_lsb_div;
        acceleration.y = (rawAcc.y * 1000.0) / this.QMI8658Config.acc_lsb_div;
        acceleration.z = (rawAcc.z * 1000.0) / this.QMI8658Config.acc_lsb_div;

        // dps
        gyro.x = (rawGyro.x * 1.0) / this.QMI8658Config.gyro_lsb_div;
        gyro.y = (rawGyro.y * 1.0) / this.QMI8658Config.gyro_lsb_div;
        gyro.z = (rawGyro.z * 1.0) / this.QMI8658Config.gyro_lsb_div;

        return {
            accel: acceleration,
            gyro: gyro
        }
    }

    readTemperature() {
        const resultArray = QMI8658_read_reg(this.i2c, this.QMI8658Config.slaveAddr, QMI8658Register.QMI8658Register_Tempearture_L, 2, this.log);
        const temp = (resultArray[1] << 8) | resultArray[0];
        const tempC = temp / 256.0;
        this.log.info("Read the temperature(", temp, ") =", tempC, "C")
        return tempC
    }

    // TODO - options/parameterize
    enableWakeOnMotion() {
        const interrupt = QMI8658_Interrupt.QMI8658_Int1; //GPIO23
        const initialState = QMI8658_InterruptState.QMI8658State_low;
        const threshold = QMI8658_WakeOnMotionThreshold.QMI8658WomThreshold_high;

        const blankingTime = 0x00;
        const blankingTimeMask = 0x3F;

        
        //Disable all sensors 
        QMI8658_write_reg(this.i2c, this.QMI8658Config.slaveAddr, QMI8658Register.QMI8658Register_Ctrl7, QMI8658_CTRL7_DISABLE_ALL);
        QMI8658_config_acc(this.i2c, this.QMI8658Config.slaveAddr,
            QMI8658_AccRange.QMI8658AccRange_2g,
            QMI8658_AccOdr.QMI8658AccOdr_LowPower_21Hz,
            QMI8658_LpfConfig.QMI8658Lpf_Disable,
            QMI8658_StConfig.QMI8658St_Disable);

        //let womCmd0 = QMI8658Register.QMI8658Register_Cal1_L; // WoM Threshold: absolute value in mg (with 1mg/LSB resolution)
        let womCmd1 = 0xFF;//threshold;
        let womCmd2 = 0x8F;//interrupt | initialState | (blankingTime & blankingTimeMask);
        this.log.error("Writing L to:", womCmd1)
        this.log.error("Writing H to:", womCmd2)
        QMI8658_write_reg(this.i2c, this.QMI8658Config.slaveAddr, QMI8658Register.QMI8658Register_Cal1_L, womCmd1);
        QMI8658_write_reg(this.i2c, this.QMI8658Config.slaveAddr, QMI8658Register.QMI8658Register_Cal1_H, womCmd2);

        //Ctrl9 Protocol
        QMI8658_write_reg(this.i2c, this.QMI8658Config.slaveAddr, QMI8658Register.QMI8658Register_Ctrl9, QMI8658_Ctrl9Command.QMI8658_Ctrl9_Cmd_WoM_Setting, this.log);
        QMI8658_write_reg(this.i2c, this.QMI8658Config.slaveAddr, QMI8658Register.QMI8658Register_Ctrl7, QMI8658_CTRL7_ACC_ENABLE);
        //QMI8658_enableSensors(this.i2c, this.QMI8658Config.slaveAddr, QMI8658_CTRL7_ACC_ENABLE);
        while(true) {
            const ctrl9StatusRead = QMI8658_read_reg(this.i2c, this.QMI8658Config.slaveAddr, QMI8658Register.QMI8658Register_Status1, 1, this.log);
            this.log.error("Recevied Ctrl9 status: ", JSON.stringify(ctrl9StatusRead, null, 2));
            //if the first bit is a 1 we're all set
            // if(ctrl9StatusRead[0] >> 0 & 1){ 
                break;
            // }
            // delay(100);
        }
    }

    disableWakeOnMotion() {
        QMI8658_enableSensors(this.i2c, this.QMI8658Config.slaveAddr, QMI8658_CTRL7_DISABLE_ALL);
        QMI8658_write_reg(this.i2c, this.QMI8658Config.slaveAddr, QMI8658Register.QMI8658Register_Cal1_L, 0);
    }

}

function QMI8658_init(i2c, log) {
    log.trace("Startup for IMU");
    let QMI8658_chip_id = 0x00;
    let QMI8658_revision_id = 0x00;
    const QMI8658_slave = [QMI8658_SLAVE_ADDR_L, QMI8658_SLAVE_ADDR_H];
    let QMI8658_slave_addr;
    let QMI8658Config = new Object();
    let iCount = 0;
    let retry = 0;

    //There are 2 possible addresses to try, this first pass tries to find the device. 
    while (iCount < 2) {
        QMI8658_slave_addr = QMI8658_slave[iCount];
        log.trace("Reading from: ", QMI8658_slave_addr.toString(16))
        retry = 0;

        while ((QMI8658_chip_id != 0x05) && (retry++ < 5)) {
            log.trace("Chip id", QMI8658_chip_id)
            try {
                const result = QMI8658_read_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_WhoAmI, 1, log);
                QMI8658_chip_id = result[0]
            } catch (e) {
                log.error(e);
            }
            log.trace("QMI8658Register_WhoAmI = ", QMI8658_chip_id);
        }
        if (QMI8658_chip_id == 0x05) {
            break;
        }
        iCount++;
    }
    const revisionResult = QMI8658_read_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_Revision, 1, log);
    QMI8658_revision_id = revisionResult[0]
    if (QMI8658_chip_id == 0x05) {
        log.trace("QMI8658_init slave=0x%x  QMI8658Register_WhoAmI=0x%x 0x%x", QMI8658_slave_addr, QMI8658_chip_id, QMI8658_revision_id);
        QMI8658_write_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_Ctrl1, 0x60, log);
        QMI8658Config.slaveAddr = QMI8658_slave_addr
        QMI8658Config.inputSelection = QMI8658_CONFIG_ACCGYR_ENABLE; //TODO - expose to setup
        QMI8658Config.accRange = QMI8658_AccRange.QMI8658AccRange_8g;
        QMI8658Config.accOdr = QMI8658_AccOdr.QMI8658AccOdr_1000Hz;
        QMI8658Config.gyrRange = QMI8658_GyrRange.QMI8658GyrRange_512dps; // QMI8658GyrRange_2048dps   QMI8658GyrRange_1024dps
        QMI8658Config.gyrOdr = QMI8658_GyrOdr.QMI8658GyrOdr_1000Hz;
        QMI8658Config.magOdr = QMI8658_MagOdr.QMI8658MagOdr_125Hz;
        QMI8658Config.magDev = QMI8658_MagDev.MagDev_AKM09918;
        QMI8658Config.aeOdr = QMI8658_AeOdr.QMI8658AeOdr_128Hz;
        log.info("Configuring QMI8658", JSON.stringify(QMI8658Config, null, 2));

        QMI8658_Config_apply(i2c, QMI8658Config, log);
        log.info("Post-Config values:", JSON.stringify(QMI8658Config, null, 2));
        let readResult = QMI8658_read_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_Ctrl1, 1, log);
        log.trace("QMI8658Register_Ctrl1=0x%x", readResult[0]);
        readResult = QMI8658_read_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_Ctrl2, 1, log);
        log.trace("QMI8658Register_Ctrl2=0x%x", readResult[0]);
        readResult = QMI8658_read_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_Ctrl3, 1, log);
        log.trace("QMI8658Register_Ctrl3=0x%x", readResult[0]);
        readResult = QMI8658_read_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_Ctrl4, 1, log);
        log.trace("QMI8658Register_Ctrl4=0x%x", readResult[0]);
        readResult = QMI8658_read_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_Ctrl5, 1, log);
        log.trace("QMI8658Register_Ctrl5=0x%x", readResult[0]);
        readResult = QMI8658_read_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_Ctrl6, 1, log);
        log.trace("QMI8658Register_Ctrl6=0x%x", readResult[0]);
        readResult = QMI8658_read_reg(i2c, QMI8658_slave_addr, QMI8658Register.QMI8658Register_Ctrl7, 1, log);
        log.trace("QMI8658Register_Ctrl7=0x%x", readResult[0]);

        return QMI8658Config;
    }
    else {
        log.error("QMI8658_init fail");
        throw new Error("Failed to initialize QMI8658")
    }
}


function QMI8658_Config_apply(i2c, config, log) {
    const fisSensors = config.inputSelection;
    //bitwise check if AE is enabled
    if (fisSensors & QMI8658_CTRL7_AE_ENABLE) {
        QMI8658_config_ae(i2c, config, config.aeOdr);
    } else {
        if (config.inputSelection & QMI8658_CTRL7_ACC_ENABLE) {
            let acc_lsb_div = QMI8658_config_acc(i2c, config.slaveAddr, config.accRange, config.accOdr, QMI8658_LpfConfig.QMI8658Lpf_Enable, QMI8658_StConfig.QMI8658St_Disable);
            config.acc_lsb_div = acc_lsb_div
        }
        if (config.inputSelection & QMI8658_CTRL7_GYR_ENABLE) {
            let gyro_lsb_div = QMI8658_config_gyro(i2c, config.slaveAddr, config.gyrRange, config.gyrOdr, QMI8658_LpfConfig.QMI8658Lpf_Enable, QMI8658_StConfig.QMI8658St_Disable);
            config.gyro_lsb_div = gyro_lsb_div
        }
    }

    if (config.inputSelection & QMI8658_CTRL7_MAG_ENABLE) {
        QMI8658_config_mag(i2c, config.slaveAddr, config.magDev, config.magOdr);
    }
    QMI8658_enableSensors(i2c, config.slaveAddr, fisSensors);
}

function QMI8658_enableSensors(i2c, slaveAddress, enableFlags) {
    if (enableFlags & QMI8658_CTRL7_AE_ENABLE) {
        enableFlags |= QMI8658_CTRL7_ACC_ENABLE | QMI8658_CTRL7_GYR_ENABLE;
    }

    QMI8658_write_reg(i2c, slaveAddress, QMI8658Register.QMI8658Register_Ctrl7, enableFlags & QMI8658_CTRL7_ENABLE_MASK);
}

function QMI8658_config_gyro(i2c, slaveAddress, range, odr, lpfEnable, stEnable) {
    // Set the CTRL3 register to configure dynamic range and ODR
    let ctl_dada;
    let gyro_lsb_div;

    // Store the scale factor for use when processing raw data
    switch (range) {
        case QMI8658_GyrRange.QMI8658GyrRange_32dps:
            gyro_lsb_div = 1024;
            break;
        case QMI8658_GyrRange.QMI8658GyrRange_64dps:
            gyro_lsb_div = 512;
            break;
        case QMI8658_GyrRange.QMI8658GyrRange_128dps:
            gyro_lsb_div = 256;
            break;
        case QMI8658_GyrRange.QMI8658GyrRange_256dps:
            gyro_lsb_div = 128;
            break;
        case QMI8658_GyrRange.QMI8658GyrRange_512dps:
            gyro_lsb_div = 64;
            break;
        case QMI8658_GyrRange.QMI8658GyrRange_1024dps:
            gyro_lsb_div = 32;
            break;
        case QMI8658_GyrRange.QMI8658GyrRange_2048dps:
            gyro_lsb_div = 16;
            break;
        case QMI8658_GyrRange.QMI8658GyrRange_4096dps:
            gyro_lsb_div = 8;
            break;
        default:
            range = QMI8658_GyrRange.QMI8658GyrRange_512dps;
            gyro_lsb_div = 64;
            break;
    }

    if (stEnable == QMI8658_StConfig.QMI8658St_Enable) {
        ctl_dada = range | odr | 0x80;
    } else {
        ctl_dada = range | odr;
    }
    QMI8658_write_reg(i2c, slaveAddress, QMI8658Register.QMI8658Register_Ctrl3, ctl_dada);

    // Conversion from degrees/s to rad/s if necessary
    // set LPF & HPF
    const readResult = QMI8658_read_reg(i2c, slaveAddress, QMI8658Register.QMI8658Register_Ctrl5, 1);
    ctl_dada = readResult[0];
    ctl_dada &= 0x0f;
    if (lpfEnable == QMI8658_LpfConfig.QMI8658Lpf_Enable) {
        ctl_dada |= QMI8658_LpfMode.G_LSP_MODE_3;
        ctl_dada |= 0x10;
    }
    else {
        ctl_dada &= ~0x10;
    }
    ctl_dada = 0x00;
    QMI8658_write_reg(i2c, slaveAddress, QMI8658Register.QMI8658Register_Ctrl5, ctl_dada);
    // set LPF & HPF

    return gyro_lsb_div
}

function QMI8658_config_mag(i2c, slaveAddress, device, odr) {
    QMI8658_write_reg(i2c, slaveAddress, QMI8658Register.QMI8658Register_Ctrl4, device | odr);
}


function QMI8658_config_acc(i2c, slaveAddress, range, odr, lpfEnable, stEnable) {
    let ctl_dada;
    let acc_lsb_div;

    switch (range) {
        case QMI8658_AccRange.QMI8658AccRange_2g:
            acc_lsb_div = (1 << 14);
            break;
        case QMI8658_AccRange.QMI8658AccRange_4g:
            acc_lsb_div = (1 << 13);
            break;
        case QMI8658_AccRange.QMI8658AccRange_8g:
            acc_lsb_div = (1 << 12);
            break;
        case QMI8658_AccRange.QMI8658AccRange_16g:
            acc_lsb_div = (1 << 11);
            break;
        default:
            range = QMI8658_AccRange.QMI8658AccRange_8g;
            acc_lsb_div = (1 << 12);
    }
    if (stEnable == QMI8658_StConfig.QMI8658St_Enable) {
        ctl_dada = range | odr | 0x80;
    } else {
        ctl_dada = range | odr;
    }

    QMI8658_write_reg(i2c, slaveAddress, QMI8658Register.QMI8658Register_Ctrl2, ctl_dada);
    // set LPF & HPF
    const readResult = QMI8658_read_reg(i2c, slaveAddress, QMI8658Register.QMI8658Register_Ctrl5, 1);
    ctl_dada = readResult[0]
    ctl_dada &= 0xf0;
    if (lpfEnable == QMI8658_LpfConfig.QMI8658Lpf_Enable) {
        ctl_dada |= QMI8658_LpfMode.A_LSP_MODE_3;
        ctl_dada |= 0x01;
    }
    else {
        ctl_dada &= ~0x01;
    }
    ctl_dada = 0x00;
    QMI8658_write_reg(i2c, slaveAddress, QMI8658Register.QMI8658Register_Ctrl5, ctl_dada);
    // set LPF & HPF
    return acc_lsb_div
}


function QMI8658_config_ae(i2c, config, odr) {
    let acc_lsb_div = QMI8658_config_acc(i2c, config.slaveAddr, config.accRange, config.accOdr, QMI8658_LpfConfig.QMI8658Lpf_Enable, QMI8658_StConfig.QMI8658St_Disable);
    let gyro_lsb_div = QMI8658_config_gyro(i2c, config.slaveAddr, config.gyrRange, config.gyrOdr, QMI8658_LpfConfig.QMI8658Lpf_Enable, QMI8658_StConfig.QMI8658St_Disable);
    QMI8658_config_mag(i2c, config.slaveAddr, config.magDev, config.magOdr);
    QMI8658_write_reg(i2c, config.slaveAddr, QMI8658Register.QMI8658Register_Ctrl6, odr);
    config.acc_lsb_div = acc_lsb_div;
    config.gyro_lsb_div = gyro_lsb_div;
    return config
}

/**
 * READ operation 
 * @param {*} i2c 
 * @param {*} slaveAddress
 * @param {*} registerAddress 
 * @param {*} length 
 * @param {*} log - Optional for tracing behaviors
 * @returns 
 */
function QMI8658_read_reg(i2c, slaveAddress, registerAddress, length, log = undefined) {
    if (log != undefined && log.getLevel() <= logger.levels.TRACE) {
        log.trace("Read request on i2c: ", slaveAddress, registerAddress, length)
    }
    const responseArray = i2c.memRead(length, slaveAddress, registerAddress);
    if (log != undefined && log.getLevel() <= logger.levels.TRACE) {
        log.trace("Response:", JSON.stringify(responseArray, null, 2))
    }
    return responseArray;
}

/**
 * WRITE operation
 * @param {*} i2c 
 * @param {*} slaveAddress
 * @param {*} registerAddress 
 * @param {*} data 
 * @param {*} log - Optional for tracing behaviors
 * @returns 
 */
function QMI8658_write_reg(i2c, slaveAddress, registerAddress, data, log = undefined) {
    if (log != undefined && log && log.getLevel() <= logger.levels.TRACE) {
        log.trace("Write request on i2c: ", registerAddress, data)
    }
    const bytesWritten = i2c.memWrite(new Uint8Array([data]), slaveAddress, registerAddress);
    if (log != undefined && log.getLevel() <= logger.levels.TRACE) {
        log.trace("Written:", bytesWritten)
    }
    return bytesWritten;
}

exports.QMI8658 = QMI8658;