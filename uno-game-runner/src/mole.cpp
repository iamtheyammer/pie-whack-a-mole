#include <Arduino.h>
#include <ArduinoJson.h>
#include <mole.h>

Mole::Mole(int sp, int bp) {
  pinMode(buttonPin, INPUT);
  pinMode(solenoidPin, OUTPUT);

  digitalWrite(solenoidPin, LOW);

  solenoidPin = sp;
  buttonPin = bp;
  isUp = false;
  upFor = 0;
  timeUp = 0;
}

int Mole::lower(int time) {
  digitalWrite(solenoidPin, LOW);

  int upDuration = time - timeUp;

  timeUp = 0;
  isUp = false;
  upFor = 0;

  return upDuration;
}

bool Mole::raiseFor(int currentTime, int ms) {
  // raise the mole for ms

  // raise the mole
  digitalWrite(solenoidPin, HIGH);
 
  timeUp = currentTime;
  upFor = ms;
  
  if (isUp) {
    return false;
  }

  isUp = true;
  return isUp;
}

bool Mole::lowerIfTimePassed(int time) {
  // lower the mole if it's been up for long enough

  if (isUp && time - timeUp >= upFor) {
    lower(time);
    return true;
  }

  return false;
}

void Mole::print() {
  serializeJson(toJson(), Serial);
  Serial.println();
}

JsonObject Mole::toJson() {
  StaticJsonDocument<64> doc;

  doc["type"] = "Mole";
  doc["solenoid_pin"] = solenoidPin;
  doc["button_pin"] = buttonPin;
  doc["is_up"] = isUp;
  doc["time_up"] = timeUp;
  doc["up_for"] = upFor;

  return doc.as<JsonObject>();
}
