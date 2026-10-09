---
'@nanisoft/prism-ui': minor
---

A message carries the caller's per-message metadata

`ChatMessage` gains an optional `meta: ReactNode`, drawn in the message's header
beside the sender and the time. It carries the caller's own per-message metadata:
the model a provider stated for a turn, a token count it reported, and the cost or
the latency the caller derived. It is a node and not a set of Prism fields because
no provider read publishes a cost or a latency, so the surface states no model, no
count, no cost and no latency for itself and draws only what the caller hands it.
The parts stay the way content is carried. The roster does not change: no new Item,
Kind, Page or catalogue entry appears.
