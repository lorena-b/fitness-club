# Instructions

## Setup

1. In the console, navigate into the `PB` directory.
2. In the console, run `./startup.sh` to create a virtual environment and install the required packages.
3. Run `./run.sh` to create the database and start the server.

## Postman

1. In the console, run `./run.sh` to start the server.
2. In Postman, import the `TFC.postman_collection.json` file.
3. In Postman, click on the imported folder titled `CSC309 TFC` to reveal four tabs. Click on the `Variables` tab. This is where everything for the request endpoints are stored. Please take note of every variable to save time.
3. In Postman, create and account (if not already created) and login using the respective requests in the `Accounts` folder.
4. In the response from the `login` request, copy the `access_token` value and use it to set the `<bearer_token>` variable in the `Variables` tab. This will be used for all requests that require authentication. If the token expires, simply login again and copy the new token.
5. Open `documentation.md` for more information on the API.

## Admin Panel Access

0. Stop the server if it is running.
1. Create an admin account by running `./manage.py createsuperuser` in the console. Follow the prompts to create an account.
2. Run `./run.sh` to start the server.
3. Navigate to `localhost:7893/admin` in your browser and login with your admin account.
4. You can now create, edit, and delete everything related to the website.

## Admin Panel Usage

### Accounts
### Studios
### Classes
1. Navigate to the `Classs` page in the admin panel.
2. Click `Add Class` to create a new class.
3. Fill out the form and click `Save` to create the class.
4. View the ID of the class on the `Classs` page, as well as the ID of the studio it is associated with.
### Class Times
1. Navigate to the `Class Times` page in the admin panel.
2. Click `Add Class Time` to create a new class time.
3. Fill out the form and click `Save` to create the class time.
4. You can optionally attach this class time to a Recurring Class ID so that it deletes itself when the Recurring Class is deleted.
5. Each Class Time is associated with a Class ID and a Studio ID, but is unique on its own. This allows the user to enrol in specific class times, even ones from recurring classes.
### Recurring Classes
1. Navigate to the `Recurring Classes` page in the admin panel.
2. Click `Add Recurring Class` to create a new recurring class.
3. Fill out the form and click `Save` to create the recurring class. Note that the ClassTimes generated from this are always spaced 7 days apart until the end date.
4. Delete all class times that are associated with the recurring class by going into the Recurring Class object and deleting it.
### Subscriptions
1. Navigate to the Plan page in admin panel.
2. Click Add on Plan to create a new plan.
3. Fill out form and save.