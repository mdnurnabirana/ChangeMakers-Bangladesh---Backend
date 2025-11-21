# 🔧 ChangeMakers Bangladesh – Backend API (Node.js + Express + MongoDB)

---
## 🚀 Live API Base URL
https://changemakersbd.vercel.app

---
## 📖 Project Overview
This is the official backend server for **ChangeMakers Bangladesh** – the full-stack social development events platform.

It provides a robust, secure, and scalable RESTful API that powers the entire application:
- Full event CRUD operations
- Event joining & participation tracking
- Ownership control (users can only update/delete their own events)
- Server-side search by title & filter by event type
- Upcoming events auto-filter past dates
- All data stored persistently in MongoDB Atlas

The backend is designed with clean architecture, proper error handling, and production-ready structure while integrating seamlessly with the Firebase-authenticated frontend.

---
## 🎨 Design & Security Focus
- Modular, industry-standard folder structure (routes / controllers / models / middlewares)
- Ownership validation middleware – users can only modify their own events
- CORS restricted to frontend domain
- Proper status codes & consistent error responses
- Environment-based configuration
- Optimized MongoDB queries for performance (indexing on date, type, title)

---
## 🛠 Key Features

### Event System
- Complete CRUD for events
- Automatic upcoming-only filtering (past events excluded in /upcoming)
- Server-side search & filter (used by frontend Upcoming Events page)
- Creator email automatically attached on creation

### Join System
- Users can join any event
- Separate optimized collection for joined events
- Fast retrieval of all events joined by a user

### Security & Protection
- Ownership middleware on update/delete (creator email must match)
- All sensitive operations require authenticated user (Firebase token verified on frontend + email sent securely)
- CORS & environment protection

### Public Routes
- Get all events / upcoming events / single event
- Search & filter events by title and type

---
## 📌 API Endpoints

### Public Routes
| Method | Endpoint                        | Description                                              |
|--------|---------------------------------|----------------------------------------------------------|
| GET    | `/api/events`                   | All events + search (?search=keyword) & filter (?type=) |
| GET    | `/api/events/upcoming`          | Only upcoming events (past dates auto-filtered)          |
| GET    | `/api/events/:id`               | Single event details                                      |

### Authenticated Routes (Require logged-in user – email sent in body/header + Firebase token verified on frontend)
| Method | Endpoint                        | Description                                 |
|--------|----------------------------------|---------------------------------------------|
| POST   | `/api/events`                   | Create new event (creator email required)    |
| PATCH  | `/api/events/:id`               | Update own event only                        |
| DELETE | `/api/events/:id`               | Delete own event only                        |
| POST   | `/api/events/:id/join`          | Join an event (user email required)         |
| GET    | `/api/joined-events`            | Get all events joined by current user       |

---
## 💻 Tech Stack
**Runtime**: Node.js  
**Framework**: Express.js  
**Database**: MongoDB + Mongoose  
**Security**: CORS, dotenv, ownership middleware  
**Deployment**: Vercel  

---
## 🛠 Local Setup
```bash
git clone https://github.com/mdnurnabirana/changemakers-bd-server.git
cd changemakers-bd-server
npm install
```
---
## 📝 Author
**Md Nurnabi Rana**  
Email: [mdnurnabirana.cse@gmail.com](mailto:mdnurnabirana.cse@gmail.com)  
GitHub: [https://github.com/mdnurnabirana](https://github.com/mdnurnabirana)