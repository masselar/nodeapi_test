# CloudTech Test

### Pre-requisite
npm install

### API url
http://localhost:8081/cloudtech/api/v1.0

### Order Schema

* _id / orderId (number)
* companyName (string)
* customerAddress (string)
* orderedItem (string)

### Endpoints accessible


* POST /orders - Creates a new order
* GET /orders/:id - Retrieves a specific order
* GET /orders - Retrieves a list of orders
* DELETE /orders/:id - Removes a specific order

* GET /ordereditems - Groups and count ordered items
