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

# The device connection string to authenticate the device with your IoT hub.
# Using the Azure CLI:
# az iot hub device-identity show-connection-string --hub-name {YourIoTHubName} --device-id MyNodeDevice --output table
CONNECTION_STRING = "HostName=hub-test1.azure-devices.net;DeviceId=simulate2;SharedAccessKey=ZWosSuCL4pHgXGmhRKm4QHG9yJKB0y72ctPDFv02Qqg="

# Define the JSON message to send to IoT Hub.
TEMPERATURE = 20.0
HUMIDITY = 60
POWER = 50
MSG_TXT = '{{"temperature": {temperature},"humidity": {humidity},"power_level": {power}}}'

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
                INTERVAL = int(method_request.payload)
                print("rebooting in %d second(s)"%INTERVAL)
            except ValueError:
                response_payload = {"Response": "Invalid parameter"}
                response_status = 400
            else:
                response_payload = {"Response": "Executed direct method {}".format(method_request.name)}
                response_status = 200
                method_response = MethodResponse(method_request.request_id, response_status, payload=response_payload)
                device_client.send_method_response(method_response)
                time.sleep(INTERVAL)
                os.execv(sys.executable, [sys.executable] + sys.argv)
        else:
            response_payload = {"Response": "Direct method {} not defined".format(method_request.name)}
            response_status = 404

        method_response = MethodResponse(method_request.request_id, response_status, payload=response_payload)
        device_client.send_method_response(method_response)

def twin_update_listener(client):
    global POWER
    while True:
        patch = client.receive_twin_desired_properties_patch()  # blocking call
        print("Twin patch received:")
        print(patch)
        POWER=patch["Power"]
        print("power is set to",POWER)
        reported_patch = {"Power": POWER}
        client.patch_twin_reported_properties(reported_patch)


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
            print( "Sending message: {}".format(message))
            client.send_message(message)
            print( "Message sent" )
            # update temperature
            temperature = min(60.0,temperature+POWER/100) if POWER>0 else max(10.0,temperature-1)
            time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print ( "IoTHubClient sample stopped" )

if __name__ == '__main__':
    print ( "IoT Hub Quickstart #2 - Simulated device" )
    print ( "Press Ctrl-C to exit" )
    iothub_client_telemetry_sample_run()