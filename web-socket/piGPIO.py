from gpiozero import Button


class Button(Button):
    def __init__(self, pin):
        super(Button, self).__init__(pin)
        self.when_pressed = self.when_pressed
        self.when_released = self.when_released

    def when_pressed(self):
        print("Pressed")

    def when_released(self):
        print("Released")
