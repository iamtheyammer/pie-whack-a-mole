#include <ArduinoJson.h>

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
  bool raiseFor(unsigned long currentTime, int ms);
  bool lowerIfTimePassed(unsigned long time);
  int lower(unsigned long time);
  void tickTimeout(unsigned long time);
  bool timeoutIsActive(unsigned long time);
  bool buttonPinIsHigh();

  void print();
  StaticJsonDocument<64> toJson();
};
