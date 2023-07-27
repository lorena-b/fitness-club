# User Story: Accounts

## Function/Class Name: SignUpView
Endpoint: accounts/signup/

Allowed methods: POST

Description: 
> Signs the user up and saves the user info as parsed in request body but only needs username and
> password to succeed and create the user.

Request body: 
```json
{
    "username(required)":.., 
    "password(required)":.., 
    "email(optional)": .., 
    "phone(optional)": ..,
    "first_name(optional)": ..,
    "last_name(optional)": ..,
    "avatar(optional)": ..
}
```

Authorization: Bearer JWT Token

Return Body:

If no avatar is given:
```json
{
	"username": ..,
	"email": ..,
	"phone": ..,
	"first_name": ..,
	"last_name": ..
}
```

Otherwise:
```json
{
	"username": ..,
	"email": ..,
	"phone": ..,
	"first_name": ..,
	"last_name": ..,
	"avatar": ..
}
```

## Function/Class Name: login

Endpoint: accounts/login/

Allowed methods: POST

Description: 
>Invokes the JWT Token Obtain Pair View to provide the user with a JWT access token
which they can use to access endpoints that require authorization.

Request body: 
```json
{"username(required)":.., "password(required)":..}
```
Authorization: None

Return body:
```json
{"refresh":..,"access": ..}
```


## Function/Class Name: ProfileEdit
Endpoint: accounts/profile_edit/

Allowed methods: POST, GET

Description: 
> On GET sends user details as JSON, on POST, changes details to new details user parsed and sends a JSON with the new user details.

Request body: None on GET -- 

 on POST can be empty or:
```json
{
    "email(optional)": .., 
    "phone(optional)": ..,
    "first_name(optional)": ..,
    "last_name(optional)": ..,
    "avatar(optional)": ..
} 
```
Authorization: Bearer JWT Token

Return Body:

If no avatar is given:
```json
	{
		"username": ..,
		"email": ..,
		"phone": ..,
		"first_name": ..,
		"last_name": ..
	}
```
Otherwise:
```json
	{
		"username": ..,
		"email": ..,
		"phone": ..,
		"first_name": ..,
		"last_name": ..,
		"avatar": ..
	}
```



## Function/Class Name: LogoutView
Endpoint: accounts/logout/

Description: 
> Logs user out of system using User method, front end will have to handle dispostion of token.

Allowed methods: POST

Request body: None

Authorization: Bearer JWT Token

Return body:

    "Logged Out"


## View: ClassChronologyView
View the class history and future classes of a user, if applicable to show.


**Endpoint:** `accounts/classes/`

**Allowed methods:** `GET`

**Payload:** None 

**Authorization:** Bearer JWT Token

**Header**: `Content-Type application/json`

**Example:**
`GET http://localhost:8000/accounts/classes/`

Response: 

```json
{
    "History": [
        {
            "class_name": "Yoga", 
            "start_time": "2022-11-16T20:00:00Z",
            "end_time":  "2022-11-16T21:00:00Z",
            "class_id": 1,
            "class_time_id": 3
        }
    ],
    "Upcoming": [
        {
            "class_name": "Yoga", 
            "start_time": "2022-21-16T20:00:00Z",
            "end_time":  "2022-21-16T21:00:00Z",
            "class_id": 1,
            "class_time_id": 5
        }
    ]
}
```

# User Story: Subscriptions

## Function/Class Name: Subscribe

Endpoint: subscriptions/subscribe/

Description: 
> Subscibes a user to the given plan with the given price and adds their cars details.
Stores all the data then returns a JSON of the user's chosen plan.

Allowed methods: POST

Authorization: Bearer JWT Token

Request body: 
ALL REQUIRED-
```json
{
	"card_details": 
		{
			"card_number": .., 
			"cvv": .., 
			"expiry_date":..
		},
    "plan": ..
}
```

Return body:
```json
    {"plan":.., "price": ..}
```

## Function/Class Name: ChangePayment
Endpoint: subscriptions/change_payment/

Description: 
> Changes the user's payment method for their subscriptions and returns a JSON of their new payment method.

Allowed methods: POST

Authorization: Bearer JWT Token

