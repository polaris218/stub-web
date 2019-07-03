
Once you signup and login to your Arrivy account you can find two auth keys on your [API page](http://www.arrivy.com/api_info). To authenticate with our APIs you will need to set these two custom headers: `X-Auth-Key` and `X-Auth-Token` in each API call.

Here is an example of one of the API calls:

```sh
curl -X GET \
    -H "X-Auth-Key: -----------"\
    -H "X-Auth-Token: -----------"\
    "https://www.arrivy.com/api/users/profile"
```

You can request a new pair of keys via the web portal by going to API tab and clicking "Request New Keys".