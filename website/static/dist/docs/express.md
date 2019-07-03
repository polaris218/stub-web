## Express

> Express APIs provides repaid integration with Arrivy

URL|HTTP VERB|Functionality|
---|---------|-------------|
https://www.arrivy.com/api/express/tasks/upsert/{external_id:str} | PUT | [Add/Update Task](#add-update-task)
https://www.arrivy.com/api/express/tasks/{external_id:str} | GET, DELETE | [Get and Update Task](#get-and-delete-task)
https://www.arrivy.com/api/express/tasks | GET | [List All Tasks](#list-all-tasks)
https://www.arrivy.com/api/express/tasks/{external_id:str}/status/new | POST | [Report New Task Status](#report-task-status)
https://www.arrivy.com/api/express/resources | GET | [List All Resources](#list-all-resources)
https://www.arrivy.com/api/express/resources/{external_id:str} | GET | [Get Resource](#get-resource)
https://www.arrivy.com/api/express/entities | GET | [List All Entities](#list-all-entities)
https://www.arrivy.com/api/express/entities/{external_id:str} | GET | [Get Entity](#get-entity)
https://www.arrivy.com/api/express/entities/report | POST | [Send Reports for an Entity](#send-location-reports-for-one-or-more-entities)
https://www.arrivy.com/api/express/entities/{external_id:str}/readings | GET | [Get Reports For an entity](#get-reports-for-an-entity)

## Add/Update task
Adds/Updates a task to your account, along with all the related entities and resources. This is a PUT call. Anatomy of task is explained below:

Field|Details|
---|---------|
title | Title of the task
start_datetime | Start date & time of the task. This needs to be ISO 8601. Supported format is **YYYY-MM-DDTHH:mm:ssZZ** e.g. 2016-10-14T08:00:00+01:00
end_datetime | End date & time of the task. This needs to be ISO 8601. Supported format is **YYYY-MM-DDTHH:mm:ssZZ** e.g. 2016-10-14T08:00:00+01:00. *Optional*
details | Details of the task. *Optional*
entity_ids | Comma separated string of entity ids. The task will be assigned to these entities. Make sure that these  entities already exist. This field is optional and can be set at any time.
resource_ids | Comma separated string of resource ids. Resources are the equipments used for doing tasks. These resources will be reserved for this task. Make sure that these  resources already exist. This field is optional and can be set at any time.
customer_first_name | First name of customer *Optional*
customer_last_name | Last name of customer *Optional*
customer_email | Email of customer *Optional*
customer_company_name | Company name of customer *Optional*
customer_address_line_1 | Address line 1  *Optional*
customer_address_line_2 | Address line 2  *Optional*
customer_city | City name  *Optional*
customer_state | State  *Optional*
customer_country | ISO3 country code  *Optional*
customer_zipcode | Zip code  *Optional*
customer_exact_location | In case the exact latitude and longitude of customer location are already known. Expected format is a JSON string with these two keys "lat" and "lng". If it isn't provided we always try to geo-code the given customer address. This helps our estimation engine *Optional*
customer_mobile_number | Mobile number of the customer which will be used for sending notifications to customer  *Optional*
customer_phone | Phone number of customer. It could be a land line number or a number with extensions  *Optional*
customer_id | Identifier for customer. This is optional and if you are not using our customers module you can leave it out. *Optional*
customer_notes | Any special notes from customer  *Optional*
unscheduled | True indicates that task is marked as unscheduled. Arrivy doesn't share time of the task in customer outgoing notifications. Additionally, unscheduled tasks can only be fetched separately in /api/tasks by passing url parameters ?unscheduled=true .
extra_fields | A key value pair object as JSON. This is very useful as it can help store essentially any custom data with the task. It could be hourly_rate: x amount, estimated_hours: 4 hours etc.
notifications | A key value pair as JSON. Possible key options are: sms, email, facebook (in works). Indicate true or false to turn on or off each of these channels.
source | String source of the task e.g. it can be google or any other calendar or your own system. *Optional*
source_id | Identifier to correlate this task with the id of task in any other system. *Optional*
external_id | typically, an id from the client system. *Optional*
additional_addresses | A JSON String which is used to store multiple addresses on a task. It can contain several JSON objects, having key value pairs of address attributes. Every address Object will have attributes: **title, address_line_1, address_line_2, city, state, country, zipcode and exact_location**. exact_location have two keys "lat" and "lng". *Optional*
entities | A JSON String to add entities to system and assign them to Task. It can contain an array of entity data objects. *Optional*
resources | A JSON String to add resources to system and assign them to Task. It can contain an array of entity data objects. *Optional*


>Required fields for entity: `name`, `type` and `external_id`. 

>Optional fields for entity: `email`, `details`, `permission`, `extra_fields` (JSON String of key value pairs), `image_id` , `image_path`

