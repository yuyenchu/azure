# Copyright (c) Microsoft. All rights reserved.
# Licensed under the MIT license. See LICENSE file in the project root for full license information.

import json
import random
import time
import threading
import os
import sys

# Using the Python Device SDK for IoT Hub:
#   https://github.com/Azure/azure-iot-sdk-python
# The sample connects to a device-specific MQTT endpoint on your IoT Hub.
from azure.iot.device import IoTHubDeviceClient, Message, MethodResponse
from optparse import OptionParser

# The device connection string to authenticate the device with your IoT hub.
# Using the Azure CLI:
# az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table
# CONNECTION_STRING = "HostName=hub-test1.azure-devices.net;DeviceId=simulate2;SharedAccessKey=ZWosSuCL4pHgXGmhRKm4QHG9yJKB0y72ctPDFv02Qqg="
CONNECTION_STRING = "HostName=thingspro-IoTHub-newTwin.azure-devices.net;DeviceId=andrew-simulate;SharedAccessKey=FzUfu+qgPPo6tlJQpw4XafADuJyJQJhpxnT+SPDPS/E="
# Define the JSON message to send to IoT Hub.
NAME="simulate2"
TEMPERATURE = 20.0
HUMIDITY = 60
POWER = 50
MSG_TXT = '{{"temperature": {temperature},"humidity": {humidity},"power_level": {power}}}'

ALLOWINPUT = False
INTERVAL = 1

def iothub_client_init():
    # Create an IoT Hub client
    client = IoTHubDeviceClient.create_from_connection_string(CONNECTION_STRING)
    return client


def device_method_listener(device_client):
    global INTERVAL, POWER
    while True:
        method_request = device_client.receive_method_request()
        print (
            "\nMethod callback called with:\nmethodName = {method_name}\npayload = {payload}".format(
                method_name=method_request.name,
                payload=method_request.payload
            )
        )
        if method_request.name == "SetTelemetryInterval":
            try:
                INTERVAL = int(method_request.payload)
            except ValueError:
                response_payload = {"Response": "Invalid parameter"}
                response_status = 400
            else:
                response_payload = {"Response": "Executed direct method {}".format(method_request.name)}
                response_status = 200
        elif method_request.name == "Reboot":
            try:
                reboot_time = int(method_request.payload)
                print("rebooting in %d second(s)"%reboot_time)
            except ValueError:
                response_payload = {"Response": "Invalid parameter"}
                response_status = 400
            else:
                response_payload = {"Response": "Executed direct method {}".format(method_request.name)}
                response_status = 200
                method_response = MethodResponse(method_request.request_id, response_status, payload=response_payload)
                device_client.send_method_response(method_response)
                time.sleep(reboot_time)
                os.execv(sys.executable, [sys.executable] + sys.argv)
        else:
            response_payload = {"Response": "Direct method {} not defined".format(method_request.name)}
            response_status = 404

        method_response = MethodResponse(method_request.request_id, response_status, payload=response_payload)
        device_client.send_method_response(method_response)

def twin_update_listener(client):
    global POWER, NAME
    while True:
        patch = client.receive_twin_desired_properties_patch()  # blocking call
        print("Twin patch received:")
        reported_patch = {}
        print(patch)
        if "Power" in patch:
            POWER = patch["Power"]
            reported_patch["Power"]=POWER
            print("power level is set to",POWER)
        if "Name" in patch:
            NAME = patch["Name"]
            reported_patch["Name"]=NAME
            print("name is set to",NAME)
        print(reported_patch)
        client.patch_twin_reported_properties(reported_patch)

def twin_name_change(client):
    global NAME
    while True:
        NAME = input("Please enter new twin name")
        client.patch_twin_reported_properties({"Name":NAME})

def iothub_client_telemetry_sample_run():
    try:
        client = iothub_client_init()
        print ( "IoT Hub device sending periodic messages, press Ctrl-C to exit" )

        # Start a thread to listen direct method
        device_method_thread = threading.Thread(target=device_method_listener, args=(client,))
        device_method_thread.daemon = True
        device_method_thread.start()
        # start thread to listen twin update 
        twin_update_thread = threading.Thread(target=twin_update_listener, args=(client,))
        twin_update_thread.daemon = True
        twin_update_thread.start()
        # start a thread for setting new device name
        if ALLOWINPUT:
            twin_name_thread = threading.Thread(target=twin_name_change, args=(client,))
            twin_name_thread.daemon = True
            twin_name_thread.start()
        temperature = 20.0
        while True:
            # Build the message with simulated telemetry values.
            humidity = HUMIDITY + (random.random() * 20)
            # print(POWER)
            msg_txt_formatted = MSG_TXT.format(temperature=temperature, humidity=humidity,power=POWER)
            # print(json.loads(msg_txt_formatted))
            message = Message(msg_txt_formatted, content_type='json')
            
            # Add a custom application property to the message.
            # An IoT hub can filter on these properties without access to the message body.
            message.custom_properties["temperatureAlert"] = "true" if temperature > 30 else "false"
            # Send the message.
            client.send_message(message)
            if not ALLOWINPUT: 
                print( "Sending message: {}".format(message))
                print( "Message sent" )
            # update temperature
            temperature = min(60.0,temperature+POWER/100) if POWER>0 else max(10.0,temperature-1)
            time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print ( "IoTHubClient sample stopped" )

if __name__ == '__main__':
    print ( "IoT Hub Quickstart #2 - Simulated device" )
    print ( "Press Ctrl-C to exit" )
    parser = OptionParser()
    parser.add_option("-e", "--enable", action="store_true", dest="input")
    (options, args) = parser.parse_args()
    ALLOWINPUT = options.input
    iothub_client_telemetry_sample_run()