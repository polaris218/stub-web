## Entities

> An Entity can be a service tech, driver, crew member or food delivery person or any trackable asset. There is no limit on number of Entities one can create in Arrivy.

Once you create an entity you will be able to **report & fetch** its location and assign tasks. Task repesents an order or a delivery assigned to an entity.

URL|HTTP VERB|Functionality|
---|---------|-------------|
https://www.arrivy.com/api/entities | GET | [List All Entities](#list-all-entities)
https://www.arrivy.com/api/entities/new | POST | [Add New Entity](#add-new-entity)
https://www.arrivy.com/api/entities/{entity-id:int} | GET | [Get Entity](#get-entity)
https://www.arrivy.com/api/entities/{entity-id:int} | PUT | [Update Entity](#update-entity)
https://www.arrivy.com/api/entities/{entity-id:int} | DELETE | [Delete an Entity](#delete-entity)

## List all entities
View all entities of your team/company. You can use the `id` of any entity to call all entity-specific APIs later on.

name, id and type will always be fields. Rest are optional fields.

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
        "group_id": null,
        "image_id": 12345,
        "image_path": "https://...../...."
    },
    {
        "id": 6473924464345088,
        "type": "Day-Shift Driver",
        "owner": 5629499534213120,
        "name": "Adam",
        "email":"adam@steve.com",
        "details": "Adam is an avid skier",
        "extra_fields": {
                "key1":"value1"
            },
        "group_id": 9503933968570268,
        "image_id": 12367,
        "image_path": "https://...../...."        
    }
]
```
We also support basic entity filtering using `external_id` and `email` (these are the optional fields on the entity) by adding URL params to the above API i.e. https://www.arrivy.com/api/entities?external_id=...&email=...


## Add new entity
Adds new entity to your account. Required fields: `name` and `type`. The response will return unique entity `id` which can be used for future API calls.

Optional fields: `email`, `phone`, `details`, `permission`, `extra_fields` (JSON String of key value pairs), `image_id` , `image_path` and `external_id` (typically, an id from the client system), `group_id` (ID of that group to which this entity should belong).

Permission: `permission` can have one the following values, i.e. `ADMIN`, `SCHEDULER`, `FIELDCREW` and `LIMITEDACCESS`.

```sh
    curl -X POST \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        --data 'name=Lisa&type=I5 Truck Route 1'\
        "https://www.arrivy.com/api/entities/new"
```
#### Response
```json
{
  "id": 5348024557502464
}
```

#### Possible Errors Codes
Error Code|Message|Reason|
----------|-------|------|
400|DUPLICATE\_ENTITY\_NAME|entity with given name already exists
400|MISSING_VALUE|Either (name or type) attribute is missing
400|MISSING_VALUE|Either (name or type) attribute is missing
400|EMAIL_EXISTS|Email already exists

## Get entity
Get all fields of a specific entity
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/entities/5348024557502464"
```
#### Response
```json
{
    "id": 5348024557502464,
    "type": "Night-Shift Driver",
    "owner": 5629499534213120,
    "name": "John",
    "email":"john@doe.com",
    "details": "Joe loves his work",
    "extra_fields": null,
    "group_id": null,
    "image_id": 12345,
    "image_path": "https://...../...."
}
```

## Update entity
Update fields of a specific entity. Just send the fields that you would like to change
```sh
    curl -X PUT \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        --data 'name=The New Guy&type=The New Route'\
        "https://www.arrivy.com/api/entities/5348024557502464"
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
400|DUPLICATE\_ENTITY\_NAME|entity with such name already exists
400|MISSING\_REQUEST\_INFO|Either (name or type) attribute is missing


## Delete entity
Delete a specific entity
```sh
    curl -X DELETE \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/entities/5348024557502464"
```
#### Response
```json
{
  "message":"Deleted."
}
```
