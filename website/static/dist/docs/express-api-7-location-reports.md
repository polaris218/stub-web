> If you are planning to use Arrivy Mobile Apps for your field crew to report their progress then you don't need to integrate this API.

As mentioned earlier, Report is a single report of location for an entity with timestamp and any metadata you would like to store with it. There is 512 KB limit on metadata that you can store with a location report. Arrivy's real-time montoring and alerting system keeps an eye on incoming location reports to power the last-mile notifications for the customers and operations. Here is a quick sample of how location reports can be sent to Arrivy:


#### Example
```sh
curl -X POST \
    -H "X-Auth-Key: f45447ae-66ce"\
    -H "X-Auth-Token: cYsCtwpsyIxNt8mgrONXEA"\
    --data '[{"entity":5348024557502464, "lat":22.001, "lng":42.001,"time":"2016-11-20T23:59:59+01:00","city":"City Name", "street":"Street Name,1", "country":"USA", "meta":""}] '\
    "https://www.arrivy.com/api/entities/report"
```
#### Response
```json
{
  "message":"Reports are saved"
}
```


Details of the location report LIST and CREATE api is below: