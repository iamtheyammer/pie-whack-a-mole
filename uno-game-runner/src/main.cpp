#include <Arduino.h>
#include <ArduinoJson.h>
#include <mole.h>

/* SETTINGS */

int maxMolesUp = 3;
int moleUptimeBetweenMs[2] = {2000, 7500};

/* END SETTINGS */

Mole *moles[6] = {
    new Mole(0, 8),
    new Mole(1, 9),
    new Mole(2, 10),
    new Mole(3, 11),
    new Mole(4, 12),
    new Mole(5, 13)};

int numMolesUp = 0;
bool gameRunning = true;
int gameStartedAt = 0;

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
  int uptime = mole->lower(millis());

  sendMoleHit(uptime);
}

void moleisr0() { moleISR(moles[0]); }
void moleisr1() { moleISR(moles[1]); }
void moleisr2() { moleISR(moles[2]); }
void moleisr3() { moleISR(moles[3]); }
void moleisr4() { moleISR(moles[4]); }
void moleisr5() { moleISR(moles[5]); }

void startGame()
{
  gameRunning = true;
  gameStartedAt = millis();
}

void stopGame()
{
  // lower all moles
  for (int i = 0; i < 6; i++)
  {
    moles[i]->lower(millis());
  }

  // reset game state
  numMolesUp = 0;
  gameRunning = false;
}

// void printMoleStatus() {
//   // Serial.println("----- Mole statuses -----");
//   // Serial.println("| 0 | 1 | 2 | 3 | 4 | 5 |");
//   Serial.print("| ");
//   for (int i = 0; i < 6; i++) {
//     Serial.print(moles[i]->isUp ? "U" : "D");
//     Serial.print(" | ");
//   }

//   Serial.println();

//   // Serial.println("\n-------------------------");
// }

void setup()
{
  // init serial communication
  Serial.begin(9600);
  Serial.setTimeout(10);

  moleHitDocument["type"] = "mole_hit";

  // attach interrupts
  attachInterrupt(digitalPinToInterrupt(moles[0]->buttonPin), moleisr0, RISING);
  attachInterrupt(digitalPinToInterrupt(moles[1]->buttonPin), moleisr1, RISING);
  attachInterrupt(digitalPinToInterrupt(moles[2]->buttonPin), moleisr2, RISING);
  attachInterrupt(digitalPinToInterrupt(moles[3]->buttonPin), moleisr3, RISING);
  attachInterrupt(digitalPinToInterrupt(moles[4]->buttonPin), moleisr4, RISING);
  attachInterrupt(digitalPinToInterrupt(moles[5]->buttonPin), moleisr5, RISING);
}

void loop()
{
  if (!gameRunning)
  {
    return;
  }

  int time = millis();

  for (int i = 0; i < 6; i++)
  {
    if (moles[i]->lowerIfTimePassed(time))
    {
      // Serial.println("time is up for mole " + String(i) + ", lowered");
      // printMoleStatus();
      numMolesUp--;
    }
  }

  // now, choose how many moles to raise
  if (numMolesUp < maxMolesUp)
  {
    int moleToRaise = random(0, 6);

    while (moles[moleToRaise]->isUp)
    {
      moleToRaise = random(0, 6);
    }

    int timeToRaise = random(moleUptimeBetweenMs[0], moleUptimeBetweenMs[1]);
    moles[moleToRaise]->raiseFor(time, timeToRaise);
    numMolesUp++;

    // Serial.println("raised  " + String(moleToRaise));
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
    output["game_started_at"] = gameStartedAt;

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
