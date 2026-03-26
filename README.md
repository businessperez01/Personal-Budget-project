## Personal Budget API (Envelope Budgeting)

Node/Express API for creating and managing budget envelopes. Envelopes track a `budget` balance, support withdrawals (no overspending), and allow transfers between envelopes.

### Setup

- **Install dependencies**

```bash
cd server
npm install
```

- **Run the API**

```bash
cd server
npm start
```

The server runs on `http://localhost:3000`.

If PowerShell blocks `npm` due to execution policy, you can run directly:

```bash
cd server
node index.js
```

### API Endpoints

#### Health / demo
- **GET** `/`
  - Returns: `Hello, World`

#### Envelopes
- **POST** `/envelopes`
  - Body:

```json
{ "name": "Groceries", "budget": 400 }
```

  - Returns: `201` with the created envelope:
    - `{ "id": number, "name": string, "budget": number }`

- **GET** `/envelopes`
  - Returns: `200` with all envelopes (array)

- **GET** `/envelopes/:id`
  - Returns: `200` with one envelope
  - Returns: `404` if not found

- **PATCH** `/envelopes/:id`
  - Update fields and/or withdraw money (prevents overspending)
  - Body examples:

```json
{ "name": "Food" }
```

```json
{ "budget": 500 }
```

```json
{ "withdraw": 25 }
```

  - Returns: `200` with the updated envelope
  - Returns: `400` for invalid input or insufficient funds

- **DELETE** `/envelopes/:id`
  - Returns: `200` with the deleted envelope
  - Returns: `404` if not found

#### Transfers
- **POST** `/envelopes/transfer/:fromId/:toId`
  - Body:

```json
{ "amount": 50 }
```

  - Returns: `200` with `{ from, to, amount }`
  - Returns: `400` if insufficient funds or invalid input
  - Returns: `404` if one/both envelopes not found

### Postman

Use these URLs in Postman with base `http://localhost:3000`:
- Create envelope: `POST /envelopes`
- List envelopes: `GET /envelopes`
- Get one: `GET /envelopes/:id`
- Update/withdraw: `PATCH /envelopes/:id`
- Transfer: `POST /envelopes/transfer/:fromId/:toId`
- Delete: `DELETE /envelopes/:id`

