# Financial-blog

A personal writing blog about money notes, not a finance tracker. This is not Ledgerly (`finance-tracker`).

The UI is a Create React App client (`my-app`). The API is Express + MongoDB (`api`), with cookie JWT for register/login and post CRUD.

## Run

API (port 4000):

```bash
cd api
cp .env.example .env
# fill MONGODB_URI and JWT_SECRET
npm install
npm start
```

Client:

```bash
cd my-app
npm install
npm start
```

## Secrets

`api/.env` was previously committed. Treat `MONGODB_URI` and `JWT_SECRET` as compromised: **rotate these credentials** in MongoDB Atlas (or wherever the cluster lives) and issue a new JWT secret. Do not reuse the old values from git history.
