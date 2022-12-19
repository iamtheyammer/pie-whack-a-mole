#include <Arduino.h>
#include <ArduinoJson.h>
#include <mole.h>

uint32_t timeout_after_raise = 250;
uint32_t timeout_after_hit = 2750;
uint32_t timeout_after_timeup = 1250;

Mole::Mole(int sp, int bp) {
  pinMode(buttonPin, INPUT);
  pinMode(solenoidPin, OUTPUT);

  digitalWrite(solenoidPin, LOW);

  solenoidPin = sp;
  buttonPin = bp;
  isUp = false;
  upFor = 0;
  timeUp = 0;
  timeout = 0;
}

int Mole::lower(unsigned long time) {
  digitalWrite(solenoidPin, LOW);

  int upDuration = time - timeUp;

  timeUp = 0;
  isUp = false;
  upFor = 0;
  timeout = time + timeout_after_hit;

  return upDuration;
}

bool Mole::raiseFor(unsigned long currentTime, int ms) {
  // raise the mole for ms

  // raise the mole
  digitalWrite(solenoidPin, HIGH);
 
  timeUp = currentTime;
  upFor = ms;
  timeout = currentTime + timeout_after_raise;
  
  if (isUp) {
    return false;
  }

  isUp = true;
  return isUp;
}

bool Mole::lowerIfTimePassed(unsigned long time) {
  // lower the mole if it's been up for long enough

  if (isUp && time - timeUp >= upFor) {
    lower(time);
    timeout = time + timeout_after_timeup;
    return true;
  }

  return false;
}

void Mole::print() {
  serializeJson(toJson(), Serial);
  Serial.println();
}

StaticJsonDocument<64> Mole::toJson() {
  StaticJsonDocument<64> doc;

  doc["type"] = "Mole";
  doc["solenoid_pin"] = solenoidPin;
  doc["button_pin"] = buttonPin;
  doc["is_up"] = isUp;
  doc["time_up"] = timeUp;
  doc["up_for"] = upFor;

  return doc;
}

void Mole::tickTimeout(unsigned long time) {
  // no timeout
  if (timeout == 0) {
    return;
  }

  // timeout is over
  if (time >= timeout) {
    timeout = 0;
  }
}

bool Mole::timeoutIsActive(unsigned long time) {
  if (timeout == 0) {
    return false;
  }

  return time < timeout;
}

bool Mole::buttonPinIsHigh() {
  return digitalRead(buttonPin) == HIGH;
}
