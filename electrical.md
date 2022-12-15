---
title: Whac-A-Mole
layout: template
filename: electrical.md
--- 
[<-Back](./index.md) 

## Overall Circuit Overview

The circuit can be brokwn down into three main steps:

1. The Arduino, for some reason (could be a hit, or it choosing for the mole to go up) chooses to change the state of a mole.
2. The Arduino sends a signal (by setting a pin to high or low) to the MOSFET, turning it on/off and allowing/blocking current flow through the solenoid.
3. The solenoid generates a magnetic field, which moves the plunger in the pneumatic system and causes the mole to pop up through the hole.

As the game continues, the Arduino controls the movement of the moles by turning the MOSFETs on and off. The Arduino will also send data when moles are hit by the player over the serial connection to the Raspberry Pi, which will display the score and other information on the scoreboard.

## Arduino Firmware Overview

The firmware on the Arduino has three main responsibilities:

- Randomly putting moles up and down
- Checking for button presses (when moles are hit), then lowering moles when they're pressed
- Communicating valid hits (button presses when the mole is up) to the Pi, with how long it took for the player to hit the mole

We use one external library: Benoit Blanchon's excellent [ArduinoJSON](https://arduinojson.org/) library.
This allows us to serialize output to the Pi and deserialize input from the Pi.

### The `Mole` Class

In order to do that, we wrote a class that controls a Mole. It has a few fields and methods:

```cpp
class Mole
{
public:
  // pin the mole's solenoid is on
  int solenoidPin;
  // pin the mole's button is on
  int buttonPin;
  // if the mole is up
  bool isUp;
  // when the mole went up
  unsigned long timeUp;
  // how long the mole should be up for
  uint32_t upFor;
  // time until the mole can be pressed / go up
  unsigned long timeout;
  

  /* 
   Create a new mole.
   @param solenoidPin The pin that the mole's solenoid is on.
   @param buttonPin The pin that the mole's button is on.
   */
  Mole(int solenoidPin, int buttonPin);
  bool raiseFor(unsigned long currentTime, int ms); // raise the mole for ms
  bool lowerIfTimePassed(unsigned long time); // lower the mole if it has timed out
  int lower(unsigned long time); // lower the mole whether it has timed out or not
  void tickTimeout(unsigned long time); // clear the timeout if it has elapsed
  bool timeoutIsActive(unsigned long time); // check whether there is active timeout
  bool buttonPinIsHigh(); // check whether the mole's button is being pressed

  void print(); // print the mole to the console, useful for debugging
  StaticJsonDocument<64> toJson(); // return a JSON representation of the mole, useful for debugging
};
```

### Setup and Configuration

Some configuration settings are available and static as the code runs:

- `int maxMolesUp` configures the maximum number of moles up at any one time
- `int moleUpTimeBetweenMs[2]` is a tuple containing the minimum and maximum amounts of time in milliseconds that a mole can go up for. Amounts of time are chosen randomly using the first number in the tuple as the lowest possible value and the second number in the tuple as the maximum possible value.
- `bool debug` determines whether the firmware will print debug messages to the console

There are also some settings for the moles that effect gameplay:

- `uint32_t timeout_after_raise` controls how long a mole has to wait before its button being pressed counts as a hit. Since the pneumatics exert so much force on the moles, the buttons often got pressed as they got shot up. This timeout ensures that it's a _player_ hitting the mole, not itself
- `uint32_t timeout_after_hit` controls how long a mole has to wait after it has been hit down to come up again. It ensures that the same mole doesn't just go up, get hit, go down, and go back up immediately. We found that this made the game **far** more fun
- `uint32_t timeout_after_timeup` controls how long a mole waits after it comes down when a player didn't hit it.

A few global variables also hold some state:

- `bool gameRunning` tells whether the game is running: if not, the entire game loop is skipped
- `StaticJsonDocument<64> moleHitDocument` holds a JSON document in memory that we'll change and serialize to efficiently tell the Pi that a mole has been hit
- `Mole *moles[6]` holds instances of all 6 moles, initialized with their solenoid pin and button pin

Finally, the `setup()` function runs which just initializes Serial communication, and sets the Serial timeout to 10ms. It also sets the `moleHitDocument.type` property to `mole_hit`, which will never change.

### The Game Loop

The game loop, which just returns if `gameRunning` is false, has all of the core logic.

1. First, we call the `millis()` function and assign it to a variable. Since we'll use this value many times, we can ensure that the value is always the same throughout a single 

