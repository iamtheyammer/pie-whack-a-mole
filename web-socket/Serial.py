import serial.tools.list_ports
import json
import numpy as np

# Read all ports connected to the computer
ports = serial.tools.list_ports.comports()
usb_port = None
for port, desc, hwid in ports:
    # select the port that is connected to the Arduino
    if "CM0" in port:
        usb_port = port
arduinoComPort = usb_port   # serial port of Arduino

baudRate = 9600            # baud rate of Arduino

serialPort = serial.Serial(arduinoComPort, baudRate,
                           timeout=1)  # open serial port


def read_avg_voltages(num_reads):
    """
    Reads the voltage from the IR sensor and averages it over num_reads.

    Args:
        num_reads (int): The number of times to read the voltage.

    Returns:
        avg_voltage (float): The average voltage read from the IR sensor.
    """
    voltages = []
    for _ in range(num_reads):
        try:
            voltages.append(SerialRead()["sensorVoltage"])
        except:
            continue
    return np.mean(voltages)


def SerialWrite(action):
    """
    Helper function to write to serial port.

    Args:
        action (str): The action to write to the serial port.
    """
    # print(f"Serial -> {action}")
    serialPort.write(bytes(action, 'utf-8'))


def SerialRead():
    """
    Helper function to read from serial port.
    Checks if there is data to read and if so, reads it.

    Returns:
        json (dict): The data read from the serial port.
    """
    line_of_data = serialPort.readline().decode().strip()
    if len(line_of_data) > 0:
        try:
            data = json.loads(line_of_data)
        except:
            return SerialRead()
        return data
    # else:
    #     return SerialRead()
