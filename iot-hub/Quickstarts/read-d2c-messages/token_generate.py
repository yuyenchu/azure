import base64
import hmac
import hashlib
import time
import urllib.parse
import requests

API_VERSION = '2018-06-30'
TOKEN_VALID_SECS = 365 * 24 * 60 * 60
TOKEN_FORMAT = 'SharedAccessSignature sr=%s&sig=%s&se=%s&skn=%s'

# iot hub token
def get_token():
    CONNECTION_STRING = """
HostName=thingspro-IoTHub-newTwin.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=KwgMjyXpI8j6REaiPjZy/JzIxriQeW6gKpt0zQwvpmo=
"""
    IOTHOST, KEYNAME, KEYVLAUE = [
        sub[sub.index('=') + 1:] for sub in CONNECTION_STRING.split(";")]
    targetUri = IOTHOST.lower()
    expiryTime = '%d' % (time.time() + TOKEN_VALID_SECS)
    toSign = '%s\n%s' % (targetUri, expiryTime)
    key = base64.b64decode(KEYVLAUE.encode('utf-8'))
    signature = urllib.parse.quote(
        base64.b64encode(
            hmac.HMAC(key, toSign.encode('utf-8'), hashlib.sha256).digest()
        )
    ).replace('/', '%2F')
    print("token:", TOKEN_FORMAT % (targetUri, signature, expiryTime, KEYNAME))
    return TOKEN_FORMAT % (targetUri, signature, expiryTime, KEYNAME)

# servicebus token
def get_auth_token(sb_name, eh_name, sas_name, sas_value):
    """
    Returns an authorization token for making calls to Event Hubs REST API.
    """
    uri = urllib.parse.quote_plus("https://{}.servicebus.windows.net/{}" \
                                  .format(sb_name, eh_name))
    sas = sas_value.encode('utf-8')
    expiry = str(int(time.time() + TOKEN_VALID_SECS))
    string_to_sign = (uri + '\n' + expiry).encode('utf-8')
    signed_hmac_sha256 = hmac.HMAC(sas, string_to_sign, hashlib.sha256)
    signature = urllib.parse.quote(base64.b64encode(signed_hmac_sha256.digest()))
    print("token: SharedAccessSignature sr={}&sig={}&se={}&skn={}".format(uri, signature, expiry, sas_name))
    return  "token: SharedAccessSignature sr={}&sig={}&se={}&skn={}".format(uri, signature, expiry, sas_name)
get_token()
get_auth_token("andrew-serbus1","state-queue1","RootManageSharedAccessKey","KQBSProBZ7n87MlLWY07BQELRM9oBZHOj6nTu78hJV0=")