Request body: 
ALL REQUIRED-
```json
{
	"card_details": 
	{
		"card_number": .., 
		"cvv": .., 
		"expiry_date":..
	}
}
```
Return body:
```json
{
	"card_number": .., 
	"cvv": .., 
	"expiry_date": ..
}
```


## Function/Class Name: ChangePlan
Endpoint: subscriptions/change_plan/

Description: 
> Changes the user's subscribed plan, they will be charged the new price on future payments. Returns a JSON of the new plan.

Allowed methods: POST

Authorization: Bearer JWT Toke

Request body: 
ALL REQUIRED-
```json 
{"plan": ..}
```

Return body:
```json
{"plan": .., "price":..}
```


## Function/Class Name: CancelPlan
Endpoint: subscriptions/cancel/

Description: 
> Cancels the user's subscription, they will remain active until their next payment date and will remain enrolled in all classes until then. 

Allowed methods: POST

Request body: None

Authorization: Bearer JWT Token

Return body:

    'Subscription cancelled'


## Function/Class Name: GetPlans
Endpoint: subscriptions/get_plans/

Description: 
> Gets a JSON of all the plans available.

Allowed methods: GET

Request body: None

Authorization: None
s
Return body:
```json
{
    "Ultra": {
        "name": "Ultra",
        "price": "36.99"
    },
    "Regular": {
        "name": "Regular",
        "price": "25.99"
    }
}
```
   


## Function/Class Name: PaymentHistory
Endpoint: subscriptions/payment_history/

Description: 
> Returns a JSON of all past payments made by the user as well as their upcoming payment. 

Allowed methods: GET

Request body: None

Authorization: Bearer JWT Token

Return body:
```json
    {
        "Payment 1": 
			{
				"datetime": .., 
            	"plan": .., 
				"price": .., 
            	"card_number": ..
			},
        "Payment 2": 
			{
				"datetime": .., 
            	"plan": .., 
				"price": .., 
            	"card_number": ..
			},
		.
		.
		.
        "Payment n": 
			{
				"datetime": .., 
            	"plan": .., 
				"price": .., 
            	"card_number": ..
			},
        "Next Payment": 
			{
				"datetime": .., 
            	"plan": .., 
				"price": .., 
            	"card_number": ..
			}
    }
```

## Function/Class Name: update_payments
Endpoint: None

Description: 
> This is a function that runs on a background daemon thread and keeps all user payments up to date
> and ensure correctness in both the database and classes. A thread is dedicated to this function
> and is created on startup of the server, the function itself runs endlessly and fetches all 
> subscriptions that have to make payments on the current date, if the user has not cancelled their
> subscription, it will add a payment to their payment history and set the next payment date
> to a month from the current date (when payment was made). If the user has cancelled their
> subscription, it will not make the payment and instead set their next payment date to None
> and proceed to remove the user from every class they have been enrolled in before emptying their
> list of enrolled classes. It saves the changes in the database. The thread then puts itself on pause
> for 1 day, when it wakes up it will run the loop again for the next day and so on. 

Allowed methods: None

Request body: None

Authorization: None

Return body: None


# User Story: Studios 

## View: StudioView 

Returns the information for a studio of a given studio id. Given a user location payload, it will return the computed distance to the studio and directions. 

**Endpoint:** `studios/<studio_id>/info`

**Allowed methods:** `GET`, `POST`

**Payload:** `{"user_location": <address>}` 

**Header**: `Content-Type application/json`

### Example: 
`POST http://localhost:8000/studios/1/info/`

Body: `{"user_location": "1401 Derby County Cres Oakville"}`

Response:
```json
{
	"id": 1,
	"name": "TFC Spadina",
	"address": "111 Spadina Ave",
	"latitude": 45.4025737,
	"longitude": -75.71945082868629,
	"postal_code": "L6M4H7",
	"phone_number": "999-999-9999",
	"amenities": [
		{
			"type": "Pool",
			"quantity": 1
		}
	],
	"classes": [
		{
			"id": 1,
			"name": "yoga",
			"studio_id": 1,
			"description": "yoga class",
			"coach": "lori",
			"keywords": "nice yoga class",
			"cancelled": false
		}
	],
	"images": [
		{
			"image": "http://localhost:8000/img/goodlife-gym-closures-covid-19.webp",
			"name": "goodlife"
		}
	],
	"distance": 387.7802870864171,
	"direction_link": "https://www.google.com/maps/dir/?api=1&origin=43.446466140138185%2C%20-79.75333217956238&destination=45.4025737%2C%20-75.71945082868629"
}
```

