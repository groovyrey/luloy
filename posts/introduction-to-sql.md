---
title: Introduction to SQL
date: 2025-07-15
author: Luloy
description: A basic introduction to SQL (Structured Query Language), covering its core concepts and fundamental commands for managing relational databases.
tags:
  - SQL
  - Database
  - Programming
---

# Introduction to SQL

SQL (Structured Query Language) is a standard language for storing, manipulating and retrieving data in relational databases.

It's the backbone of many data-driven applications, allowing you to interact with databases to perform various operations.

## Key Concepts:

*   **Databases:** Organized collections of data.
*   **Tables:** Structures within a database that store data in rows and columns.
*   **Rows (Records):** A single entry in a table.
*   **Columns (Fields):** Attributes or categories of data within a table.

## Basic SQL Commands:

*   `SELECT`: Extracts data from a database.
*   `FROM`: Specifies the table to retrieve data from.
*   `WHERE`: Filters records based on a specified condition.
*   `INSERT INTO`: Inserts new data into a database.
*   `UPDATE`: Modifies existing data in a database.
*   `DELETE FROM`: Deletes data from a database.

### Example: SELECT Statement

To retrieve all columns from a table named `Customers`:

```sql
SELECT *
FROM Customers;
```

To select specific columns like `FirstName` and `LastName`:

```sql
SELECT FirstName, LastName
FROM Customers;
```

### Example: INSERT INTO Statement

To add a new customer to the `Customers` table:

```sql
INSERT INTO Customers (FirstName, LastName, Email)
VALUES ('John', 'Doe', 'john.doe@example.com');
```

### Example: UPDATE Statement

To change the email address for a customer with `CustomerID` 1:

```sql
UPDATE Customers
SET Email = 'new.email@example.com'
WHERE CustomerID = 1;
```

### Example: DELETE FROM Statement

To remove a customer with `CustomerID` 1 from the `Customers` table:

```sql
DELETE FROM Customers
WHERE CustomerID = 1;
```

SQL is a powerful and essential skill for anyone working with data.