## Customers

> Each task typically has a customer. It's optional though. There is no limit on number of Customers one can create in Arrivy.

All customer notifications are driven off of Task and TaskStatus APIs. Customer API is just to retrieve and add/update/delete the customer records so you can associate them appropriately with Tasks later on.

Let's look at all the supported APIs:

URL|HTTP VERB|Functionality|
---|---------|-------------|
https://www.arrivy.com/api/customers | GET | [List All Customers](#list-all-customers)
https://www.arrivy.com/api/customers/new | POST | [Add New Customer](#add-new-customer)
https://www.arrivy.com/api/customers/{customer-id:int} | GET | [Get Customer](#get-customer)
https://www.arrivy.com/api/customers/{customer-id:int} | PUT | [Update Customer](#update-customer)
https://www.arrivy.com/api/customers/{customer-id:int} | DELETE | [Delete a Customer](#delete-customer)

## List all Customers
List all customers for your company. You can use the `id` of any customer to call any customer-specific API later on.

Note: id and owner will always be there. Rest are optional fields.

```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/customers"
```

#### Response
```json
[
    {
        "id": 7458024557501236,
        "owner": 5629499534213120,
        "first_name": "John",
        "last_name": "Doe",
        "email":"john@doe.com",
        "mobile_number":"+14255333945",
        "extra_fields": null,
        "city": "Seattle",
        "state": "Washington",
        "country":"USA"
    },
    {
        "id": 6503924464349865,
        "owner": 5629499534213120,
        "first_name": "Dani",
        "last_name": "Alves",
        "email":"dani@alves.com",
        "mobile_number":"+13655339856",
        "city": "Seattle",
        "extra_fields": {
                "key1":"value1"
            },
        "state": "Washington",
        "country":"USA"       
    }
]
```
We also support basic customer filtering using `external_id` (one of the optional fields on the customer) by adding URL param to the above API i.e. https://www.arrivy.com/api/customers?external_id=.......

## Add new customer
Adds new customer to your company. The response will return a unique customer `id` which can be used for future API calls.

Optional fields: `company_name`,`notes`,`email`, `phone`, `mobile_number`, `extra_fields` (JSON String of key value pairs), `address_line_1`, `address_line_2`, `city`, `state`, `country`, `zipcode`, `notifications` (JSON String of key value pairs), `exact_location` (JSON String of lat and lng values) and `external_id` (typically, an id from the client system)

```sh
    curl -X POST \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        --data 'first_name=Beni&last_name=Gebrielle'\
        "https://www.arrivy.com/api/customers/new"
```
#### Response
```json
{
  "id": 1111024557509800
}
```

## Get Customer
Get all fields of a specific customer
```sh
    curl -X GET \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/customers/7458024557501236"
```
#### Response
```json
{
    "id": 7458024557501236,
    "owner": 5629499534213120,
    "first_name": "John",
    "last_name": "Doe",
    "email":"john@doe.com",
    "mobile_number":"+14255333945",
    "extra_fields": null,
    "city": "Seattle",
    "state": "Washington",
    "country":"USA"
}
```
#### Possible Errors Codes
Error Code|Message|Reason|
----------|-------|------|
404|NOT\_FOUND|customer with provided customer-id does not exist

## Update Customer
Update fields of a specific customer. Just send the fields that you would like to change
```sh
    curl -X PUT \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        --data 'email=new@email.com&phone=+14256986532'\
        "https://www.arrivy.com/api/customers/7458024557501236"
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
404|NOT\_FOUND|customer with provided customer-id does not exist


## Delete Customer
Delete a specific customer
```sh
    curl -X DELETE \
        -H "X-Auth-Key: --------------"\
        -H "X-Auth-Token: -------------------"\
        "https://www.arrivy.com/api/customers/7458024557501236"
```
#### Response
```json
{
  "message":"Deleted."
}
```
#### Possible Errors Codes
Error Code|Message|Reason|
----------|-------|------|
404|NOT\_FOUND|customer with provided customer-id does not exist
