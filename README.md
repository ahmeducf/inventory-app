# Inventory Management System

A simple Inventory Management System web app built using
Node.js, Express.js, and MongoDB, to practice CRUD operations.

## Features

- Create, Read, Update, and Delete items, categories, and users.
- Role based access control.
- User authentication and authorization.
- Passwords hashing.
- Responses compression.
- Requests rate limiting.
- Form validation and sanitization.

## Technologies Used

- Node.js: JavaScript runtime environment
- Express.js: Web application framework
- Pug: Template engine
- MongoDB: NoSQL database
- Mongoose: MongoDB object modeling tool
- Passport.js: Authentication middleware
- bcrypt.js: Password hashing function
- luxon: Date and time library
- eslint: JavaScript linter
- prettier: Code formatter

## Local Installation

1- Clone the repo:

```bash
git@github.com:ahmeducf/inventory-app.git
```

2- Navigate to the project directory:

```bash
cd inventory-app
```

3- Install dependencies:

```bash
npm install
```

4- Create a `.env` file in the root directory and add the following:

```bash
MONGODB_URI=<Your mongodb connection string>
SESSION_SECRET=<Your session secret>
```

5- Run the app in development mode:

```bash
npm run dev
```

6- Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## If I have more time

- Add more features.
- Improve the UI/UX.
