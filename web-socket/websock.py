from flask import Flask, render_template
from flask_sock import Sock
import json


app = Flask(__name__, static_folder='../web-ui/build', static_url_path='/')
sock = Sock(app)


@sock.route('/socket')
def echo(sock):
    msg = json.dumps({
        'action': 'update_score',
        'score': 10
    })
    sock.send(msg)

    while True:

        message = sock.receive()

        sock.send(message + ' from server')


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run()
