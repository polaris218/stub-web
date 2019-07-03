## Custom Webhook

> This functionality provides the facility of receiving a generic payload against the events being done on ARRIVY, to your custom webhook. If you intend to not receive push notification for a specific event please pass the optional flag 'do_not_send_webhook_notification' as True in the body of that respective request.

ARRIVY will POST a generic payload against following events:
## Events for Custom Webhook
An `EVENT` can be considered as any activity related to a TASK or TASK STATUS e.g. task create, update, delete or report a task status etc. Events for which push notifications will be triggered are:

| Events | 
|---|
| Task create,delete,reschedule and delay (Late/No Show) |
| Task Update (Crew assigned/removed, Equipment assigned/removed) |
| Task Rating create |
| Task Status create |
| Entity or task assignee ARRIVING/Nearby message |

## Payload
Push notification's payload is a JSON structure that contains following attributes:

|Attributes|Details
|---|
| EVENT_TYPE |A string indicating title of an `EVENT` e.g. TASK_CREATED or TASK_DELETED etc
| REPORTER_ID |ID of the Entity who reported an `EVENT`
| REPORTER_NAME |Name of the Entity who reported an `EVENT` 
| TITLE |A string breifly describing the `EVENT` for which push notification was triggered
| MESSAGE |A string describing the contents of the `EVENT` in detail 
| OBJECT_ID |ID of `TASK` in ARRIVY's datastore
| OBJECT_DATE |start date time of `TASK`
| OBJECT_TYPE |indicates the `ENTITY`, which was modified and push notification triggered as a result e.g. TASK or TASK STATUS etc
| EVENT_ID |ID of `EVENT` in ARRIVY's datastore
| TIMESTAMP |`EVENT` creation timestamp
| HAS_ATTACHMENTS |a flag which will be true if any attachments were present in `TASK STATUS`, otherwise false
| EXTRA_FIELDS |extra_fields of both `TASK` and `TASK STATUS`
| IS_TRANSIENT_STATUS |a flag which will be true if any `TASK STATUS` is reported which is transient i.e. status will be removed from task after some time. For example AUTO_START_PENDING status, which will be removed when AUTO_START or START is reported on `TASK`
| TASK_GROUP_ID|ID of the group associated with the task
| TASK_EXTERNAL_ID |external_id of task
| RESPONSE_FROM_CUSTOMER|A flag which will be true if a customer left a new rating or gives response to Arrivy-generated emails, SMS texts and messages posted through the Task Journal (shown on the customer’s Live Track page)

## All Possible EVENT_TYPES
	TASK_CREATED
	TASK_DELETED
	TASK_STATUS
	CREW_ASSIGNED
	CREW_REMOVED
	EQUIPMENT_ASSIGNED
	EQUIPMENT_REMOVED
	TASK_RATING
	TASK_RESCHEDULED
	ARRIVING
	LATE
	NOSHOW

## All Possible OBJECT_TYPES

	TASK
	TASK_STATUS
	CREW
	EQUIPMENT
	TASK_RATING

## Sample Payload
	{
		"OBJECT_ID": 5678633960079360, 
		"EVENT_TIMESTAMP": 1521210658, 
		"TITLE": "Webhook Test added", 
		"REPORTER_NAME": "Jack White", 
		"HAS_ATTACHMENT": false, 
		"EVENT_ID": 5115684006658048, 
		"REPORTER_ID": 5910974510923776, 
		"OBJECT_DATE": "2018-03-16T14:30:58+05:00", 
		"OBJECT_TYPE": "TASK", 
		"EXTRA_FIELDS": {"task_color": "#0693E3"}, 
		"EVENT_TYPE": "TASK_CREATED", 
		"IS_TRANSIENT_STATUS": false,
		"TASK_GROUP_ID": 1430933968578532,
		"TASK_EXTERNAL_ID": task0001,
		"RESPONSE_FROM_CUSTOMER": false,
		"MESSAGE": "New Task Webhook Test added for 03/16 02:30 PM by Jack White. Victor York assigned."
	}
