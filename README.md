Cafeteria App

This is the project I built for Internet Programming which lets students browse, and order food from the campus cafeteria, and lets staff manage the menu and track orders. 

Built with React on the frontend, Node.js and Express on the backend, and MySQL for the database.


Requirements:

 Node.js  ->  https://nodejs.org
 MySQL    ->  https://dev.mysql.com/downloads/mysql


Setting Up the Database:

Open MySQL and run the database.sql file located in the root folder of this project. It will create the database, the tables, and add some starting menu items automatically.


Running the Backend:

Open a terminal and go into the backend folder:

    cd backend

Install the packages:

    npm install

Create a file called .env inside the backend folder and put this inside it:

    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your password
    DB_NAME=cafeteria
    SESSION_SECRET=somethingRandomAndLong123!
    PORT=3000

Change your password to whatever password you set when you installed MySQL.

Then start the server:

    npm run dev

It will run on http://localhost:3000


Running the Frontend:

Open a second terminal and go into the frontend folder:

    cd frontend

Install the packages:

    npm install

Start it:

    npm run dev

Then open http://localhost:5173 in your browser.


Accounts:

When you register through the app you get a customer account by default.

To get a staff account, register normally and then run this in MySQL:

    UPDATE users SET role = 'staff' WHERE email = 'your email';

Staff accounts get redirected to the dashboard after login where you can manage the menu and update order statuses.


Pages:

/login           - login page
/register        - create an account
/menu            - browse meals and place orders
/my-orders       - view your order history
/staff           - staff dashboard (staff only)