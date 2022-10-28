from flask import Flask, render_template
from flask_sock import Sock
import json
from gpiozero import Button


app = Flask(__name__, static_folder='../web-ui/build', static_url_path='/')
sock = Sock(app)


def message(sock, num):
    msg = json.dumps({
        'action': 'update_score',
        'score': num
    })
    print(f"<-- {msg}")
    sock.send(msg)


@sock.route('/socket')
def echo(sock):
    num = 0
    while True:
        if Button(2).is_pressed:
            num += 1
            message(sock, num)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run(host='0.0.0.0')
