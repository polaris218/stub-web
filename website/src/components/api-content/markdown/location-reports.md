## Location Reports

> Report is a single report of location for an entity with timestamp and any metadata you would like to store with it. There is 512 KB limit on metadata that you can store with a location report


URL|HTTP VERB|Functionality|
---|---------|-------------|
https://www.arrivy.com/api/entities/report | POST | [Send Reports for an Entity](#send-location-reports-for-one-or-more-entities)
https://www.arrivy.com/api/entities/{entity-id:int}/readings | GET | [Get Reports For an entity](#get-reports-for-an-entity)
https://www.arrivy.com/api/entities/find/{latitude:float}/{longitude:float}/{radius(meters):int} | GET | [Search Entities within a Given Location](search-entities)
https://www.arrivy.com/api/entities | GET | [Get Last Report for all Entities](#get-last-report-for-all-entities)


## Send location reports for one or more entities
This endpoint takes location report of one or multiple entities in below JSON format. 

```
[{
    "entity":<int entity id>,
    "lat": <float>,
    "lng": <float>,
    "time": <ISO timestamp>,
    "city": <string>,
    "street": <string>,
    "country": <string:ISO3>,
    "meta": {"key":"value"}
}]
```
Give the `entity` id in each of the reports. Remaining values are self explanatory. You could also send a meta payload of key value pairs of anything you would like to store with this location. This needs to be a JSON String.

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
#### Possible Errors Codes
Error Code|Message|Reason|
----------|-------|------|
400|INVALID\_INPUT\_JSON|Json data is invalid
400|MISSING\_REQUEST\_INFO|There are missing properties in any of the sent reports.

## Get reports for an entity

Get location reports of a specific entity back. Following url params are supported:
- time="ISO 8601 timestamp" ( all reports that came after this timestamp will be returned)
- page (optional param to get reports back in pages)
- items_per_page (optional param to get reports back in batches)

```sh
    curl -X GET \
        -H "X-Auth-Key: f45447ae-66ce"\
        -H "X-Auth-Token: cYsCtwpsyIxNt8mgrONXEA"\
        "https://www.arrivy.com/api/entities/5348024557502464/readings"
```
#### Response
```json
[
    {
        "entity": 5348024557502464,
        "city": null,
        "street": "Street Name,1",
        "country": "USA",
        "meta": "",
        "lat": 22.001,
        "lng": 42.001,
        "time": "2016-11-20T01:34:04.848640",
        "authorized": false,
    },
    {
        ...
    },
    {
        ...
    }
]
```

## Search entities
This endpoint returns reports (including entity ids) of your entities in the given radius of geolocation within a given interval. If you are interested in testing out this API please send us an email at info@arrivy.com and we will enable it for you.


## Get last report for all entities
This API was mentioned before in entities too. We intentially didn't discuss that as part of this API we also return last location report as `lastreading` for all entities.

```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/entities"
```

#### Response
```json
[
    {
        "id": 5348024557502464,
        "type": "Night-Shift Driver",
        "owner": 5629499534213120,
        "name": "John",
        "email":"john@doe.com",
        "details": "Joe loves his work",
        "extra_fields": null,
        "image_id": 12345,
        "image_path": "https://...../....",
        "lastreading": {
          "city": "Bothell",
          "country": "United States",
          "street": "118th Court Northeast",
          "time": "2016-11-20T01:34:04.848640",
          "lat": 47.7467686,
          "lng": -122.1828382,
        },
    }
]
```