# SafeNode Backend API

Node.js + Express REST API for the SafeNode safety application.

## Setup

```bash
cd safenode-backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login, get JWT |
| GET | /api/contacts | Yes | Get all contacts |
| POST | /api/contacts | Yes | Add contact + send OTP |
| POST | /api/contacts/verify | Yes | Verify OTP |
| DELETE | /api/contacts/:id | Yes | Remove contact |
| POST | /api/sos | Yes | Trigger SOS alert |
| GET | /api/sos/:id/status | Yes | Get alert status |
| POST | /api/sos/:id/respond | Yes | Mark contact responded |

## Environment Variables

See `.env.example` for all required variables.

## Stack

- Node.js + Express
- MongoDB Atlas (Mongoose)
- JWT Authentication
- Twilio WhatsApp API
