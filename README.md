# BlogSpace

BlogSpace is a full-stack blogging application built as an internship project. Readers can browse published posts, search by title, and filter by category. Registered users can sign in to manage their own blog posts through a dashboard.

## Live Deployment

- **Frontend:** [https://blogspace-web-app.netlify.app/](https://blogspace-web-app.netlify.app/)
- **Backend API:** [https://blogspace-api-v2gw.onrender.com/](https://blogspace-api-v2gw.onrender.com/)

## Features

- User registration with server-side input validation and bcrypt password hashing.
- Login with JWT authentication and a rate limit of five requests per IP address per 15-minute window.
- Dashboard with the signed-in user's name, email, and blog counts.
- Create, view, update, and delete a user's own blog posts.
- Published and Draft status support in the backend API. The current frontend editor submits posts as Published.
- Public homepage showing published posts, with title search and category filtering.
- Public blog detail pages with author and publication date.
- Logout clears the locally stored authentication token and user data.

## Technologies

- **Frontend:** HTML5, CSS3, vanilla JavaScript, Google Fonts (Inter and Plus Jakarta Sans).
- **Backend:** Node.js, Express 5, CommonJS modules, REST API.
- **Database:** MongoDB Atlas, accessed through Mongoose.
- **Authentication and security:** JSON Web Tokens (`jsonwebtoken`), bcrypt (`bcryptjs`), `express-rate-limit`, and CORS allowlisting.
- **Configuration:** `dotenv`.
- **Development server:** `nodemon` for the backend; the frontend is static and can be served using the VS Code Live Server extension.

## Project Structure

```text
Blog-Application/
├── assets/
│   └── images/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── blogController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── blog.js
│   │   └── user.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── blogRoutes.js
│   ├── .env                 # Local-only; ignored by Git
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
├── css/
│   └── style.css
├── js/
│   └── script.js
├── blog-details.html
├── create-blog.html
├── dashboard.html
├── index.html
├── login.html
├── register.html
└── README.md
```

## Local Setup

### Prerequisites

- Node.js and npm.
- A MongoDB Atlas cluster and database user.
- VS Code Live Server, or another static file server, for the frontend.

### Configure the backend

1. Open a terminal in the project root and install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create `backend/.env` and set the variables below. Replace each placeholder with your own value; never commit real credentials.

   ```env
   PORT=5000
   MONGO_URI=<your MongoDB Atlas connection string>
   JWT_SECRET=<a long, random secret value>
   FRONTEND_URL=<your deployed frontend origin>
   ```

   `MONGO_URI` and a non-empty `JWT_SECRET` are required. `PORT` is optional and defaults to `5000`. `FRONTEND_URL` is optional; when set, it is added to the CORS allowlist. The local frontend origins `http://127.0.0.1:5500` and `http://localhost:5500` are already allowed.

3. Start the backend from the `backend` directory:

   ```bash
   npm run dev
   ```

   For a regular start without nodemon, use `npm start`. The API listens on the configured port after MongoDB connects successfully.

### Run the frontend

The frontend has no package installation or build step. Open the project root in VS Code and use Live Server to serve `index.html` on port `5500`. Use either `http://127.0.0.1:5500` or `http://localhost:5500` to match the backend CORS allowlist.

The current `API_BASE_URL` in `js/script.js` points to the deployed Render backend. To test against a locally running backend, change that constant to `http://localhost:5000`; this is a source setting rather than a separate frontend environment variable.

## API Endpoints

Protected endpoints require this request header:

```http
Authorization: Bearer <JWT>
```

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` | Public | Backend welcome response. |
| `GET` | `/api/test` | Public | Basic API health response. |
| `POST` | `/api/auth/register` | Public | Register with `name`, `email`, and `password`. |
| `POST` | `/api/auth/login` | Public | Authenticate with `email` and `password`; returns a JWT and user profile fields. |
| `GET` | `/api/blogs/published` | Public | List published blog posts. |
| `GET` | `/api/blogs/published/:id` | Public | Get one published post by its MongoDB ID. |
| `POST` | `/api/blogs` | JWT required | Create a post for the authenticated user. |
| `GET` | `/api/blogs` | JWT required | List the authenticated user's posts. |
| `PUT` | `/api/blogs/:id` | JWT required | Update an owned post. |
| `DELETE` | `/api/blogs/:id` | JWT required | Delete an owned post. |

Blog posts support `title`, `category`, `content`, an optional `image` URL, and a `status` of `Published` or `Draft`. If status is omitted on creation, the backend defaults it to `Published`. Login is limited to five requests per IP in 15 minutes; excess requests receive HTTP 429.

## Database

BlogSpace uses MongoDB Atlas for persistent user and blog storage. Set `MONGO_URI` to the connection string for your Atlas cluster. Ensure the Atlas database user and network access settings permit the backend deployment or local development machine to connect.

## Development Notes

The backend package's `test` script is currently a placeholder; automated project tests are not configured.

## Author and Repository

- **Author:** [shamsulmahroofa](https://github.com/shamsulmahroofa)
- **GitHub repository:** [https://github.com/shamsulmahroofa/Blog-Application](https://github.com/shamsulmahroofa/Blog-Application)
- Copyright © 2026 Shamsul Mahroofa
