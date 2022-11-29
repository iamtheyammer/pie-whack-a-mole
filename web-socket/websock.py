from flask import Flask, render_template
from flask_sock import Sock
import json
from Serial import SerialRead, SerialWrite
from time import sleep
import sqlite3

# app = Flask(__name__, static_folder='../web-ui/build', static_url_path='/')
app = Flask(__name__)
sock = Sock(app)
count = 0
scores = [
    {"person": "Clay", "value": 1},
    {"person": "Tyler", "value": 2},
    {"person": "Sam", "value": 3},
    {"person": "Adhishri", "value": 4},
    {"person": "Anmol", "value": 5},
    {"person": "Siddharth", "value": 6},
    {"person": "Ajay", "value": 7},
    {"person": "Vijay", "value": 8},
]


def update_score_message(sock, num):
    msg = json.dumps({
        'action': 'update_score',
        'score': num,
    })
    print(f"<-- {msg}")
    sock.send(msg)


def update_leaderboard_message(sock, ldb):
    msg = json.dumps({
        'action': 'update_leaderboard',
        'leaderboard': ldb,
    })
    print(f"<-- {msg}")
    sock.send(msg)


@sock.route('/socket')
def echo(sock):
    connection = sqlite3.connect('ScoreDB/scores.db')
    cursor = connection.cursor()
    cursor.execute(
        "create table if not exists scores (person text PRIMARY KEY, score integer)")
    cursor.execute("delete from scores where score >=0")
    while True:
        global count
        if count < len(scores):
            print("did")
            args = (scores[count]['person'], scores[count]['value'], scores[count]['value'], scores[count]['value'])
            cursor.execute(
                f"insert into scores (person, score) values (?, ?) ON CONFLICT (person) DO UPDATE SET score = ? WHERE ? > score", args)
            connection.commit()
            update_leaderboard_message(sock, scores[:count])
        elif count == len(scores):
            cursor.execute(
                "select * from scores")
            search = cursor.fetchall()
            print(search)
            connection.close()
        count += 1
        update_score_message(sock, count)
        sleep(1)
        # score = SerialRead()["sensorVoltage"]


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run(host='0.0.0.0')
