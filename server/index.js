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
 * Update an envelope and/or withdraw money from it.
 * PATCH /envelopes/:id
 * Body supports:
 * - { "name": string } to rename
 * - { "budget": number } to set the current budget (must be >= 0)
 * - { "withdraw": number } to subtract from current budget (must be > 0 and <= current budget)
 */
app.patch("/envelopes/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const envelope = envelopes.find((e) => e.id === id);
  if (!envelope) {
    return res.status(404).json({ error: "envelope not found" });
  }

  const { name, budget, withdraw } = req.body ?? {};

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "name must be a non-empty string" });
    }
  }

  if (budget !== undefined) {
    const newBudget = Number(budget);
    if (!Number.isFinite(newBudget) || newBudget < 0) {
      return res.status(400).json({ error: "budget must be a non-negative number" });
    }
  }

  if (withdraw !== undefined) {
    const amount = Number(withdraw);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "withdraw must be a positive number" });
    }
  }

  // Apply updates
  if (name !== undefined) envelope.name = name.trim();
  if (budget !== undefined) envelope.budget = Number(budget);

  if (withdraw !== undefined) {
    const amount = Number(withdraw);
    if (amount > envelope.budget) {
      return res.status(400).json({ error: "insufficient funds in envelope" });
    }
    envelope.budget -= amount;
  }

  res.status(200).json(envelope);
});

/**
 * Transfer budget between envelopes.
 * POST /envelopes/transfer/:fromId/:toId
 * Body: { "amount": number }
 */
app.post("/envelopes/transfer/:fromId/:toId", (req, res) => {
  const fromId = Number(req.params.fromId);
  const toId = Number(req.params.toId);

  if (!Number.isInteger(fromId) || fromId < 1 || !Number.isInteger(toId) || toId < 1) {
    return res.status(400).json({ error: "fromId and toId must be positive integers" });
  }

  if (fromId === toId) {
    return res.status(400).json({ error: "fromId and toId must be different" });
  }

  const { amount } = req.body ?? {};
  const transferAmount = Number(amount);
  if (!Number.isFinite(transferAmount) || transferAmount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  const fromEnvelope = envelopes.find((e) => e.id === fromId);
  const toEnvelope = envelopes.find((e) => e.id === toId);

  if (!fromEnvelope || !toEnvelope) {
    return res.status(404).json({ error: "one or both envelopes not found" });
  }

  if (transferAmount > fromEnvelope.budget) {
    return res.status(400).json({ error: "insufficient funds in source envelope" });
  }

  fromEnvelope.budget -= transferAmount;
  toEnvelope.budget += transferAmount;

  res.status(200).json({ from: fromEnvelope, to: toEnvelope, amount: transferAmount });
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
