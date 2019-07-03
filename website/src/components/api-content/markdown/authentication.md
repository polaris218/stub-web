
## Authentication
Once you signup and login to your Arrivy account you will notice two auth keys on your [API page](http://www.arrivy.com/api_info). To authenticate with our APIs you will need set these two custom headers: `X-Auth-Key` and `X-Auth-Token` in each API call.

Here is an example of one of the API calls:

```sh
curl -X GET \
    -H "X-Auth-Key: -----------"\
    -H "X-Auth-Token: -----------"\
    "https://www.arrivy.com/api/users/profile"
```

## Updating Auth Tokens
In order to get new access tokens you need to send a GET request as following or you can also do it from the [API page](http://www.arrivy.com/api_info):

```sh
    curl -X GET \
        -H "X-Auth-Key: ------------"\
        -H "X-Auth-Token: -----------"\
        "https://www.arrivy.com/api/users/update-auth-keys"
```

#### Response
```json
{
  "auth_token": "-----------",
  "auth_key": "-----------"
}
```
