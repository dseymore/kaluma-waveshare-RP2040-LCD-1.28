// Graphics & Fonts
var font = require('simple-fonts/minimal');

class SplashScreen {

    render(gc, buffered = false) {
        if (buffered) {
            gc.clearScreen();
        }
        gc.setFont(font);
        gc.setFontScale(4, 4)
        gc.setFontColor(gc.color16(0, 255, 255));
        gc.drawText(30, 50, "Hello");
        gc.drawText(30, 80, "World");
        if (buffered) {
            gc.display();
        }
    }
}

exports.SplashScreen = SplashScreen;