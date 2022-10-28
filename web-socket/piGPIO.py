import RPI.GPIO as GPIO


class piGPIO:
    def __init__(self):
        GPIO.setmode(GPIO.BOARD)
        GPIO.setwarnings(False)

    def setPin(self, pin):
        GPIO.setup(pin, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)

    def getPin(self, pin):
        return GPIO.input(pin)

    def cleanup(self):
        GPIO.cleanup()
