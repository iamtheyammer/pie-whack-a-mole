#include <Arduino.h>
#include <ArduinoJson.h>
#include <mole.h>

/* SETTINGS */

int maxMolesUp = 3;
int moleUptimeBetweenMs[2] = {1000, 2500};
bool debug = false;
/* END SETTINGS */

Mole *moles[6] = {
    new Mole(13, 2),
    new Mole(9, 6),
    new Mole(8, 7),
    new Mole(11, 4),
    new Mole(10, 3),
    new Mole(12, 5)
};

bool gameRunning = true;

StaticJsonDocument<64> moleHitDocument;

void sendMoleHit(int uptime)
{
  moleHitDocument["uptime_ms"] = uptime;

  serializeJson(moleHitDocument, Serial);
  Serial.println();
}

// mole ISRs (interrupt service routines)

void moleISR(Mole *mole)
{
  // only works for moles that are up
  if (!mole->isUp)
  {
    return;
  }

  int uptime = mole->lower(millis());

  sendMoleHit(uptime);
}

void startGame()
{
  gameRunning = true;
}

void stopGame()
{
  gameRunning = false;

  // lower all moles
  for (uint8_t i = 0; i < 6; i++)
  {
    moles[i]->lower(millis());
    moles[i]->timeout = 0;
  }

  // reset game state
}

void printMoleStatus()
{
  // Serial.println("----- Mole statuses -----");
  // Serial.println("| 0 | 1 | 2 | 3 | 4 | 5 |");
  Serial.print("| ");
  for (uint8_t i = 0; i < 6; i++)
  {
    Serial.print(moles[i]->isUp ? "U" : "D");
    Serial.print(" | ");
  }

  Serial.println();

  // Serial.println("\n-------------------------");
}

void setup()
{
  // init serial communication
  Serial.begin(9600);
  Serial.setTimeout(10);

  moleHitDocument["type"] = "mole_hit";
}



void loop()
{
  if (!gameRunning)
  {
    return;
  }

  unsigned long time = millis();

  bool didLower = false;
  int numMolesUp = 0;
  for (uint8_t i = 0; i < 6; i++)
  {
    moles[i]->tickTimeout(time);
    if (moles[i]->isUp)
    {
      if(moles[i]->lowerIfTimePassed(time)) {
        didLower = true;
        if(debug) {
          Serial.print("Time is up for mole ");
          Serial.print(i);
          Serial.print(", lowering. Current time: ");
          Serial.println(time);
          printMoleStatus();
        }

        // don't need to increment numMolesUp, since we're lowering one
        // and the timeout is guaranteed active, we just set one when we lowered
      } else {
        // check if the mole's being hit
        if (!moles[i]->timeoutIsActive(time) && moles[i]->buttonPinIsHigh())
        {
          int uptime = moles[i]->lower(time);
          sendMoleHit(uptime);
          
          if(debug) {
            Serial.print("Mole ");
            Serial.print(i);
            Serial.print(" was hit, lowering. Current time: ");
            Serial.println(time);
            printMoleStatus();
          }
          
        } else {
          numMolesUp++;
        }
      }
    }
  }

  if (didLower) {
    return;
  }

  if (numMolesUp < maxMolesUp)
  {
    int moleIndexToRaise = random(0, 6);
    Mole* moleToRaise = moles[moleIndexToRaise];

    if (moleToRaise->isUp || moleToRaise->timeoutIsActive(time))
    {
      if(debug) {
        Serial.print("-> Can't raise mole ");
        Serial.print(moleIndexToRaise);
        if(moleToRaise->isUp) {
          Serial.print(", already up. Current time: ");
        } else if(moleToRaise->timeoutIsActive(time)) {
          Serial.print(", timeout active for another ");
          Serial.print(moleToRaise->timeout - time);
          Serial.print("ms. Current time: ");
        }
        Serial.println(time);
      }
      return;
    }

    int timeToRaise = random(moleUptimeBetweenMs[0], moleUptimeBetweenMs[1]);
    moleToRaise->raiseFor(time, timeToRaise);

    if(debug) {
      Serial.print("Raising mole ");
      Serial.print(moleIndexToRaise);
      Serial.print(" for ");
      Serial.print(timeToRaise);
      Serial.print(", current time: ");
      Serial.println(time);
      printMoleStatus();
    }
    
    moles[0]->raiseFor(time, timeToRaise);
  }

  if(debug) {
    // printMoleStatus();
  }
}

// called when there's serial data available
void serialEvent()
{
  // we're using the builtin LED to show us when the system is processing input
  digitalWrite(LED_BUILTIN, HIGH);
  // read input string
  String raw_input = Serial.readString();
  // remove whitespace
  raw_input.trim();

  // allocate memory to deserialize input and serialize output
  StaticJsonDocument<128> input;
  StaticJsonDocument<64> output;
  // track error and report if the input isn't valid JSON
  DeserializationError err = deserializeJson(input, raw_input);

  // stop if json is invalid
  if (err.code() != DeserializationError::Ok)
  {
    output["status"] = "error";
    output["error"] = "unable to deserialize json from serial input";

    serializeJson(output, Serial);
    Serial.println();

    return;
  }

  String action = input["action"];
  output["action"] = action;

  if (action == "start_game")
  {
    if (gameRunning)
    {
      output["status"] = "error";
      output["error"] = "game already running";
    }
    else
    {
      startGame();
      output["status"] = "success";
    }
  }
  else if (action == "stop_game")
  {
    if (!gameRunning)
    {
      output["status"] = "error";
      output["error"] = "game not running";
    }
    else
    {
      stopGame();
      output["status"] = "success";
    }
  }
  else if (action == "get_status")
  {
    JsonArray jMoles = output.createNestedArray("moles");

    for (int i = 0; i < 6; i++)
    {
      jMoles.add(moles[i]->toJson());
    }

    output["game_running"] = gameRunning;
    // output["game_started_at"] = gameStartedAt;

    output["status"] = "success";
  }
  else
  {
    output["status"] = "error";
    output["error"] = "unknown action";
  }

  serializeJson(output, Serial);
  Serial.println();
}
