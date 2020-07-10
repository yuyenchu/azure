# --------------------------------------------------------------------------------------------
# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License. See License.txt in the project root for license information.
# --------------------------------------------------------------------------------------------

"""
This sample demonstrates how to use the Microsoft Azure Event Hubs Client for Python sync API to 
read messages sent from a device. Please see the documentation for @azure/event-hubs package
for more details at https://pypi.org/project/azure-eventhub/

For an example that uses checkpointing, follow up this sample with the sample in the 
azure-eventhub-checkpointstoreblob package on GitHub at the following link:

https://github.com/Azure/azure-sdk-for-python/blob/master/sdk/eventhub/azure-eventhub-checkpointstoreblob/samples/receive_events_using_checkpoint_store.py
"""


from azure.eventhub import TransportType
from azure.eventhub import EventHubConsumerClient
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import json
import threading
import logging
logging.getLogger().setLevel(logging.CRITICAL)

# Event Hub-compatible endpoint
# az iot hub show --query properties.eventHubEndpoints.events.endpoint --name hub-test1
EVENTHUB_COMPATIBLE_ENDPOINT = "sb://ihsuprodblres095dednamespace.servicebus.windows.net/"

# Event Hub-compatible name
# az iot hub show --query properties.eventHubEndpoints.events.path --name hub-test1
EVENTHUB_COMPATIBLE_PATH = "iothub-ehub-hub-test1-3780350-0bfd74d500"

# Primary key for the "service" policy to read messages
# az iot hub policy show --name service --query primaryKey --hub-name hub-test1
IOTHUB_SAS_KEY = "aOQRCy8GcrQokjuJjAb7PFYc9dj9SjqPnlH1OMAzYVQ="

# If you have access to the Event Hub-compatible connection string from the Azure portal, then
# you can skip the Azure CLI commands above, and assign the connection string directly here.
CONNECTION_STR = f'Endpoint={EVENTHUB_COMPATIBLE_ENDPOINT}/;SharedAccessKeyName=service;SharedAccessKey={IOTHUB_SAS_KEY};EntityPath={EVENTHUB_COMPATIBLE_PATH}'


received_data = {}
deviceID = ""
# received_data = {'a':[1,2,3,4,5,6,7,8,9,10,11,12]}
# Define callbacks to process events
def on_event_batch(partition_context, events):
    global received_data, deviceID
    for event in events:
        print("Received event from partition: {}.".format(partition_context.partition_id))
        print("Telemetry received: ", event.body_as_str())
        print("Properties (set by device): ", event.properties)
        print("System properties (set by IoT Hub): ", event.system_properties)
        print(event.system_properties[b'iothub-connection-device-id'])
        device_id=event.system_properties[b'iothub-connection-device-id'].decode("utf-8") 
        deviceID = device_id
        obj = event.body_as_json()
        # print("obj:", obj['temperature'])
        for k in obj.keys():
            if k not in received_data.keys():
                received_data[k]=[obj[k]]
            else:
                received_data[k].append(obj[k])
        print("")
    
    partition_context.update_checkpoint()

def on_error(partition_context, error):
    # Put your code here. partition_context can be None in the on_error callback.
    if partition_context:
        print("An exception: {} occurred during receiving from Partition: {}.".format(
            partition_context.partition_id,
            error
        ))
    else:
        print("An exception: {} occurred during the load balance process.".format(error))

def wrapper(client):
    try: 
        with client:
            print(client.get_eventhub_properties())
            # client.receive_batch(
            #     on_event_batch=on_event_batch,
            #     on_error=on_error
            # )
            client.receive(
                on_event=on_event_batch,
                on_error=on_error
            )
    except KeyboardInterrupt:
        print ( "Receiving has stopped." )

def main():
    try:
        client = EventHubConsumerClient.from_connection_string(
            conn_str=CONNECTION_STR,
            consumer_group="$default",
        )
        read_thread = threading.Thread(target=wrapper, args=(client,),daemon = True)
        read_thread.start()
        plt.figure()
        while True:
            plt.cla()
            for k in received_data.keys():
                # x=range(max(1,len(received_data[k])-10),len(received_data[k]))
                # y=received_data[k][-10:]
                # print("x and y have len {} and {}".format(len(x), len(y)))
                plt.ylim(0,100)
                plt.plot(range(max(0,len(received_data[k])-10),len(received_data[k])),
                        received_data[k][-10:],marker='.', label=k)
            plt.legend(loc=2)
            plt.xlabel("time stamp")
            plt.ylabel("data received")
            plt.title("device ID: "+deviceID)
            plt.pause(0.5)
    except KeyboardInterrupt:
        print ( "Receiving has stopped." )
    
if __name__ == '__main__':
    main()
