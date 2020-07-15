import base64
import hmac
import hashlib
import time
import urllib.parse
import requests

API_VERSION = '2018-06-30'
TOKEN_VALID_SECS = 365 * 24 * 60 * 60
TOKEN_FORMAT = 'SharedAccessSignature sr=%s&sig=%s&se=%s&skn=%s'
CONNECTION_STRING = """
HostName=hub-test1.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=Ul8DDbKWKcfZIR5nzEIHw+D6N0l3itJLNgnRqR8FeMQ=
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

def get_token():
  return TOKEN_FORMAT % (targetUri, signature, expiryTime, KEYNAME)