Each one allows the game loop (implemented in the Arduino `loop()`) to control the mole.

I made a whack-a-mole game with six moles that can go up and down independently. Each mole is controlled by pneumatics connected to a solenoid controlled by a MOSFET connected to a digital pin on an Arduino Uno. The Arduino code has a "Mole class" which controls each mole. During each loop, the Arduino:
- checks if any moles have timed out without being hit, and lowers them
- raises a mole if less than three moles are currently up
- clears moles' timeouts if they have elapsed
- tells the Raspberry Pi if any moles have been hit

Can you write a few paragraphs about how it works with code samples? Don't use words like "likely"-- I already wrote the code, and don't write out the full class-- just samples.

## Sprint 1

## Sprint 1

<div style="display:flex;flex-direction:row;justify-content:center;padding:10px;max-width:600px">
<img src="website-images/mechanical/sprint_1-1.gif" style="width:auto;height:450px;padding:5px;max-width:100%">
<img src="website-images/mechanical/sprint_1-2.gif" style="width:auto;height:450px;padding:5px;max-width:100%">
</div>

In the first sprint, we focused on getting the Arduino to control a single mole using a servo motor. This involved connecting the servo motor to the Arduino and writing the necessary code to control the movement of the servo. The team was able to successfully get the servo to move the mole up and down, simulating the movement of a mole in a real-life whack-a-mole game, albeit much more slowly than we'd like in the final version.

## Sprint 2

<div style="display:flex;flex-direction:row;justify-content:center;padding:10px;max-width:600px">
<img src="website-images/mechanical/sprint_1-1.gif" style="width:auto;height:450px;padding:5px;max-width:100%">
<img src="website-images/mechanical/sprint_1-2.gif" style="width:auto;height:450px;padding:5px;max-width:100%">
</div>

In the second sprint, the team added the pneumatics to the circuit, connecting the Arduino to a MOSFET that controlled a solenoid, finally controlling a pneumatic system that uses compressed air to push the mole up and down through the hole. This allowed the mole to move more quickly and smoothly, creating a more realistic, challenging, and fun game.

## Sprint 3

<div style="display:flex;flex-direction:row;justify-content:center;padding:10px;max-width:600px">
<img src="website-images/mechanical/sprint_1-1.gif" style="width:auto;height:450px;padding:5px;max-width:100%">
<img src="website-images/mechanical/sprint_1-2.gif" style="width:auto;height:450px;padding:5px;max-width:100%">
</div>

In the third sprint of the project, we expanded the circuit from one mole to six moles. This involved adding multiple solenoids, MOSFETs, and buttons to the circuit and writing code to control the movement of each mole individually and randomly. We got the Arduino to control the movement of all six moles, allowing multiple moles to go up and down with a hit or randomly with time, which increased the challenge and excitement of the game.

## Final Sprint

<div style="display:flex;flex-direction:row;justify-content:center;padding:10px;max-width:600px">
<img src="website-images/mechanical/sprint_1-1.gif" style="width:auto;height:450px;padding:5px;max-width:100%">
<img src="website-images/mechanical/sprint_1-2.gif" style="width:auto;height:450px;padding:5px;max-width:100%">
</div>

In the final sprint of the project, we focused on getting the moles to move up and down randomly, as this is an essential element of the game. To achieve this, we wrote code to randomly move each mole, simulating the unpredictable behavior of real moles.

The team also spent a significant amount of time debugging and playtesting the game to ensure that it was fun and challenging to play. This involved identifying and fixing any issues with the code or the circuit, as well as soliciting feedback from players and making adjustments to the game based on their suggestions.

As we playtested, we found that in addition to getting the moles to move up and down randomly, we also had to write code to make each mole time out for a short period after it gets hit or goes down randomly. This prevents players from hitting the same mole multiple times in quick succession and makes the game more challenging, further increasing randomness.

To implement this, we wrote code that kept track of the state of each mole (up or down) and the time it went into that state. When a mole was hit or went down randomly, the code would cause the mole to stay down for a predetermined amount of time before allowing it to pop up again. This created a more realistic and challenging gameplay experience, as players had to wait for the moles to pop up before they could hit them, and it made sure that one mole doesn't just keep coming up again and again.

Overall, the code that made each mole time out added an extra level of complexity and challenge to the game, making it more realistic and engaging for players. This was an important element of the final sprint, as it helped to ensure that the game was fun and satisfying to play. It was really surprising how much of a difference this timeout code made.