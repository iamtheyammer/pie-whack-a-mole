from flask import Flask, render_template
from flask_sock import Sock


app = Flask(__name__)
sock = Sock(app)


@app.route("/")
def test():
    return None


@sock.route('/echo')
def echo(sock):

    while True:

        message = sock.receive()

        sock.send(message + ' from server')


if __name__ == "__main__":
    app.run()