A `GET` request can be made without a request body. Distance and direction link fields will be `null`.

Example: `GET http://localhost:8000/studios/1/info/`

## View: StudiosView

Returns the information for all studios in the database. Given a user location, it will return the studios in order of closest distance to the user. Results are paginated.

Can be filtered by query params. 

**Endpoint:** `studios/all/`

**Allowed methods:** `GET`, `POST`

**Payload:** `{"user_location": <address>}` 

**Header**: `Content-Type application/json`

**Example:**

`POST http://localhost:8000/studios/all/`

Body: `{"user_location": "1401 Derby County Cres Oakville"}`

Response:
```json
{
	"count": 2,
	"next": null,
	"previous": null,
	"results": [
		{
			"id": 2,
			"name": "TFC Dundas",
			"address": "123 Dundas Oakville",
			"latitude": 43.47522896,
			"longitude": -79.733827,
			"postal_code": "GH34NF",
			"phone_number": "999-999-9999",
			"amenities": [
				{
					"type": "Sauna",
					"quantity": 3
				},
				{
					"type": "Pool",
					"quantity": 1
				}
			],
			"classes": [],
			"images": [],
			"distance": 3.5642135245588538
		},
		{
			"id": 1,
			"name": "TFC Spadina",
			"address": "111 Spadina Ave",
			"latitude": 45.4025737,
			"longitude": -75.71945082868629,
			"postal_code": "L6M4H7",
			"phone_number": "999-999-9999",
			"amenities": [
				{
					"type": "Pool",
					"quantity": 1
				}
			],
			"classes": [
				{
					"id": 1,
					"name": "yoga",
					"studio_id": 1,
					"description": "yoga class",
					"coach": "lori",
					"keywords": "nice yoga class",
					"cancelled": false
				}
			],
			"images": [
				{
					"image": "http://localhost:8000/img/goodlife-gym-closures-covid-19.webp",
					"name": "goodlife"
				}
			],
			"distance": 387.7802870864171
		}
	]
}
```

A `GET` request can be made without a request body. Distance will be `null`.

Example: `GET http://localhost:8000/studios/all/`

### Searching/filtering studios: 

**Query params**:
- `studio_name`: Only get studios with `"name": <studio_name>`
- `amenity_type`: Only get studios with `"type": <amenity_type>` in its `amenities`
- `class_type`: Only get studios with `"name": <class_type>` in its `classes`
- `coach`: Only get studios with `"coach": <coach>` in its `classes`

**Example**:

`POST http://localhost:8000/studios/all/?studio_name=tfc dundas`

Body: `{"user_location": "1401 Derby County Cres Oakville"}`

Response:
```json
{
	"count": 1,
	"next": null,
	"previous": null,
	"results": [
		{
			"id": 2,
			"name": "TFC Dundas",
			"address": "123 Dundas Oakville",
			"latitude": 43.47522896,
			"longitude": -79.733827,
			"postal_code": "GH34NF",
			"phone_number": "999-999-9999",
			"amenities": [
				{
					"type": "Sauna",
					"quantity": 3
				},
				{
					"type": "Pool",
					"quantity": 1
				}
			],
			"classes": [],
			"images": [],
			"distance": 3.5642135245588538
		}
	]
}
```

# User Story: Classes 

## View: ClassesView

Return all of the classes of a given studio id. Supports searching and filtering/searching. Results are paginated.


**Endpoint:** `studios/<studio_id>/classes/all`

**Allowed methods:** `GET`

**Payload:** None 

**Header**: `Content-Type application/json`

**Example:**

`GET http://localhost:8000/studios/1/classes/all`

