const { EventHubConsumerClient } = require("@azure/event-hubs");

const eventHubsCompatibleEndpoint = "{your Event Hubs compatible endpoint}";
const eventHubsCompatiblePath = "{your Event Hubs compatible name}";
const iotHubSasKey = "{your service primary key}";

const connectionString = `Endpoint=${eventHubsCompatibleEndpoint}/;EntityPath=${eventHubsCompatiblePath};SharedAccessKeyName=service;SharedAccessKey=${iotHubSasKey}`;

var printError = function (err) {
  console.log(err.message);
};

// Display the message content - telemetry and properties.
// - Telemetry is sent in the message body
// - The device can add arbitrary properties to the message
// - IoT Hub adds system properties, such as Device Id, to the message.
var printMessages = function (messages) {
  for (const message of messages) {
    console.log("Telemetry received: ");
    console.log(JSON.stringify(message.body));
    console.log("Properties (set by device): ");
    console.log(JSON.stringify(message.properties));
    console.log("System properties (set by IoT Hub): ");
    console.log(JSON.stringify(message.systemProperties));
    console.log("");
  }
};

async function main() {
  console.log("IoT Hub Quickstarts - Read device to cloud messages.");

  // If using websockets, uncomment the webSocketOptions below
  // If using proxy, then set `webSocketConstructorOptions` to { agent: proxyAgent }
  // You can also use the `retryOptions` in the client options to configure the retry policy
  const clientOptions = {
    // webSocketOptions: {
    //   webSocket: WebSocket,
    //   webSocketConstructorOptions: {}
    // }
  };

  // Create the client to connect to the default consumer group of the Event Hub
  const consumerClient = new EventHubConsumerClient("$Default", connectionString, clientOptions);

  // Subscribe to messages from all partitions as below
  // To subscribe to messages from a single partition, use the overload of the same method.
  consumerClient.subscribe({
    processEvents: printMessages,
    processError: printError,
  });
}

main().catch((error) => {
  console.error("Error running sample:", error);
});
