The Arrivy system is built in a modular way. You can pick and choose the functionality you would like to use from the set of Arrivy's API modules. The integration can be as simple as a single API call. Key concepts of the system are described below.

#### Entity

> An Entity can be a service tech, delivery person or crew member.

Once you create an entity you will be able to assign them to tasks and get progress information. You can easily acquire real-time location information on Entities, as well. There is no limit on the number of entities that can be created under an Arrivy Account.


#### Task

> A Task is work that can be assigned to an `Entity`. This could be an order, service call, delivery, moving job, or any other job. A Task is the basic unit of work in Arrivy and is roughly analogous to a calendar appointment.

Tasks support a wide range of properties including customer information, assigned crew, task details, etc. Tasks are tied to other essential concepts like Task Status, Estimates, Templates, Custom Messaging, etc. Just like entities, there is no limit on the number of Tasks that a user can create and assign to entities.

#### Task Status

> Task Status is a specific message on the state of a Task that is typically used to indicate Task progress and/or to report information relevant to the Task. Examples of Task Statuses include, “Enroute,” “Start,” “Complete,” “Cancel,” as well as typed notes. It can be reported by the crew (via APIs or Mobile Apps), office scheduler, external systems, customer and in many cases the Arrivy system, itself.

Arrivy supports a variety of Task Status types (i.e. built-in Status messages) and users can define their own templates for different kind of tasks e.g. pickup, long distance move, service call etc.

#### Location Report

> The Location Report is a single location record for an Entity with a timestamp and any metadata you would like to store with it.

Location Reporting is an optional API. Arrivy provides its own mobile apps for crew members. If you plan to leverage the Arrivy app to assign tasks, report progress and do intelligent location reporting then you don't need to integrate location reporting APIs. Otherwise, you’ll need to use the Location Reporting API within your own mobile apps (or tracking system) to provide location data to the Arrivy system.

#### Webhooks

Arrivy supports webhooks to send task related state changes to other Enterprise Systems. The webhook can be easily setup under Settings.

#### Notes

* Outbound customer notifications (email and SMS) are tied to different states of the task and the reported task statuses. These can be customized using our visual template designer under Settings. 
* All of these notifications can be responded to by the customer and their responses are sent to your system via webhook functionality.
* A group of tasks that have the same assignees (entities) are treated as a Route in Arrivy System. You will see this reference several times in the portal.