Response:
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "pilates",
      "studio_id": 1,
      "description": "pilates class",
      "coach": "loribank",
      "keywords": "fit",
      "cancelled": false
    },
    {
      "id": 2,
      "name": "yoga",
      "studio_id": 1,
      "description": "yog aclass",
      "coach": "me",
      "keywords": "namaste",
      "cancelled": false
    }
  ]
}
```

### Searching/filtering classes: 

**Query params**:
- `class_type`: Only get classes with `"name": <class_type>`
- `coach`: Only get classes with `"coach": <coach>`
- `date`: Only get classes on a date specfied by format YYYY-MM-DD in the query param. For example `?date=2022-11-16`
- `time_range`: Only get classes that fall within a specified time range given by the format HH:MM, HH:MM in the query param. The first time is the start range and the second time is the end range. For example `?time_range=05:00,06:00`

**Example**: 

`GET http://localhost:8000/studios/1/classes/all?class_type=pilates`

Response:
```json 
{
	"count": 1,
	"next": null,
	"previous": null,
	"results": [
		{
			"id": 1,
			"name": "pilates",
			"studio_id": 1,
			"description": "pilates class",
			"coach": "loribank",
			"keywords": "fit",
			"cancelled": false
		}
	]
}
```


## View: ClassView

Return the information of a class given its ID.


**Endpoint:** `studios/<studio_id>/classes/<class_id>/`

**Allowed methods:** `GET`

**Payload:** None 

**Header**: `Content-Type application/json`

**Example:**
`GET http://localhost:8000/studios/1/classes/1/`

Response:
```json
{
    "id": 2,
    "name": "pilates",
    "studio_id": 1,
    "description": "pilates class",
    "coach": "dave",
    "keywords": "nice pilates class",
    "cancelled": false
}
```

## View: ClassTimesView

Return the ClassTimes of a class given its ID. The "booked" field is always false if the user is not authorized. Otherwise, it is true if the user is enrolled in that class time.


**Endpoint:** `studios/<studio_id>/classes/<class_id>/times/`

**Allowed methods:** `GET`

**Payload:** None 

**Header**: `Content-Type application/json`

**Example:**
`GET http://localhost:8000/studios/1/classes/1/times`

Response:
```json
[
    {
        "id": 2,
        "start": "2022-11-16T20:00:00Z",
        "end": "2022-11-16T21:00:00Z",
        "booked": false,
        "slots_left": 13
    },
    {
        "id": 3,
        "start": "2022-12-16T20:00:00Z",
        "end": "2022-12-16T21:00:00Z",
        "booked": true,
        "slots_left": 11
    }
]
```

## View: SingleEnrolView

Enrol a user in the classtime ID given in the URL.


**Endpoint:** `studios/<studio_id>/classes/<class_id>/times/<class_time_id>/enrol/`

**Allowed methods:** `POST`

**Payload:** None 

**Authorization:** Bearer JWT Token

**Header**: `Content-Type application/json`

**Example:**
`GET http://localhost:8000/studios/1/classes/1/times/1/enrol/`

Response: A string confirming the user has been enrolled in the class or an error message if the user was unable to be enrolled in the class.

## View: SingleDropView

Enrol a user in the classtime ID given in the URL.


**Endpoint:** `studios/<studio_id>/classes/<class_id>/times/<class_time_id>/unenrol/`

**Allowed methods:** `POST`

**Payload:** None 

**Authorization:** Bearer JWT Token

**Header**: `Content-Type application/json`

**Example:**
`GET http://localhost:8000/studios/1/classes/1/times/1/unenrol/`

Response: A string confirming the user has been dropped from the class or an error message if the user was unable to be dropped from the class.

## View: AllEnrolView

Enrol a user in the classtime ID given in the URL.


**Endpoint:** `studios/<studio_id>/classes/<class_id>/times/enrol`

**Allowed methods:** `POST`

**Payload:** None 

**Authorization:** Bearer JWT Token

**Header**: `Content-Type application/json`

**Example:**
`GET http://localhost:8000/studios/1/classes/1/times/enrol/`

Response: A string confirming the user has been enrolled in all classes that the user was able to enrol in.

## View: AllDropView

Enrol a user in the classtime ID given in the URL.


**Endpoint:** `studios/<studio_id>/classes/<class_id>/times/unenrol`

**Allowed methods:** `POST`

**Payload:** None 

**Authorization:** Bearer JWT Token

**Header**: `Content-Type application/json`

**Example:**
`GET http://localhost:8000/studios/1/classes/1/times/unenrol/`

Response: A string confirming the user has been unenrolled in all classes that the user was able to unenrol from.
