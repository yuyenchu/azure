import sys
from azure.iot.hub import IoTHubRegistryManager
from azure.iot.hub.models import Twin, TwinProperties, QuerySpecification, QueryResult
from builtins import input
from time import sleep

CONNECTION_STRING = "HostName=hub-test1.azure-devices.net;SharedAccessKeyName=service;SharedAccessKey=aOQRCy8GcrQokjuJjAb7PFYc9dj9SjqPnlH1OMAzYVQ="
DEVICE_ID = "simulate2"
VALUE = 50

def iothub_devicemethod_sample_run():
    try:
        VALUE = int(input("Please enter the desired power level: "))
        # Create IoTHubRegistryManager
        registry_manager = IoTHubRegistryManager(CONNECTION_STRING)

        # new_tag = {
        #   "location" : "Taiwan"
        # }
        # get device's twin
        twin = registry_manager.get_twin(DEVICE_ID)
        print("current device twin properties", twin.properties)
        # twin_patch = Twin(tags=new_tag, properties= TwinProperties(desired={'Power' : False}))
        twin_patch = Twin(properties= TwinProperties(desired={'Power' : VALUE}))
        twin = registry_manager.update_twin(DEVICE_ID, twin_patch, twin.etag)

        print ( "" )
        sleep(3)
        # query to check new tag
        # query_spec = QuerySpecification(query="SELECT * FROM devices WHERE tags.location = 'Taiwan'")
        # query_result = registry_manager.query_iot_hub(query_spec, None, 100)
        # print("Devices in Taiwan: {}".format(', '.join([twin.device_id for twin in query_result.items])))

        # get latest twin to observe difference
        twin = registry_manager.get_twin(DEVICE_ID)
        print("updated device twin properties", twin.properties)
        # twin_patch = Twin(tags=twin.tags, properties= TwinProperties(desired = None))
        # twin = registry_manager.update_twin(DEVICE_ID, twin_patch, twin.etag)
        # print("cleaned up desired property")
    except Exception as ex:
        print ( "" )
        print ( "Unexpected error {0}".format(ex) )
        return
    except KeyboardInterrupt:
        print ( "" )
        print ( "IoT Hub Device Twin service sample stopped" )

if __name__ == '__main__':
    print ( "IoT Hub Python quickstart #3..." )
    print ( "    Connection string = {0}".format(CONNECTION_STRING) )
    print ( "    Device ID         = {0}".format(DEVICE_ID) )

    iothub_devicemethod_sample_run()