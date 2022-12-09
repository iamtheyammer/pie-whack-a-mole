from flask import Flask, render_template
from flask_sock import Sock
import json
from Serial import SerialRead, SerialWrite
from time import sleep
import sqlite3
import os

dir_path = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__, static_folder='../web-ui/build', static_url_path='/')
sock = Sock(app)
count = 0


def update_score_message(sock, num):
    msg = json.dumps({
        'action': 'update_score',
        'score': num,
    })
    # print(f"<-- {msg}")
    sock.send(msg)


def scores_to_json(cursor):
    cursor.execute("select * from scores order by score desc")
    scores = cursor.fetchall()
    lst = [{'person': name, 'value': score} for name, score in scores]
    return lst


def update_leaderboard_message(sock, ldb):
    msg = json.dumps({
        'action': 'update_leaderboard',
        'leaderboard': ldb,
    })
    sock.send(msg)


def receive_ws(sock, cursor, connection):
    global count
    msg = sock.receive()
    # TODO: have a global game_state variable which changes when the score is being counted, etc. It will change on a received call from the ws.
    if msg is not None:
        msg = json.loads(msg)
        if msg['action'] == 'game_state':
            if msg['gameState'] == "start_game":
                args = (msg['currentPlayer'], 0, count, count)
                cursor.execute(
                    f"insert into scores (person, score) values (?, ?) ON CONFLICT (person) DO UPDATE SET score = ? WHERE ? > score", args)
                connection.commit()
            elif msg['gameState'] == "end_game":
                args = (msg['currentPlayer'], 0, count, count)
                cursor.execute(
                    f"insert into scores (person, score) values (?, ?) ON CONFLICT (person) DO UPDATE SET score = ? WHERE ? > score", args)
                connection.commit()
        elif msg['action'] == 'reset_leaderboard':
            cursor.execute("delete from scores where score >= 0")
            connection.commit()
        else:
            print("unknown action")


@sock.route('/socket')
def echo(sock):
    connection = sqlite3.connect(f'{dir_path}/ScoreDB/scores.db')
    cursor = connection.cursor()
    cursor.execute(
        "create table if not exists scores (person text PRIMARY KEY, score integer)")
    while True:
        global count
        update_leaderboard_message(sock, scores_to_json(cursor))
        count += 1
        update_score_message(sock, count)
        receive_ws(sock, cursor, connection)
        sleep(1)
        # score = SerialRead()["sensorVoltage"]


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run(host='0.0.0.0')
