## Arrivy REST API

> Arrivy connects business and their customers in real-time and engages them through the last mile. 

Arrivy's REST API enables integration of real-time management for service call / delivery progress to keep all stakeholders (schedulers, field crew, customers and enterprise systems) in sync. The Arrivy REST API allows you to:

- Create tasks
- Ability to fetch status of the task including entire history
- Assign them to crew (aka entities)
- Manage your active crew
- Enable crew to report progress on any given task with notes and pictures
- Store and retrieve crew location along with metadata
- Enable live tracking of the crew
- Real-time arrival estimate of the task
- Enable customers to get real-time view of the task along with sms and email notifications

Once you use the API you automatically leverage Arrivy features like two way communication relay via sms and email, integration with slack and google calendar to name a few.


**Base URL**

All URLs referenced in the documentation have the following base:

```bash
https://www.arrivy.com/api
```

These are the four key modules of the Arrivy API:
1. Authentication
2. Entity
3. Location
4. Task

Basic integration of our APIs is simple. In case there are any questions or issues please reach out to [Dev Support](mailto:dev.support@arrivy.com)