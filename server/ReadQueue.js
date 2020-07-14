const { ServiceBusClient, ReceiveMode } = require("@azure/service-bus"); 

// Define connection string and related Service Bus entity names here
const connectionString = "Endpoint=sb://test-serbus1.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=SRfu30BTAd6PsNF1QPdkglOFd+Ye6qkL/O76Gvmmu9s=";
const queueName = "test-queue1"; 

async function main(){
  const sbClient = ServiceBusClient.createFromConnectionString(connectionString); 
  const queueClient = sbClient.createQueueClient(queueName);
  const receiver = queueClient.createReceiver(ReceiveMode.peekLock);
  try {
    const messages = await receiver.receiveMessages(10)
    console.log("Received messages:");
    console.log(messages.map(message => message.body));

    await queueClient.close();
  } finally {
    await sbClient.close();
  }
}

main().catch((err) => {
  console.log("Error occurred: ", err);
});
