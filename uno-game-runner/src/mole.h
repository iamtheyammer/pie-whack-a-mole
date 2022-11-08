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
  int timeUp;
  // how long the mole should be up for
  int upFor;

  /* 
   Create a new mole.

   @param solenoidPin The pin that the mole's solenoid is on.
   @param buttonPin The pin that the mole's button is on.
   */
  Mole(int solenoidPin, int buttonPin);
  bool raiseFor(int currentTime, int ms);
  bool lowerIfTimePassed(int time);
  int lower(int time);

  void print();
  JsonObject toJson();
};
