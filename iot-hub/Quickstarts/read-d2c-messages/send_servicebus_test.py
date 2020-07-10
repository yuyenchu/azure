from azure.servicebus import QueueClient, Message

# Create the QueueClient
conn_str="Endpoint=sb://test-serbus1.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SRfu30BTAd6PsNF1QPdkglOFd+Ye6qkL/O76Gvmmu9s="
queue_client = QueueClient.from_connection_string(conn_str, "test-queue1")

# Send a test message to the queue
msg = Message(b'{"test":{"temperature": 37.0,"humidity": 79.58730996202017,"power_level": 50}}')
queue_client.send(msg)