## APIs implemented

You can import `postman_collection.json` to test more efficiently in Postman.

1. ***GET*** `/contracts/:id` - Returns the contract only if it belongs to the profile calling. better fix that!

2. ***GET*** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

3. ***GET*** `/jobs/unpaid` -  Get all unpaid jobs for a user (***either*** a client or contractor), for ***active contracts only***.

4. ***POST*** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

5. ***POST*** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

6. ***GET*** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

7. ***GET*** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```