>Permission: `permission` can have one the following values, i.e. `ADMIN`, `SCHEDULER`, `FIELDCREW`

>Required fields for resource: `name`, `type` and `external_id`. 

>Optional fields for resource: `details`, `extra_fields` (JSON String of key value pairs), `image_id` , `image_path`


#### Request
```sh
    curl -X POST \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        --data 'title=Adam Order&start_datetime=2016-11-21T09:00:7-08:00&end_datetime=2016-11-21T11:00:7-08:00'\
        "https://www.arrivy.com/api/express/tasks/upsert/7aac9ha9ca0"
```
#### Response
```json
{  
    "Entity Result":[  
        {  
            "response":[{"id":5084123566836224}, 200],
            "external_id":"entity3231"
        },
        {  
            "response":[{"description":"Updated.", "id":62100236735245238}, 200],
            "external_id":"entity2342"
        }
    ],
    "Resource Result":[  
        {  
            "response":[{"id":50841234246836224}, 200],
            "external_id":"resource1523"
        }
    ],
    "Task Result":{  
        "response":[{"description":"Updated.", "id":58432438834944, "tasksFetchRecommended":false}, 200],
        "external_id":"task6573"
    }
}
```

## Get and delete task
Supported operations are GET and DELETE. GET returns the entire payload of task by external id and it can also get some additional details by sending 'show_details' as true in query param i.e. task statuses and ratings.

Delete is self-explanatory.

Note: extra_fields and notifications structure is deserialized and returned as an Object. The datetime structures are returned back converted to UTC in ISO 8601 format. We also return the originally passed start_datetime and end_datime fields in their original timezone appended with *_original_iso_str appended to them.

## List all tasks
List all tasks. You can specify a few fields to limit your search (highly recommended). Here are the possible URL params that can be sent.

Field|Details|
---|---------|
entity_id | This field helps return tasks of a specific entity. *Optional*
from | `from` date & time of the query. This needs to be ISO 8601. Supported format is **YYYY-MM-DDTHH:mm:ssZZ** e.g. 2016-10-14T08:00:00+01:00. + sign needs to be url encoded as these are query params. *Optional*
to | `to` date & time of the query. This needs to be ISO 8601. Supported format is **YYYY-MM-DDTHH:mm:ssZZ** e.g. 2016-10-14T08:00:00+01:00. + sign needs to be url encoded as these are query params. *Optional*
page | Default value is 1 if not supplied. *Optional*
items_per_page | Default value is 500 if not supplied. *Optional*
unscheduled | Default value is false. True indicates that only unscheduled tasks should be returned *Optional*
tasks_with_no_datetime | Returns all tasks that don't have a date & time at all *Optional*
customer_id | Returns tasks for a given customer_id *Optional*
external_id | Returns task for given external_id. This is a query param. *Optional*
show_details | If true returns Task statuses and ratings. This is a query param. *Optional*

#### Request
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/express/tasks?from=2016-11-20T00:00:00-08:00&to=2016-11-26T23:59:59-08:00"
```

#### Response
```json
[
    {
        "id": 5348024557502464,
        "title": "Adam's Order",
        ...
    }
]
```

## Report task status
Reports a new task status for your task. It takes task's external id in URL. This is a POST call. Anatomy of task status is explained below:

Field|Details|
---|---------|
type | Type of status. Possible options are: NOTSTARTED, ENROUTE, STARTED, COMPLETE, EXCEPTION, CANCELLED, PREPARING, CONFIRMED, CUSTOM, RECOMMENDED, RESCHEDULED, CUSTOMER_EXCEPTION and READYFORPICKUP.
time | Time of status report. This needs to be ISO 8601. Supported format is **YYYY-MM-DDTHH:mm:ssZZ** e.g. 2016-10-14T08:00:00+01:00
reporter_name | Name of task status reporter. *Optional*
reporter_id | Entity ID of the reporter *Optional*
extra_fields | A key value pair object as JSON. This is very useful as it can help store essentially any custom data with the task status. It could be notes, file paths etc. If you are planning to use our UI's live tracking view then we recommend using the following fields:<br/>"notes":"We fixed everything :)",<br/>"files":[{<br/>"file_path":"http://........"<br/>"file_id":int id<br/>}],<br/>"visible_to_customer":true<br/>*Optional*
source | String source of the task status e.g. it can be 'web', 'email', 'sms' or 'app'. APP indicates mobile app.
current_destination | Used only for ENROUTE type status. It is a JSON object which contains address attributes which have same value as ONE of the addresses from task. This attribute with task status is used to indicate to which destination crew is moving towards right now.

#### Request
```sh
    curl -X POST \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        --data 'type=ENROUTE&time=2016-11-21T09:00:7-08:00'\
        "https://www.arrivy.com/api/express/tasks/asdas2342n23j/status/new"
