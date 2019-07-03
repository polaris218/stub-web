## Groups

> A group represents a partner company who works for a specific company. A partner company do different sort of jobs for its associated company.

Once you create an group you will be able to assign tasks, entities and resources to this group.

URL|HTTP VERB|Functionality|
---|---------|-------------|
https://www.arrivy.com/api/groups | GET | [List All Groups](#list-all-groups)
https://www.arrivy.com/api/groups/new | POST | [Add New Group](#add-new-group)
https://www.arrivy.com/api/groups/{group-id:int} | GET | [Get Group](#get-group)
https://www.arrivy.com/api/groups/{group-id:int} | PUT | [Update Group](#update-group)
https://www.arrivy.com/api/groups/{group-id:int} | DELETE | [Delete a Group](#delete-group)

## List all groups
View all groups of your company. You can use the `id` of any group to call all group-specific APIs later on.

name, id and owner will always be fields in the response. Rest are optional fields.

Field|Details|
---|---------|
page | Default value is 1 if not supplied. *Optional*
items_per_page | Default value is 100 if not supplied. *Optional*

#### Request
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/groups"
```

#### Response
```json
[
    {
        "id": 6100296669331456,
        "owner": 5629499534213120,
        "name": "Alpha Movers",
        "description": "Partner of BestMovers",
        "email":"alpha_movers@bestmovers.com",
        "phone": null,
        "mobile_number": "+1 978 699 5697",
        "emergency": ""+1 978 699 9866",
        "extra_fields": null,
        "address_line_1": "1666 188th ave ne",
        "address_line_2": "",
        "city": "Woodinville"
        "state": "WA"
        "country": "USA"
        "zipcode": ""98011""
        "image_id": 12345,
        "image_path": "https://...../...."
    },
    {
        "id": 9865326669125499,
        "owner": 5629499534213120,
        "name": "Beta Movers",
        "description": "Partner of BestMovers",
        "email":"beta_movers@bestmovers.com",
        "phone": null,
        "mobile_number": "+1 653 236 7498",
        "emergency": ""+1 157 986 0236",
        "extra_fields": null,
        "address_line_1": "1666 188th ave ne",
        "address_line_2": "",
        "city": "Woodinville"
        "state": "WA"
        "country": "USA"
        "zipcode": ""98011""
        "image_id": 12345,
        "image_path": "https://...../...."
    }
]
```

## Add new group
Adds new group to your account. The response will return unique group `id` which can be used for future API calls. This is a POST call. Anatomy of group is explained below:

Field|Details|
---|---------|
name| Name of the group `REQUIRED`
email | Email of group *Optional*
description | Description of group *Optional*
address_line_1 | Address line 1  *Optional*
address_line_2 | Address line 2  *Optional*
city | City name  *Optional*
state | State  *Optional*
country | ISO3 country code  *Optional*
zipcode | Zip code  *Optional*
exact_location | In case the exact latitude and longitude of group location are already known. Expected format is a JSON string with these two keys "lat" and "lng". If it isn't provided we always try to geo-code the given group address. *Optional*
mobile_number | Mobile number of the group  *Optional*
phone | Phone number of group. It could be a land line number or a number with extensions  *Optional*
extra_fields | A key value pair object as JSON. This is very useful as it can help store essentially any custom data with the group. It could be hourly_rate: x amount, team_members: 4 etc. *Optional*
emergency| Emergency Contact information of the group *Optional*

#### Request
```sh
    curl -X POST \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        --data 'name=Alpha Movers&description=Partner of BestMovers'\
        "https://www.arrivy.com/api/groups/new"
```
#### Response
```json
{
  "id": 6100296669331456
}
```

#### Possible Errors Codes
Error Code|Message|Reason|
----------|-------|------|
400|DUPLICATE\_GROUP\_NAME|group with given name already exists
400|MISSING_VALUE|name attribute is missing
400|EMAIL_INVALID|email validation failed

## Get group
Get all fields of a specific group
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/groups/6100296669331456"
```
#### Response
```json
{
    "id": 6100296669331456,
    "owner": 5629499534213120,
    "name": "Alpha Movers",
    "description": "Partner of BestMovers",
    "email":"alpha_movers@bestmovers.com",
    "phone": null,
    "mobile_number": "+1 978 699 5697",
    "emergency": ""+1 978 699 9866",
    "extra_fields": null,
    "address_line_1": "1666 188th ave ne",
    "address_line_2": "",
    "city": "Woodinville"
    "state": "WA"
    "country": "USA"
    "zipcode": ""98011""
    "image_id": 12345,
    "image_path": "https://...../...."
}
```

## Update group
Update fields of a specific group. Just send the fields that you would like to change
```sh
    curl -X PUT \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        --data 'name=Alpha Movers&email=alpha_movers@bestmovers.com'\
        "https://www.arrivy.com/api/groups/6100296669331456"
```
#### Response
```json
{
  "message":"Updated."
}
```
#### Possible Errors Codes
Error Code|Message|Reason|
----------|-------|------|
400|DUPLICATE\_GROUP\_NAME|group with given name already exists
400|MISSING_VALUE|name attribute is missing
400|EMAIL_INVALID|email validation failed


## Delete group
Delete a specific group
```sh
    curl -X DELETE \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/groups/6100296669331456"
```
#### Response
```json
{
  "message":"Deleted."
}
```
