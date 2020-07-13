from azure.eventhub import EventHubConsumerClient
from azure.servicebus import QueueClient, Message
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import json
import threading
import logging
logging.getLogger().setLevel(logging.CRITICAL)

queue_conn_str="Endpoint=sb://test-serbus1.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SRfu30BTAd6PsNF1QPdkglOFd+Ye6qkL/O76Gvmmu9s="

received_data = {}
deviceID = ""
# received_data = {'a':[1,2,3,4,5,6,7,8,9,10,11,12]}

def receive_serivebus(queue_client):
    global received_data, deviceID
    
    with queue_client.get_receiver() as queue_receiver:
        while True:
            messages = queue_receiver.fetch_next(timeout=3)
            for message in messages:
                print(message)
                print(message.annotations)
                print("From device ID:",message.user_properties[b'iothub-connection-device-id'])
                try:
                    deviceID = message.user_properties[b'iothub-connection-device-id'].decode("utf-8") 
                    obj = json.loads(str(message))
                    for k in obj.keys():
                        if k not in received_data.keys():
                            received_data[k]=[obj[k]]
                        else:
                            received_data[k].append(obj[k])
                    message.complete()
                except Exception as ex:
                    print ( "" )
                    print ( "Unexpected error {0}".format(ex))
                    print ( "Warning: Message not comlete")            

def main():
    try:
        queue_client = QueueClient.from_connection_string(queue_conn_str, "test-queue1")
        read_thread = threading.Thread(target=receive_serivebus, args=(queue_client,),daemon = True)
        read_thread.start()
        plt.figure()
        while True:
            plt.cla()
            for k in received_data.keys():
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