```
#### Response
```json
{
  "id": 5348024557502464
}
```

## List all resources
View all resources of your team/company. 

name, id and type will always be fields. Rest are optional fields.

#### Request
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/express/resources"
```

#### Response
```json
[
    {
        "id": 2345024557502464,
        "type": "Truck",
        "owner": 5629499534213120,
        "name": "Truck22",
        "details": "Joe loves his truck",
        "extra_fields": null,
        "image_id": 12345,
        "image_path": "https://...../....",
        "external_id": "asdaa89789sada9"
    },
    {
        "id": 2345924464345088,
        "type": "Van",
        "owner": 5629499534213120,
        "name": "Vaaan",
        "details": "Adam is an avid skier",
        "extra_fields": {
                "key1":"value1"
            },
        "image_id": 12367,
        "image_path": "https://...../....",
        "external_id": "53tw89789sji87"    
    }
]
```

## Get resource
Get all fields of a specific resource

#### Request
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/express/resources/asdaa89789sada9"
```
#### Response
```json
{
    "id": 2345024557502464,
    "type": "Truck",
    "owner": 5629499534213120,
    "name": "Truck22",
    "details": "Joe loves his truck",
    "extra_fields": null,
    "image_id": 12345,
    "image_path": "https://...../....",
    "external_id": "asdaa89789sada9"
}
```

## List all entities
View all entities of your team/company. 

name, id and type will always be fields. Rest are optional fields.

#### Request
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/express/entities"
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
        "phone": 1546513546854,
        "color": "A4G311",
        "can_turnoff_location": true,
        "details": "Joe loves his work",
        "extra_fields": null,
        "image_id": 12345,
        "image_path": "https://...../....",
        "external_id": "asf8asfa0aa3",
        "is_disabled": false
    },
    {
        "id": 6473924464345088,
        "type": "Day-Shift Driver",
        "owner": 5629499534213120,
        "name": "Adam",
        "email":"adam@steve.com",
        "phone": 1546513542342,
        "color": "888888",
        "can_turnoff_location": true,
        "details": "Adam is an avid skier",
        "extra_fields": {
                "key1":"value1"
            },
        "image_id": 12367,
        "image_path": "https://...../....",        
        "external_id": "asf8assde3a7",
        "is_disabled": false
    }
]
```
We also support basic entity filtering using `external_id` and `email` (these are the optional fields on the entity) by adding URL params to the above API i.e. https://www.arrivy.com/api/entities?external_id=...&email=...


## Get entity
Get all fields of a specific entity by external id

#### Request
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/express/entities/asf8asfa0aa3"
```
#### Response
```json
{
    "id": 5348024557502464,
    "type": "Night-Shift Driver",
    "owner": 5629499534213120,
    "name": "John",
    "email":"john@doe.com",
    "phone": 1546513546854,
    "color": "A4G311",
    "can_turnoff_location": true,
    "details": "Joe loves his work",
    "extra_fields": null,
    "image_id": 12345,
    "image_path": "https://...../....",
    "external_id": "asf8asfa0aa3",
    "is_disabled": false
}
```

## Send location reports for one or more entities
This endpoint takes location report of one or multiple entities in below JSON format. 

```
[{
    "external_id":<string entity external id>,
    "lat": <float>,
    "lng": <float>,
    "time": <ISO timestamp>,
    "city": <string>,
    "street": <string>,
    "country": <string:ISO3>,
    "meta": {"key":"value"}
}]
```
Give the `external id` of entity in each of the reports. Remaining values are self explanatory. You could also send a meta payload of key value pairs of anything you would like to store with this location. This needs to be a JSON String.

#### Request
```sh
curl -X POST \
    -H "X-Auth-Key: f45447ae-66ce"\
    -H "X-Auth-Token: cYsCtwpsyIxNt8mgrONXEA"\
    --data '[{"external id":asf8asfa0aa3, "lat":22.001, "lng":42.001,"time":"2016-11-20T23:59:59+01:00","city":"City Name", "street":"Street Name,1", "country":"USA", "meta":""}] '\
    "https://www.arrivy.com/api/express/entities/report"
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
Get location reports of a specific entity back by 'entity_external_id'. Following url params are supported:
- time="ISO 8601 timestamp" ( all reports that came after this timestamp will be returned)
- page (optional param to get reports back in pages)
- items_per_page (optional param to get reports back in batches)

#### Request
```sh
    curl -X GET \
        -H "X-Auth-Key: f45447ae-66ce"\
        -H "X-Auth-Token: cYsCtwpsyIxNt8mgrONXEA"\
        "https://www.arrivy.com/api/express/entities/asf8asfa0aa3/readings"
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
