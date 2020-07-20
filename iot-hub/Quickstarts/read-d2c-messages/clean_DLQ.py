from azure.servicebus import ServiceBusClient
import json
connectionString = "Endpoint=sb://test-serbus1.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SRfu30BTAd6PsNF1QPdkglOFd+Ye6qkL/O76Gvmmu9s="
queueName = "test-queue1"
serviceBusClient = ServiceBusClient.from_connection_string(connectionString)
queueClient = serviceBusClient.get_queue(queueName)
count = 0
with queueClient.get_deadletter_receiver(prefetch=5) as queueReceiver:
  print("connected to dead letter queue")
  try: 
    for i in range(0,1000):
      messages = queueReceiver.fetch_next(timeout=100)
      count += len(messages)
      for message in messages :
          # message.body is a generator object. Use next() to get the body.
          # body = next(message.body)
          # Store the body in some list so that we can send them to normal queue.
          message.complete()
  except KeyboardInterrupt:
    print("\ncleaning has been stopped")

print("total messages killed:",count)