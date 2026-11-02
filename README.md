# Student Feedback Management API

A RESTful API built using **Node.js, Express.js, MongoDB and Mongoose** to manage student feedback.

## Features

- Submit student feedback.
- Store feedback in MongoDB.
- Validate required fields.
- Maintain ratings between 1 and 5.
- Fetch feedback with pagination.
- Update feedback review status.
- View database records through MongoDB Compass.
- Admin dashboard to view database information.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv

## Project Structure

```text
Student-Feedback-Management/
│
├── models/
│   └── feedback.js
│
├── admin.html
├── server.js
├── .env
├── .gitignore
├── package.json
└── package-lock.json
```

## Installation

Clone the repository:

```bash
git clone <your-repository-link>
```

Move into the project directory:

```bash
cd Student-Feedback-Management
```

Install dependencies:

```bash
npm install
```

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student_feedback
```

Use your MongoDB connection string if you are using MongoDB Atlas.

## Run the Project

```bash
node server.js
```

Expected output:

```text
MongoDB connected successfully
Server running on port 5000
```

## Feedback Schema

| Field | Type | Description |
|---|---|---|
| studentName | String | Student name |
| courseName | String | Course name |
| message | String | Feedback message |
| rating | Number | Rating from 1 to 5 |
| reviewStatus | String | Pending or Reviewed |

Default review status: `Pending`

## API Endpoints

### 1. Submit Feedback

**POST** `/api/feedback`

Request body:

```json
{
  "studentName": "Rishi Tripathi",
  "courseName": "Backend Development",
  "message": "The course was very useful.",
  "rating": 5
}
```

### 2. Get All Feedback

**GET** `/api/feedback?page=1&limit=5`

Returns feedback records with pagination.

Response includes:
- currentPage
- totalRecords
- feedback

### 3. Update Feedback Status

**PATCH** `/api/feedback/:id`

Request body:

```json
{
  "status": "Reviewed"
}
```

Allowed values:
- Pending
- Reviewed

### 4. Admin Database View

**GET** `/api/admin/database`

Returns:
- Database connection status
- Database name
- Collection names
- Total feedback records
- Feedback documents

Admin dashboard:

`http://localhost:5000/admin`

## Validation

- All feedback fields are required.
- Student name, course name and message cannot be empty.
- Rating must be between 1 and 5.
- Review status can only be Pending or Reviewed.
- Invalid feedback IDs are rejected.
- Feedback not found returns a 404 response.

## Database

MongoDB stores feedback documents in the `feedbacks` collection.

The database can also be viewed using MongoDB Compass.

## Author

Rishi Tripathi

## License

This project is developed for academic and learning purposes.
