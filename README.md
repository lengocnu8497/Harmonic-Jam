# Nu Le's Harmonic Jam Submission

## Approach

### UI
My approach to any data heavy application is to add as little components as possible and let the data be the main focus. 

With this in mind, an Add Selection button was added for the user to transition into a stepper modal where they can see and understand specific steps to add companies to a new collection. On each row, there's a Delete Icon button to help the user remove any companies that they don't wish to include in the selection. To handle bad input, an action is required to be able to move on to the next step and eventually send a request to the server.

After a request is sent, `isLoading` state tracks the request progress, button is disabled during loading to prevent duplicate requests, save button shows "Moving..." text and a spinner icon during requests. To satifsy the non-blocking UI feedback requirement, Snackbar notifications will appear at the bottom center of the screen to notify user if their request is successful or not. In case of error, the notifications allow manual dismissal for retry. Then modal can be closed while request is in progress (non-blocking).

For future improvements, the existing `CompanyTable` component can be further extended and refactored to support other purposes like drag and drop for easy collection modification, reducing a good amount of clicks that the user has to make.

### API
The main endpoint to process the move companies from one list to another is the `add_companies_to_collection()` function. Input validation is added to ensure proper error handling in case the IDs sent over from the client are invalid (this is assuming company IDs are indeed exist in the origin collection and cannot be duplicated in the destination collection). 

Given the context that the company list can be up to thousands per collection, bulk import is used instead of individual add for batch processing. There's a benefit of efficiency for large dataset with bulk import, however, a single company addition failure will affect the entire batch. More thoughts on how to combat this will be in the Tradeoffs paragraph.

It is a personal choice to not remove the added companies from the origin collection. A delete endpoint is added to remove a company from a collection - it was added for testing purposes. If needed, this can be extended to support multiple companies deletion. This can help with a new functionality on the UI where a user can multi-select companies to be removed from the parent collection.


## Tradeoffs / Future Improvements

### Bulk import vs Import jobs
As mentioned above, one big draw back from the bulk import approach is the lack of error handling when an individual company addition fails. To combat that, a new database model for job tracking can be implemented to process each companies import job while showing real-time progress update.

A job model can contains information about job status, total companies to be added, failed/successful additions, time stamps, job id. This allow the client to track failed imports with specific error messages, allowing retries and partial success handling. For list containing with much higher loads, this is even more powerful as the jobs can be queued up, allowing for resource management and throttling. With large dataset, auditability is also a big consideration - the above job model will be able to store and maintain logs of all import activities.

The client then can continously pulling using the job IDs and present a progress bar while displaying the successfully processed companies.