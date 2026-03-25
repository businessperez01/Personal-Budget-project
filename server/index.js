const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

/** Overall budget limit for the user (same currency units as envelope amounts). */
let totalBudget = 0;

/** In-memory list of budget envelopes. */
const envelopes = [];

let nextEnvelopeId = 1;

app.get("/", (req, res) => {
  res.send("Hello, World");
});

/**
 * List all budget envelopes.
 * GET /envelopes
 */
app.get("/envelopes", (req, res) => {
  res.status(200).json(envelopes);
});

/**
 * Get one envelope by id (id, name, budget).
 * GET /envelopes/:id
 */
app.get("/envelopes/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const envelope = envelopes.find((e) => e.id === id);
  if (!envelope) {
    return res.status(404).json({ error: "envelope not found" });
  }

  res.status(200).json(envelope);
});

/**
 * Create a new budget envelope.
 * POST /envelopes
 * Body: { "name": string, "budget": number } — budget is the allocated amount for this envelope.
 */
app.post("/envelopes", (req, res) => {
  const { name, budget } = req.body;

  if (typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ error: "name is required and must be a non-empty string" });
  }

  const amount = Number(budget);
  if (!Number.isFinite(amount) || amount < 0) {
    return res
      .status(400)
      .json({ error: "budget is required and must be a non-negative number" });
  }

  const envelope = {
    id: nextEnvelopeId++,
    name: name.trim(),
    budget: amount,
  };

  envelopes.push(envelope);
  res.status(201).json(envelope);
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
