# Smart Retail Chalice Backend

This backend is built with **AWS Chalice** for the COMP264 Cloud ML project. It receives CSV sales data from the frontend, parses it, and returns a JSON response that can later be extended for analytics, DynamoDB storage, and AWS AI service integration.


## Running code
python -m venv venv
.\venv\Scripts\Activate.ps1

pip install chalice

chalice local

The backend should run at:

http://127.0.0.1:8000


## Project Purpose

The purpose of this backend is to support the Smart Retail frontend by:

- receiving uploaded CSV sales data
- parsing CSV rows and columns
- returning a structured response to the frontend
- serving as the base for future analytics and AWS integrations

This backend is part of a larger full-stack serverless application.

---

## Current Features

- POST `/upload` route
- accepts raw CSV text from frontend
- validates request body
- parses CSV using Python `csv.DictReader`
- returns:
  - success status
  - message
  - result ID
  - row count
  - column names

---

## Tech Stack

- **Python**
- **AWS Chalice**
- **CSV module**
- planned integration with:
  - AWS Lambda
  - DynamoDB
  - S3
  - AWS AI services

---

## Project Structure

```txt
smart-retail-api/
│
├── app.py
├── requirements.txt
├── README.md
└── .chalice/
    └── config.json



Request Headers
Content-Type: text/csv