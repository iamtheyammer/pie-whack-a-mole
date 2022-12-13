from flask import Flask
from flask_sock import Sock
import json
from Serial import SerialRead, SerialWrite
import sqlite3
import os
from time import sleep

dir_path = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__, static_folder='../web-ui/build', static_url_path='/')
sock = Sock(app)
total_time = 15000

def update_score_message(sock, num):
    msg = json.dumps({
        'action': 'update_score',
        'score': num,
    })
    sock.send(msg)
    print(msg)


def scores_to_json(cursor):
    cursor.execute("select * from scores order by score desc")
    scores = cursor.fetchall()
    lst = [{'person': name, 'value': score} for name, score in scores]
    return lst

def calculate_score(serial_read):
    if serial_read is not None:
        return (total_time - serial_read["uptime_ms"]) // 100
    else:
        return 0


def update_leaderboard_message(sock, ldb):
    msg = json.dumps({
        'action': 'update_leaderboard',
        'leaderboard': ldb,
    })
    sock.send(msg)


def receive_ws(sock, cursor, connection, serial_score, game_state):
    # add 1 second timeout to prevent blocking
    msg = sock.receive(timeout=0.1)
    print(msg)
    if msg is not None:
        msg = json.loads(msg)
        if msg['action'] == 'game_state':
            if msg['gameState'] == "playing_game":
                args = (msg['currentPlayer'], 0, serial_score, serial_score)
                cursor.execute(
                    f"insert into scores (person, score) values (?, ?) ON CONFLICT (person) DO UPDATE SET score = ? WHERE ? > score", args)
                connection.commit()
                update_leaderboard_message(sock, scores_to_json(cursor))
                SerialWrite('{"action": "start_game"}')
                return serial_score, "playing_game"
            elif msg['gameState'] == "end_game":
                args = (msg['currentPlayer'], 0, serial_score, serial_score)
                cursor.execute(
                    f"insert into scores (person, score) values (?, ?) ON CONFLICT (person) DO UPDATE SET score = ? WHERE ? > score", args)
                connection.commit()
                update_leaderboard_message(sock, scores_to_json(cursor))
                SerialWrite('{"action": "stop_game"}')
                return 0, "end_game"
        elif msg['action'] == 'reset_leaderboard':
            cursor.execute("delete from scores where score >= 0")
            connection.commit()
            update_leaderboard_message(sock, scores_to_json(cursor))
            return 0, "end_game"
        else:
            print(f"unknown --> {msg}")
            return serial_score, "end_game"
    elif game_state == "playing_game":
        return serial_score, "playing_game"
    return serial_score, "end_game"


@sock.route('/socket')
def echo(sock):
    serial_score = 0
    game_state = "end_game"
    connection = sqlite3.connect(f'{dir_path}/ScoreDB/scores.db')
    cursor = connection.cursor()
    cursor.execute(
        "create table if not exists scores (person text PRIMARY KEY, score integer)")
    while True:
        serial_read = SerialRead()
        if game_state != "end_game":
            serial_score += calculate_score(serial_read)
        update_score_message(sock, serial_score)
        serial_score, game_state = receive_ws(sock, cursor, connection, serial_score, game_state)
        


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run(host='0.0.0.0')
