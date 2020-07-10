from azure.eventhub import EventHubConsumerClient
from azure.servicebus import QueueClient, Message
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import json
import threading
import logging
logging.getLogger().setLevel(logging.CRITICAL)


queue_conn_str="Endpoint=sb://test-serbus1.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SRfu30BTAd6PsNF1QPdkglOFd+Ye6qkL/O76Gvmmu9s="


# EVENTHUB_COMPATIBLE_ENDPOINT = "sb://ihsuprodblres095dednamespace.servicebus.windows.net/"
# EVENTHUB_COMPATIBLE_PATH = "iothub-ehub-hub-test1-3780350-0bfd74d500"
# IOTHUB_SAS_KEY = "aOQRCy8GcrQokjuJjAb7PFYc9dj9SjqPnlH1OMAzYVQ="
# CONNECTION_STR = f'Endpoint={EVENTHUB_COMPATIBLE_ENDPOINT}/;SharedAccessKeyName=service;SharedAccessKey={IOTHUB_SAS_KEY};EntityPath={EVENTHUB_COMPATIBLE_PATH}'

received_data = {}
deviceID = ""
# received_data = {'a':[1,2,3,4,5,6,7,8,9,10,11,12]}
# Define callbacks to process events

def receive_serivebus(queue_client):
  # Create the QueueClient
  # Receive the message from the queue
  with queue_client.get_receiver() as queue_receiver:
      messages = queue_receiver.fetch_next(timeout=3)
      for message in messages:
          print(message)
          print(type(message))
          print(message.annotations)
          print(message.user_properties)
          message.complete()

def main():
    try:
        queue_client = QueueClient.from_connection_string(queue_conn_str, "test-queue1")
        read_thread = threading.Thread(target=receive_serivebus, args=(queue_client,),daemon = True)
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
