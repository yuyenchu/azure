from azure.servicebus import QueueClient, Message

queue_conn_str="Endpoint=sb://test-serbus1.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SRfu30BTAd6PsNF1QPdkglOFd+Ye6qkL/O76Gvmmu9s="
queue_client = QueueClient.from_connection_string(queue_conn_str, "test-queue1")
count = 0

with queue_client.get_receiver() as queue_receiver:
  print("connected to service bus queue")
  try:
    for i in range(0,1000):
      messages = queue_receiver.fetch_next(timeout=3)
      for message in messages:
        message.complete()
        count+=1
  except KeyboardInterrupt:
    print("\ncleaning has been stopped")

print("total messages killed:",count)