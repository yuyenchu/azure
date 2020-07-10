import sys
from azure.iot.hub import IoTHubRegistryManager
from azure.iot.hub.models import Twin, TwinProperties, QuerySpecification, QueryResult
from builtins import input

CONNECTION_STRING = "HostName=hub-test1.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=aOQRCy8GcrQokjuJjAb7PFYc9dj9SjqPnlH1OMAzYVQ="

def iothub_getid_sample_run():
    try:
        # Create IoTHubRegistryManager
        registry_manager = IoTHubRegistryManager(CONNECTION_STRING)

        query_spec = QuerySpecification(query="SELECT * FROM devices")
        query_result = registry_manager.query_iot_hub(query_spec, None, 100)
        print("All devices properties: {}".format(";\n".join(str(t.properties) for t in query_result.items)))

        #query to get all enabled device id
        query_spec = QuerySpecification(query="SELECT * FROM devices WHERE status = 'enabled'")
        query_result = registry_manager.query_iot_hub(query_spec, None, 100)
        print ( "" )
        print("Devices enabled:\n{}".format('\n'.join(["\t"+str(twin.device_id)+": "+twin.connection_state for twin in query_result.items])))
    except Exception as ex:
        print ( "" )
        print ( "Unexpected error {0}".format(ex) )
        return

if __name__ == '__main__':
    print ( "IoT Hub Python quickstart #4..." )
    print ( "    Connection string = {0}".format(CONNECTION_STRING) )

    iothub_getid_sample_run()