from flask import Flask, render_template
from flask_sock import Sock
import json
from gpiozero import Button


app = Flask(__name__, static_folder='../web-ui/build', static_url_path='/')
sock = Sock(app)


def message():
    num += 1
    msg = json.dumps({
        'action': 'update_score',
        'score': num
    })
    print(f"<-- {msg}")
    return msg


@sock.route('/socket')
def echo(sock):
    while True:
        Button(2).when_pressed = lambda: sock.send(message())


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    global num
    num = 0
    app.run()
