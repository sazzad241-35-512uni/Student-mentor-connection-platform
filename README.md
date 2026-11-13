# Student Mentor Connection Platform

An integrated academic community web application using HTML, CSS, JavaScript, Node.js, Express, MongoDB/Mongoose, JWT, and Socket.IO. The original Deep Rose / Kathgolap-inspired responsive UI is retained and connected to persistent API data.

## Included features

1. **Frontend/backend integration:** sign-in/register, persistent posts and likes, mentors, resources, events, and protected actions use the API instead of demo-only arrays.
2. **Student discovery and connections:** search student profiles, send requests, accept/reject incoming requests, and message accepted connections.
3. **Research collaboration:** publish project proposals, list skills/fields, apply to collaborate, approve/reject applications, track collaborators, and add discussion updates.
4. **Notifications:** stored notifications for connection requests/acceptance, likes, comments, research applications, and messages; mark individual/all as read.
5. **Real-time messaging:** messages persist in MongoDB; Socket.IO sends new-message events to online recipients; conversation history, unread counts, and read receipts are supported.
6. **Admin console:** counts, user activation/deactivation, report review, and removal of reported posts/resources/events/research/comments. Admin registration is deliberately disabled publicly.

Also includes post comments, resource publishing, event creation/interest, and a content-reporting workflow.

## Requirements

- Node.js 18 or newer
- MongoDB local instance or MongoDB Atlas database
- npm

## Run the app

1. Extract the ZIP and open a terminal in the extracted `student_mentor_connection_platform` folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure `MONGODB_URI` and a long random `JWT_SECRET`. Keep `.env` private.
4. Start the app:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:5000** in your browser. The Express server serves the frontend and API from the same origin.
6. Register a student or mentor account and test the features. For two-user workflows, use a second browser/incognito window and create a second account.

Health check: `http://localhost:5000/api/health`.

## Create the first administrator

Admin accounts cannot be created from the public registration form. After setting `.env` and installing dependencies, set a one-time environment variable and run the CLI command from the project root.

macOS/Linux:

```bash
ADMIN_PASSWORD='use-a-long-unique-password' npm run create-admin -- --name 'Platform Admin' --email admin@example.com
```

PowerShell:

```powershell
$env:ADMIN_PASSWORD='use-a-long-unique-password'
npm run create-admin -- --name 'Platform Admin' --email admin@example.com
Remove-Item Env:ADMIN_PASSWORD
```

Use a password of at least 12 characters. The command creates an admin account only if that email is not already registered.

## Main API routes

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/users/mentors`, `GET /api/users/students`, `PATCH /api/users/me`
- `GET/POST /api/posts`, `POST /api/posts/:id/like`, `GET/POST /api/comments/:postId`
- `GET/POST /api/connections`, `POST /api/connections/:userId`, `PATCH /api/connections/:id`
- `GET/POST /api/research`, `POST /api/research/:id/apply`, `PATCH /api/research/:id/applications/:applicationId`, `POST /api/research/:id/discuss`
- `GET /api/notifications`, `PATCH /api/notifications/read-all`, `PATCH /api/notifications/:id/read`
- `GET/POST /api/messages`, `GET /api/messages/:userId` (Socket.IO `new-message` event for online delivery)
- `GET/POST /api/resources`, `GET/POST /api/events`, `POST /api/events/:id/interested`
- `POST /api/reports`, admin-only `GET/PATCH /api/reports`
- Admin-only `GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `DELETE /api/admin/content/:type/:id`

## Important notes / limitations

- This is a functional academic-project starter, not a production-ready deployment. Configure `CLIENT_ORIGIN` to an explicit comma-separated allowlist before deployment; the default development setup allows the local browser origin.
- Database access and live API execution were not verified in this environment because they depend on your MongoDB connection and installed npm dependencies. Run the setup steps and test with two accounts.
- Password reset/email verification, file uploads, pagination for every collection, advanced spam protection, automated integration tests, and production deployment configuration are not included.
- Online status/typing indicators and delivery/read status beyond database read receipts are not implemented. Socket.IO delivers new-message events when the recipient is connected; clients reload history when reopening a conversation.
