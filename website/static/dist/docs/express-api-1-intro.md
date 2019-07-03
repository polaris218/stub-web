As mentioned earlier, Task is a unit of work that can be assigned to an Entity. It can be an order, delivery, service call etc. Tasks support a wide variety of properties suited for a service call or delivery scenarios. These properties include:
- Customer information including addresses (one or more)
- Task start and end times (expected)
- Time window provided to the customer
- Assigned entities and resources (if available)
- Details of the tasks including files, notes, pictures etc.
- Notifications preference (e.g. SMS, Email)

We are happy to talk to you if you find something missing here. 

### /express/tasks/upsert/{external_id}

Task UPSERT is one single API to create or update a task in Arrivy System. If we find the provided {external_id} in our system already we will update the task otherwise we will create a new one. Typically this API integrates with Enterprise task management, calendaring or dispatch systems.

> Note the ID passed here in the URL for this UPSERT API is the **ID** of this task from **your system**. It can be of any format. This removes the need to manage Arrivy IDs at your end for each subsequent call you may have to make to update this task or report a new status on this task. You may need to store our returned IDs on task create for advanced use-cases. We will touch on this later on. The webhook will provide this ID as part of payload when Arrivy system pushes notifications to your system. The expectation here is that you will be using a unique ID for each of your tasks to communicate with Arrivy.

#### What happens once a task is created?
1. A unique URL for Live Customer Tracker is created with the relevant data.
2. The customer gets a notification regarding this task along with a short link to Tracker. If you would like to share this yourself with your customer the API also provides necessary URLs too.
3. If the crew is assigned then they receive notifications on their Arrivy Apps.
4. Webhooks relay the appropriate notifications to Enterprise Systems.

You can customize the customer notifications that go out on task creation or task state changes (e.g. Not Started to ENROUTE, START to COMPLETE etc.). This can be done by creating task templates in our status designer and assigning the appropriate template id to the task.

Here is the list of important Tasks APIs with their request & response payloads. Please click on each one of them to check out the details.