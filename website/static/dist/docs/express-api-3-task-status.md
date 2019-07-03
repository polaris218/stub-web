> **If you are planning to use Arrivy Mobile Apps for your field crew to report progress then you don't need to integrate this API.**

Task Status is a specific status report on a task. The payload includes:

- Type of the Status
- Reporter Name, ID and Report Time
- Notes, Pictures, Files etc.
- Flags to indicate whether this status is visible to customer or not

#### What happens when a new task status is created?
It depends. This is dictated by the template assigned to the task. The template can define what notifications go out when a new status is reported. Please read [Arrivy Help](https://help.arrivy.com/settings/templates-statuses) for more details.

Here goes the detail of the Task Status API:
