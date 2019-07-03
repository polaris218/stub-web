## Tasks

> A Task is work that can be assigned to an `Entity`. This could be a service call, moving job, package delivery, food order or any other job. There is no limit on number of tasks that a user can create and assign to Entities.

Once you create a Task you will be able to assign it to one or more `Entities` i.e. your tech, driver or crew members. Once a task is assigned to a crew member they can **report status** on the task e.g. 'on their way to task', 'started', 'complete' etc. Also you can fetch the live estimate of the crew or driver arrival to the task location and task completion using our APIs.

> Task Status is a specific status entry related to a task. It can be reported by the office scheduler, internal system, assigned crew, customer (Thanks to our sms & email relay and our ability to attach note to a live task directly) and in some cases arrivy system.

Arrivy supports variety of Task Status types and let users customize that statuses they want for each of their different job types.

Note: Any outgoing notification to customer is branded with the given user information (customizations in progress) and the customer is able to respond to it. Response is relayed back to the business and made part of the task as a new status entry.

Let's first look at all the basic APIs needed to leverage Arrivy's task module.

URL|HTTP VERB|Functionality|
---|---------|-------------|
https://www.arrivy.com/api/tasks/new | POST | [Add New Task](#add-new-task)
https://www.arrivy.com/api/tasks/{task-id:int} | GET, PUT, DELETE | [Get, Update and Delete Task](#get-update-and-delete-task)
https://www.arrivy.com/api/tasks | GET | [List All Tasks](#list-all-tasks)
https://www.arrivy.com/api/tasks/{task-id:int}/status/new | POST | [Report New Task Status](#report-task-status)
https://www.arrivy.com/api/tasks/{task-id:int}/status/{taskstatus_id:int} | GET, PUT, DELETE | [Get, Update and Delete Task Status](#get-update-and-delete-task)
https://www.arrivy.com/api/tasks/{task-id:int}/status | GET | [List All Status of Task](#list-all-statuses-of-task)
https://www.arrivy.com/api/tasks/{task-id:int}/estimate | GET | [Estimate of arrival at Task](#estimate-arrival-at-task)
https://www.arrivy.com/api/tasks/{task-id:int}/rating | GET | [Rating left by the customer](#rating-left-by-the-customer)

## Add new task
Adds a new task to your account. This is a POST call. Anatomy of task is explained below:

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
enable_time_window_display | True indicates that additional time window on task is required *Optional*
time_window_start | Value of additional time window (in mins) required on task. This will only have effect if `enable_time_window_display` is also present as `True` in the payload *Optional*
unscheduled | True indicates that task is marked as unscheduled. Arrivy doesn't share time of the task in customer outgoing notifications. Additionally, unscheduled tasks can only be fetched separately in /api/tasks by passing url parameters ?unscheduled=true *Optional*
extra_fields | A key value pair object as JSON. This is very useful as it can help store essentially any custom data with the task. It could be hourly_rate: x amount, estimated_hours: 4 hours etc. *Optional*
notifications | A key value pair as JSON. Possible key options are: sms, email, facebook (in works). Indicate true or false to turn on or off each of these channels. *Optional*
source | String source of the task e.g. it can be google or any other calendar or your own system. *Optional*
source_id | Identifier to correlate this task with the id of task in any other system. *Optional*
external_id | typically, an id from the client system. *Optional*
group_id | ID of that group to which this task should belong. *Optional*
additional_addresses | A JSON String which is used to store multiple addresses on a task. It can contain several JSON objects, having key value pairs of address attributes. Every address Object will have attributes: **title, address_line_1, address_line_2, city, state, country, zipcode and exact_location**. exact_location is a JSON string having two keys "lat" and "lng". *Optional*
#### Request
```sh
    curl -X POST \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        --data 'title=Adam Order&start_datetime=2016-11-21T09:00:7-08:00&end_datetime=2016-11-21T11:00:7-08:00'\
        "https://www.arrivy.com/api/tasks/new"
```
#### Response
```json
{
  "id": 5348024557502464,
  "url_safe_id": "---------------------------"
}
```

## Get, update and delete task
### Endpoint
https://www.arrivy.com/api/tasks/{task_id:int}

Supported operations are GET, PUT and DELETE. GET returns the entire payload as described above and it can also some additional details regarding latest status of the task, summary report when the task is completed etc.

Delete is self-explanatory.

UPDATE can be used to change any field values on the task. Just send the values that you would like updated. Most common use is modifying entities_id to change crew assignment on a task.

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

#### Request
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/tasks?from=2016-11-20T00:00:00-08:00&to=2016-11-26T23:59:59-08:00"
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
Reports a new task status for your task. This is a POST call. Anatomy of task status is explained below:

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
        "https://www.arrivy.com/api/tasks/123123132/status/new"
```
#### Response
```json
{
  "id": 5348024557502464
}
```


## Get, update and delete task status
### Endpoint
https://www.arrivy.com/api/tasks/{task_id:int}/status/{taskstatus_id:int}

Supported operations are GET, PUT and DELETE. GET returns the entire payload outlined above. Delete is self-explanatory.

UPDATE can be used to change any field values on the task status. Just send the values that you would like updated.

Note: extra_fields structure is deserialized and returned as an Object. The time structure are returned back converted to UTC is ISO 8601 format.

## List all statuses of task
List all statuses of a task. The ID of the task is part of the URL. Here are the possible URL params that you can send.

Field|Details|
---|---------|
page | Default value is 1 if not supplied. *Optional*
items_per_page | Default value is 100 if not supplied. *Optional*

#### Request
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/tasks/<task_id>/status"
```

#### Response
```json
[
    {
        "id": 5348024557502464,
        "type": "ENROUTE",
        "time": "2016-11-21T09:00:7-00:00",
        "reporter_name":"Steven",
        "reporter_id":123456
    }
]
```

## Estimate arrival at task
Get estimate of arrival at task.
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/tasks/5348024557502464/estimate"
```
#### Response
```json
{
    "estimate": "40 minutes"
}
```

## Rating left by the customer
Get the rating left by the customer at task completion.
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/tasks/5348024557502464/rating"
```
#### Response
```json
[
  {
    "rating": 5,
    "text": "Way to go guys",
    "customer_state": "California",
    "customer_last_name": "K",
    "customer_city": "San Francisco",
    "time_original_iso_str": "2017-10-13T23:23:33-07:00",
    "time": "2017-10-14T06:23:33",
    "customer_first_name": "John Doe",
    "customer_country": "United States",
    "id": ....
  }
]
```
