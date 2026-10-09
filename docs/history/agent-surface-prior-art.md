# How agent products express the conversation, the trace and the approval gate

Author: a research subagent, commissioned as a read-only survey. This document
resolves issue 199 (`NaniSoft/prism`). It is prior art and not a decision. Nothing
here recommends what Prism should do; the map's job is the decision.

Retrieval date for every external URL in this document: **2026-10-07**.
Written against the Prism working tree at `C:\Users\dpven\source\repos\nanisoft\prism`.

This research feeds three open decision tickets. The live surface definition is
issue 197, the run review surface is issue 207, and the three surfaces already
ruled not-live are issue 203. It asks one question across all three: how do
established agent products document the conversation, the trace and the approval
gate, and what did each decide about **who owns the stream, the tool call and the
human decision**.

**No vendor template was read.** No shadcnblocks page was fetched, and no
third-party mirror of a paid admin template was read. Only each product's own
documentation, guidelines and published API references were read. This is the
same non-derivation method `docs/history/provenance.md` records, and it is what
`docs/history/taxonomy-survey.md` did when it read agent platform documentation
for vocabulary. Nothing in this document is derived from a product's source, its
markup or its prop names, and no Prism Item is proposed from any of it.

## Sources

| Source | URL | Retrieved | Used for |
| --- | --- | --- | --- |
| Anthropic streaming Messages | <https://platform.claude.com/docs/en/build-with-claude/streaming> | 2026-10-07 | The event grammar (message start, content block start and delta and stop, message delta, message stop), the `ping` and in-stream `error` events, `input_json_delta` partial JSON for a tool call, `thinking_delta` and `signature_delta`, cumulative usage, and the explicit statement that a stream cannot be resumed and that tool use and thinking cannot be partially recovered |
| OpenAI streaming guide | <https://platform.openai.com/docs/guides/streaming-responses> | 2026-10-07 | Semantic typed events, the four events a text stream uses (`response.created`, `response.output_text.delta`, `response.completed`, `error`), and the note that streaming makes moderation harder and that moderation scores arrive only after the full output |
| OpenAI Responses API reference | <https://platform.openai.com/docs/api-reference/responses-streaming> | 2026-10-07 | The monotonic `sequence_number` on every event, `response.completed` carrying `usage`, the distinct output item types (`function_call`, `function_call_output`, `file_search_call`, `web_search_call`, `computer_call`, `mcp_call`), item `status` values `in_progress`, `completed` and `incomplete`, `pending_safety_checks` and `acknowledged_safety_checks` on a computer call, MCP `require_approval`, `previous_response_id`, and background responses with cancel |
| OpenAI Agents SDK human-in-the-loop | <https://openai.github.io/openai-agents-python/human_in_the_loop> | 2026-10-07 | Approval declared per tool through `needs_approval`, interruptions as the surfaced pending approvals, `RunState` as the resumable paused run, `state.approve` and `state.reject`, sticky decisions, the run-wide approval surface, long-running approval serialization, the authentication warning about untrusted snapshots, and versioning of pending tasks |
| Vercel AI SDK chatbot guide | <https://ai-sdk.dev/docs/ai-sdk-ui/chatbot> | 2026-10-07 | `useChat` message parts (text, tool invocation, tool result), the status values, `stop` and `regenerate`, message metadata for model and token usage, and the note that a plain text transport exposes no tool calls, usage or finish reason |
| Vercel AI SDK resumable streams | <https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams.md> | 2026-10-07 | Stream resumption requiring application owned persistence, Redis and two endpoints, the `resume` option, the `activeStreamId` pointer, the rule that a client abort is a disconnect and not a stop, the separate stop endpoint, and the cleanup rule that route cleanup is not a stop |
| Vercel AI SDK transport | <https://ai-sdk.dev/docs/ai-sdk-ui/transport> | 2026-10-07 | The `ChatTransport` interface, `DefaultChatTransport` over HTTP, `DirectChatTransport` with no reconnection, `WorkflowChatTransport` with automatic reconnection, and the statement that the transport system is what makes WebSockets and custom protocols interchangeable below the hook |
| Vercel AI SDK useChat reference | <https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat> | 2026-10-07 | `addToolOutput`, `addToolApprovalResponse`, `resumeStream`, the four status values, `onFinish` with `isAbort`, `isDisconnect`, `isError` and `finishReason`, and `messageMetadataSchema` |
| LangGraph interrupts | <https://docs.langchain.com/oss/python/langgraph/interrupts.md> | 2026-10-07 | `interrupt` and `Command(resume=...)`, the checkpointer and `thread_id` as the persistence pointer, waiting indefinitely, multiple parallel interrupts mapped by id, `response_schema` for typed input forms, the node restart rule, the index matching rule, and the idempotency rule for side effects before an interrupt |
| Cloudflare Agents API | <https://developers.cloudflare.com/agents/api-reference/agents-api> | 2026-10-07 | The Agent as a Durable Object, WebSocket connections, embedded SQLite, `useAgent` and `useAgentChat`, automatic resumable streaming on reconnect, and `waitForApproval` on Workflows |
| Cloudflare chat agent guide | <https://developers.cloudflare.com/agents/examples/chat-agent/> | 2026-10-07 | The three tool classes (server executed, client executed, approval gated), `needsApproval` per tool, the `approval-requested` and `output-available` message part states, `addToolApprovalResponse`, and the note that messages persist in SQLite and streams resume on disconnect |
| MCP Tools specification | <https://modelcontextprotocol.io/specification/2025-06-18/server/tools> | 2026-10-07 | `tools/call` and its result, `isError` on a tool result, the separation of protocol errors from tool execution errors, `outputSchema` and `structuredContent`, and the warning that there should always be a human able to deny a tool invocation |
| MCP Elicitation specification | <https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation> | 2026-10-07 | `elicitation/create` with a restricted JSON Schema, the three response actions accept, decline and cancel, the client owned interaction, the rule that the server must not request sensitive information, and the note that the protocol does not mandate a specific interface |
| Prism vocabulary | `CONTEXT.md` in this repo | 2026-10-07 | Component, Block, Page, Item, Kind, `live`, Workflows, agent surface, and the retired words this document avoids |
| Prism design record | `DESIGN.md` in this repo, the `live` Kind entry | 2026-10-07 | The inherited boundary: Prism owns the event log surface, the tool-call ledger, the status tiers and the run controls; the consumer owns the socket, the transport and the persistence; a run history, an approval queue and a cost ledger are Workflows and not `live` |
| Admin screen survey | `docs/admin-screen-survey.md` in this repo | 2026-10-07 | The Section H screens this research was asked to feed, including the conversation rows, the per-turn model, cost and latency rows, and the trace and evaluation rows |

**Not consulted, and why.** Google Gemini and Vertex AI function calling and
streaming were not fetched, so no Gemini claim appears anywhere below. Temporal
durable execution was not fetched, so its signal and timer model for a paused
approval is absent rather than approximated. Product UX documentation for coding
agents and general assistants (a published approval screen, a published trace
viewer) was not located as an API reference and is absent. Material Design was
not consulted; it is a component system and not an agent platform. Each absence
is repeated in the final section.

## The inherited law this research sits downstream of

This is decided and is **not** what this research is for. It is stated so a
reader does not mistake it for open, and so the findings below are read as
answering what remains.

`DESIGN.md` records the `live` Kind: a surface whose content changes over time
without a navigation event. Prism owns **the event log surface, the tool-call
ledger, the status tiers and the run controls**, and the consumer owns **the
socket, the transport and the persistence**, so Prism stays transport-agnostic
and no permanent client runtime reaches a consumer. `RunStream01` and
`ToolLedger01` are the two Items that ship under it, and `RunStream01` is a
client Component because a surface that receives events owns the subscription
that delivers them. The same record rules that a run history, an approval queue
and a cost ledger are read-mostly records that change as a run completes or as a
person decides, which makes them **Workflows** and not `live`.

Everything below is evidence about how other systems drew that same boundary.
It does not reopen it.

## 1. Who owns the stream

This is the sharpest question in the survey, because Prism's law promises a
surface that stays transport-agnostic and ships no permanent client runtime.
The evidence is that the **rendering** can be separated from the transport, and
that **resumption and ordering cannot**, because every product that resumes a
stream does so by owning persistence below the render layer.

### Standard for apps that consume a model API

**Anthropic** streams Messages over server-sent events. The event grammar is
positional: a `message_start`, then one or more content blocks each of which is
a `content_block_start`, some `content_block_delta` events and a
`content_block_stop`, then `message_delta` for top-level changes, then
`message_stop`. Each content block carries an `index` that "corresponds to its
index in the final Message `content` array", so order is the transport's own
index and never a client guess. The stream may also carry `ping` events and an
in-stream `error` event, for example an `overloaded_error`. There is no
reconnection primitive. An interrupted stream is recovered by capturing the
partial response and issuing a new request whose content is the partial text plus
a continue instruction, and the page states that "Tool use and extended thinking
blocks cannot be partially recovered. You can resume streaming from the most
recent text block." (`https://platform.claude.com/docs/en/build-with-claude/streaming`, retrieved 2026-10-07.)

**OpenAI's Responses API** streams semantic typed events, and every event carries
a monotonic `sequence_number` starting at 0 on `response.created`. The four
events a text stream uses are `response.created`, `response.output_text.delta`,
`response.completed` and `error`. `response.completed` carries the finished
Response object including its `usage`. A response is server-stored by default
(`store: true`), continues from `previous_response_id`, and can run in the
background and be cancelled only in that mode. The OpenAI documentation also
states the cost of streaming directly: "streaming the model's output in a
production application makes it more difficult to moderate the content of the
completions, as partial completions may be more difficult to evaluate", and
moderation scores "aren't included with partial output deltas".
(`https://platform.openai.com/docs/guides/streaming-responses`, retrieved
2026-10-07; `https://platform.openai.com/docs/api-reference/responses-streaming`,
retrieved 2026-10-07.)

### A hook that owns the surface and abstracts the transport

**The Vercel AI SDK** is the closest thing in the survey to a transport-agnostic
surface. `useChat` is built on a `ChatTransport` interface, and the transport
page says the system "gives you complete control over how your chat application
communicates, enabling integration with any backend protocol or service". Three
implementations ship: `DefaultChatTransport` over HTTP POST, `DirectChatTransport`
that calls an agent in process, and `WorkflowChatTransport` for workflows. That is
genuine evidence that the render layer can be separated from the transport: the
same `useChat` state machine sits over HTTP, an in-process agent, or a custom
WebSocket transport a consumer writes against the interface.
(`https://ai-sdk.dev/docs/ai-sdk-ui/transport`, retrieved 2026-10-07.)

But the separation stops at resumption, and the same documentation says so. The
resume-streams page states that "Stream resumption requires persistence for
messages and active streams in your application. The AI SDK provides tools to
connect to storage, but you need to set up the storage yourself", and then lists
what the consumer builds: storage to track which stream belongs to each chat,
Redis to store the stream, two endpoints (POST to create, GET to resume), and the
`resumable-stream` package. The hook holds an `activeStreamId` pointer and a
`resume` option that makes a GET request on mount, but the buffer is the app's.
The one transport with no server is explicit about the consequence:
"`DirectChatTransport` does not support stream reconnection since there is no
persistent server-side stream. The `reconnectToStream()` method always returns
`null`." A plain text transport is similarly lossy: with `TextStreamChatTransport`
"tool calls, usage information and finish reasons are not available."
(`https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams.md`, retrieved
2026-10-07; `https://ai-sdk.dev/docs/ai-sdk-ui/transport`, retrieved 2026-10-07;
`https://ai-sdk.dev/docs/ai-sdk-ui/chatbot`, retrieved 2026-10-07.)

### A platform that owns the buffer

**Cloudflare's Agents SDK** removes the app-owned buffer by making the Agent a
Durable Object with an embedded SQLite database. An `AIChatAgent` "provides
automatic resumable streaming out of the box. When a client disconnects and
reconnects during an active stream, the response automatically resumes from where
it left off", the chat guide says messages "persist in SQLite" and "streams
resume on disconnect", and the client `useAgent` hook reconnects with exponential
backoff. The transport is a WebSocket to a specific instance, and because the
instance is globally unique the same address routes a reconnecting client back to
the same place. The buffer lives in the platform, not in the renderer.
(`https://developers.cloudflare.com/agents/api-reference/agents-api`, retrieved
2026-10-07; `https://developers.cloudflare.com/agents/examples/chat-agent/`,
retrieved 2026-10-07.)

### A graph runtime that owns the state

**LangGraph** is not a UI, and its contribution here is the persistence model.
Event streaming exposes typed projections (`stream.messages` for token deltas,
`stream.values` for state snapshots, `stream.interrupts` for pauses), and the
checkpointer is what makes any of it resumable. The `thread_id` is "your
persistent cursor"; reusing it resumes the same state and a new value starts an
empty thread. (`https://docs.langchain.com/oss/python/langgraph/interrupts.md`,
retrieved 2026-10-07.)

### What the stream evidence establishes

Read across all of it, three things are consistent and one is a disagreement.

- **Every order key belongs to the transport, not the renderer.** OpenAI ships a
  monotonic `sequence_number`; Anthropic ships a content block `index`. No
  surveyed renderer sorts or resequences a stream on its own, and the one that
  does state an ordering rule (Prism's own `RunStream01`, sorting on `at` with a
  tie on `id`) is doing so because a reconnect can deliver an older event after a
  newer one. The prior art confirms the problem and puts the fix below the
  surface.
- **Every resumption story is owned below the render layer.** OpenAI keeps the
  response and resumes by id; Cloudflare keeps chunks in SQLite inside a Durable
  Object; the AI SDK's own guide tells the app to build Redis and two endpoints;
  Anthropic tells the app to capture the partial and re-issue a request. There is
  no surveyed case of a purely client-side render layer reconstructing an
  interrupted stream by itself.
- **A transport-agnostic render surface is achievable; a transport-agnostic
  resumption is not.** The AI SDK proves the first with a `ChatTransport`
  interface and three implementations. The same docs prove the second: the
  abstraction carries sending and receiving, and the consumer must still supply a
  durable buffer that the render surface cannot see.
- **The disagreement is where the buffer lives.** Cloudflare's answer is the
  platform's (Durable Object SQLite, automatic). The AI SDK's answer is the app's
  (Redis plus two endpoints, hand-built). OpenAI's answer is the provider's
  (stored responses, resume by id). Anthropic's answer is neither: there is no
  resume, only a captured partial and a new request. Four systems, four different
  owners of the same buffer, and no source reconciles them.
- **A version disagreement worth recording.** The AI SDK's own docs record a
  change of position. Its current page states that a client abort "only closes
  the current HTTP connection" and is a disconnect, with a separate stop endpoint
  for a real stop. An archived AI SDK 5 page at
  `https://ai-sdk.dev/v5/docs/ai-sdk-ui/chatbot-resume-streams` (located 2026-10-07)
  states the opposite, that resumption "is not compatible with abort
  functionality" because a refresh triggers an abort that breaks resumption. The
  current behaviour is the newer claim; the older claim shows the same system
  getting the abort and disconnect distinction wrong once and documenting the
  fix.

## 2. Who owns the tool call

The survey found three different shapes for the same object, and the shape a
system chooses determines what it can say about a failed or partial call.

### The tool call as a distinct item with its own identity and status

**OpenAI's Responses API** represents a tool call as its own output item rather
than as part of a message. `function_call` carries `name`, `arguments` as a JSON
string, a `call_id`, and optional `id`, `status`, `async` and a `caller`; the
result is a separate `function_call_output` item keyed by `call_id`. Server tools
each get their own item type: `file_search_call`, `web_search_call`,
`computer_call` and its output, and MCP calls. Item `status` is
`in_progress`, `completed` or `incomplete`, and a function call's arguments
stream as `response.function_call_arguments.delta` events before the final
object. (`https://platform.openai.com/docs/api-reference/responses-streaming`,
retrieved 2026-10-07.)

### The tool call as a content block or a message

**Anthropic** represents a tool call as a `tool_use` content block inside the
assistant message, with an `id`, a `name` and an `input`. The input is streamed as
partial JSON: "the deltas are partial JSON strings, whereas the final
`tool_use.input` is always an object", and the page warns that "there may be
delays between streaming events while the model is working" because current
models emit one complete key and value at a time. The result is a
`tool_result` block in a following user message.
(`https://platform.claude.com/docs/en/build-with-claude/streaming`, retrieved
2026-10-07.) **LangGraph** takes the same message-shaped view: a tool call rides
on the assistant message and the outcome is a `ToolMessage` carrying the
`tool_call_id`. (`https://docs.langchain.com/oss/python/langgraph/interrupts.md`,
retrieved 2026-10-07.)

### The tool call, the text and the result as parts of one message

**The AI SDK** unifies them. A `UIMessage` has a `parts` array, and the guide
says to render the parts "instead of the `content` property" because the parts
"support different message types, including text, tool invocation, and tool
result". The Cloudflare chat guide shows the same parts carrying states:
`approval-requested`, when a tool waits for a person, and `output-available`, when
its result has arrived. A tool call and a message are therefore the same object,
which is the opposite of the OpenAI choice and a different reading of the same
facts. (`https://ai-sdk.dev/docs/ai-sdk-ui/chatbot`, retrieved 2026-10-07;
`https://developers.cloudflare.com/agents/examples/chat-agent/`, retrieved
2026-10-07.)

### A protocol that names its own failures

**MCP** sends `tools/call` with a `name` and `arguments`, and the result is a
`content` array plus an optional `structuredContent` and an `outputSchema`. It is
the one source in the survey that separates two failure channels by name:
"Protocol Errors" for an unknown tool or invalid arguments, carried as JSON-RPC
errors, and "Tool Execution Errors" for an API failure or a business rule, carried
in the result with `isError: true`. A client can therefore tell a call that never
ran from a call that ran and failed, which none of the model APIs distinguish as
cleanly. (`https://modelcontextprotocol.io/specification/2025-06-18/server/tools`,
retrieved 2026-10-07.)

### What the tool-call evidence establishes

- **The representation is not agreed, and the disagreement has a consequence.**
  OpenAI's distinct item and Anthropic's content block both make a tool call a
  sibling of a message with its own id; the AI SDK makes it a part of a message.
  A surface that renders from a tool-call ledger (Prism's own word) can read
  either, but a surface that keys rows on a message id cannot render two calls in
  one message without a second key, and the AI SDK's part model is the one that
  would force the second key.
- **A failed call is represented three ways.** MCP separates protocol from
  execution with `isError`; OpenAI carries an item `status` including
  `incomplete`; the AI SDK carries an `output-error` state on `addToolOutput`.
  Only MCP gives the two channels distinct identities.
- **A partial call is a first-class problem only where streaming was designed for
  it.** Anthropic streams partial JSON but then states that a `tool_use` block
  cannot be partially recovered after an interruption, so the partial arguments
  are for display and not for recovery. OpenAI's `sequence_number` and item
  statuses are the closest to a resumable partial.

## 3. Who owns the human decision

Three models appear, and no source reconciles them: approval as a **queue** of
pending interruptions, approval as a **prompt** with a schema, and approval as a
**suspended state** that can be serialized and resumed.

### Approval as a queue and a suspended state

**The OpenAI Agents SDK** declares approval on the tool with `needs_approval`,
which is either `True` or an async function deciding per call, and it is
available on function tools, agent-as-tool, shell and patch tools, and MCP
servers. When a rule requires approval and no decision is stored, the run pauses
and `RunResult.interruptions` (or `RunResultStreaming.interruptions`) holds
`ToolApprovalItem` entries with `agent.name`, `tool_name` and `arguments`.
Resolving is `result.to_state()`, then `state.approve(...)` or `state.reject(...)`,
then `Runner.run(agent, state)`. The approval surface is **run-wide**: an approval
raised after a handoff or inside a nested agent still surfaces on the outer run.
Decisions can be sticky (`always_approve=True`), so one decision covers future
calls to the same tool identity for the rest of the run. A callable rule "fails
closed" when the SDK cannot safely parse the arguments, which means malformed or
missing arguments require a human rather than auto-approving.
(`https://openai.github.io/openai-agents-python/human_in_the_loop`, retrieved
2026-10-07.)

What happens when approval never arrives is answered by the same page's
long-running section: the state is durable and serialized with `state.to_json()`
or `state.to_string()`, recreated with `RunState.from_json`, and "waits
indefinitely" is the model. There is no timeout or expiry. The page then spends
most of its length on the danger of that serialized state, which is covered in
the next section.

**LangGraph** generalises the same idea beyond tools: `interrupt(value)` can be
called anywhere in a node, and the graph "waits indefinitely until you resume
execution". Resumption is `Command(resume=...)`, and the value passed becomes the
return of the `interrupt` call. Two facts make it work: a checkpointer and a
`thread_id`. Parallel branches that interrupt at once produce multiple pending
interrupts, and they are resumed by mapping each interrupt id to its own resume
value in a single invocation. An optional `response_schema` lets a client "render
typed input forms" and validates the resume value, and LangGraph's own Studio
renders that schema "as typed input fields instead of a JSON editor".
(`https://docs.langchain.com/oss/python/langgraph/interrupts.md`, retrieved
2026-10-07.)

### Approval as a prompt with three answers

**MCP elicitation** is the protocol answer to asking a person for input, nested
inside another server feature. A server sends `elicitation/create` with a
`message` and a `requestedSchema`, and the response has exactly three actions:
`accept` with content, `decline` as an explicit no, and `cancel` for a dismissal
that is neither. That three-way split is unique in the survey and is the only
specification that gives a reader a way to say "I closed the dialog" distinct
from "I refused". The schema is restricted to a flat object of primitive
properties so a client can generate a form, and the spec says both that servers
"MUST NOT use elicitation to request sensitive information" and that the protocol
"does not mandate any specific user interaction model".
(`https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation`,
retrieved 2026-10-07.)

The MCP Tools specification itself recommends approval without specifying a
message for it: "There **SHOULD** always be a human in the loop with the ability
to deny tool invocations", with the guidance to "Insert clear visual indicators
when tools are invoked" and "Present confirmation prompts to the user". The
protocol carries no approval request of its own, so each host invents one.
(`https://modelcontextprotocol.io/specification/2025-06-18/server/tools`,
retrieved 2026-10-07.)

### Approval as a response on the message part, and as a server wait

**The AI SDK** exposes `addToolApprovalResponse({ id, approved, reason })` on
`useChat`, and the approval is a message part with an `approval-requested` state
that the consumer renders. **Cloudflare** combines both: a tool declares
`needsApproval`, a part arrives with `approval-requested`, and the consumer calls
`addToolApprovalResponse`; the Agents API separately exposes `waitForApproval` for
Workflows. OpenAI's hosted MCP tools take `require_approval` of `always`, `never`
or a filter object, and a computer call carries `pending_safety_checks` that the
developer acknowledges back.
(`https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat`, retrieved 2026-10-07;
`https://developers.cloudflare.com/agents/examples/chat-agent/`, retrieved
2026-10-07; `https://platform.openai.com/docs/api-reference/responses-streaming`,
retrieved 2026-10-07.)

### What the human-decision evidence establishes

- **The queue, the prompt and the state are all present and unreconciled.** The
  Agents SDK surfaces a list of interruptions and resolves them in a batch; MCP
  and LangGraph's Studio surface a single typed prompt; RunState and LangGraph's
  checkpoint are the state that survives. A surface asked to model "an approval
  queue" is choosing among three prior readings, not copying one.
- **A batch of approvals is a first-class case in two systems.** LangGraph maps
  each interrupt id to a resume value so parallel approvals resume together, and
  the Agents SDK resolves a mixed list of function, MCP and nested-agent
  approvals and can pause again on the unresolved remainder. A single prompt
  model does not express that.
- **What happens when approval never arrives is unanimous and unhelpful.** Every
  source says the run waits indefinitely; none defines an expiry, a timeout or a
  default. The state is durable and its lifetime is the application's. This is a
  finding about absence, and it is the clearest one in the section.

## 4. Per-turn metadata

The survey asked specifically whether products show model, cost and latency per
turn by default, and what each had to own to show them.

- **Anthropic** puts token usage in two places. `message_start` carries a
  `usage` object with `input_tokens` and cache fields, and `message_delta` carries
  `output_tokens`, with the explicit warning that "the token counts shown in the
  `usage` field of the `message_delta` event are *cumulative*". The serving
  `model` is on the message. There is no cost field and no latency field.
  (`https://platform.claude.com/docs/en/build-with-claude/streaming`, retrieved
  2026-10-07.)
- **OpenAI** puts usage on `response.completed`: `input_tokens`, `output_tokens`,
  `total_tokens`, `output_tokens_details.reasoning_tokens` and
  `input_tokens_details.cached_tokens`. The completed Response also carries the
  `model`. There is no cost field and no latency field, and because usage arrives
  with completion, a partial turn has no usage at all.
  (`https://platform.openai.com/docs/api-reference/responses-streaming`, retrieved
  2026-10-07.)
- **The AI SDK** does not supply the figures; it supplies a place to put them.
  The chatbot guide's `messageMetadata` callback "can attach custom metadata to
  messages for tracking information like timestamps, model details, and token
  usage", and its example returns the model at `start` and `totalUsage` at
  `finish`. `onFinish` also reports `finishReason`. Whatever a consumer shows is
  its own to compute. (`https://ai-sdk.dev/docs/ai-sdk-ui/chatbot`, retrieved
  2026-10-07; `https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat`, retrieved
  2026-10-07.)
- **LangGraph** and **MCP** publish no per-turn model, cost or latency figures in
  the pages read. (LangGraph, retrieved 2026-10-07; MCP Tools, retrieved
  2026-10-07.)

**The finding is a consistent absence.** Model and token counts are available per
turn in the model APIs, and only after the turn completes in two of them. **No
surveyed API publishes a per-turn cost or a per-turn latency.** A cost figure
requires a pricing table that no model API streams, and a latency figure requires
a clock the API does not own. A surface that shows either is showing a consumer
derivation, not a provider fact.

## 5. What each product got wrong or left to the consumer

This is the section worth the most effort. Each item is a specific claim with its
source, and the pattern across them is the useful part.

### Anthropic

- **It does not offer a resumable stream at all.** Recovery is a manual
  capture-and-continue, and for newer models the captured partial goes into a
  **user** message with an instruction to continue rather than into an assistant
  message. A reader who closes a tab mid-answer has lost the connection and must
  be handed a reconstructed request.
  (`https://platform.claude.com/docs/en/build-with-claude/streaming`, retrieved
  2026-10-07.)
- **Two of the three content block kinds cannot be partially recovered.** The
  page states that "Tool use and extended thinking blocks cannot be partially
  recovered. You can resume streaming from the most recent text block." Tool use
  and reasoning are exactly the parts a trace surface is for, so the trace and
  the recovery story are in tension in the one system that streams them.
- **Streaming a tool call stalls by design.** "Current models only support
  emitting one complete key and value property from `input` at a time. As such,
  when using tools, there may be delays between streaming events while the model
  is working." A progress indicator driven only by byte arrival will look stalled
  at the moment a long tool call is being composed.
- **Errors arrive inside the stream.** An `overloaded_error` is delivered as an
  `error` event in the event flow, so a consumer that treats the HTTP 200 as
  success has to parse the stream to find the failure. The versioning note adds
  that new event types may appear and "your code should handle unknown event
  types gracefully."

### OpenAI

- **It states that streaming weakens moderation, in its own guide.** "Streaming
  the model's output in a production application makes it more difficult to
  moderate the content of the completions, as partial completions may be more
  difficult to evaluate", and moderation scores "aren't included with partial
  output deltas". The thing that makes the surface feel fast is the thing that
  makes a safety review harder, and the guide says so rather than resolving it.
  (`https://platform.openai.com/docs/guides/streaming-responses`, retrieved
  2026-10-07.)
- **Partial usage is absent by construction.** Usage is on `response.completed`,
  so a turn that is still running has no token count, and a turn that failed
  mid-stream may have none either. A cost surface cannot show a live figure.
  (`https://platform.openai.com/docs/api-reference/responses-streaming`, retrieved
  2026-10-07.)
- **Long runs need a mode switch.** Cancelling a response is only possible when
  `background` was set to `true`, so a consumer that wants a stop control has to
  choose the background lane before the run starts. The stop affordance and the
  response mode are coupled.
- **The item model is large and uneven.** Six or more distinct tool item types
  each carry their own status vocabulary (`in_progress`, `searching`,
  `completed`, `incomplete`, `failed`), so a single ledger rendering every tool
  as one shape is reading a union it did not design. The OpenAI Agents SDK's own
  approval flow then has to special-case computer safety checks because they
  "do not use the pause-and-resume approval flow" but a callback instead.
- **Responses are stored by default.** `store: true` appears in the default
  response object. A consumer that did not intend to retain turns has to notice
  the default, and a retention surface built on top has to reconcile with it.
  (`https://platform.openai.com/docs/api-reference/responses-streaming`, retrieved
  2026-10-07.)

### OpenAI Agents SDK

- **The serialized paused run is unauthenticated, and the page says so at
  length.** "`RunState.from_json()` and `RunState.from_string()` do not
  authenticate the snapshot or the person submitting it." The guidance is to
  keep the whole snapshot server-side, send the reviewer only opaque
  identifiers, authenticate the reviewer separately, authorize them against the
  stored run, validate decisions against the server-owned pending list, and use
  an atomic owner-checked transition so a replay cannot resume twice. This is the
  most complete treatment of approval security in the survey, and it is a warning
  about a default a consumer could easily ship wrong.
  (`https://openai.github.io/openai-agents-python/human_in_the_loop`, retrieved
  2026-10-07.)
- **Its own example is not deployable, by its own admission.** The server-side
  approval example "demonstrates this pattern with a CLI client simulation and a
  store confined to one event loop in one process... this example is not a
  deployable HTTP service", and the page lists what a production application must
  add: authentication, request protections, storage retention, and recovery that
  "reconciles tool side effects before retrying".
- **The approval surface is the consumer's to build.** The SDK surfaces
  interruptions and the resolver methods; it ships no approval Component, no
  queue view and no default prompt. Every consumer renders the list of pending
  tool names and arguments itself, and the page warns to "treat tool names and
  arguments as untrusted display content and escape them when rendering HTML".
- **It anticipates that approvals go stale.** The final section tells a consumer
  to "store a version marker for your agent definitions or SDK alongside the
  serialized state" so a resumed run can route to matching code when models,
  prompts or tool definitions have changed. A pending approval is treated as a
  long-lived artifact with a schema, not as a short prompt.

### Vercel AI SDK

- **It requires the consumer to build the persistence it depends on.** The
  resume-streams page is explicit: "The AI SDK provides tools to connect to
  storage, but you need to set up the storage yourself", then names Redis, the
  `resumable-stream` package, a persistence layer for `activeStreamId`, and two
  endpoints. A feature advertised as resumption is a feature the consumer
  assembles from parts the SDK names but does not own.
  (`https://ai-sdk.dev/docs/ai-sdk-ui/chatbot-resume-streams.md`, retrieved
  2026-10-07.)
- **`stop()` does not stop the work, and the docs say so twice.** "In a
  resumable stream setup, that abort is a disconnect signal, not a request to
  stop generation", and a page on abort breaking resumable streams exists to
  explain the trap. The correct stop is a second endpoint that persists the
  partial, cancels the producer and clears the stream id, and the guidance warns
  not to call it from cleanup code because "route cleanup is a disconnect, not an
  explicit stop."
- **The weakest transport silently loses the most.** `DirectChatTransport`
  "does not support stream reconnection", and `TextStreamChatTransport` drops
  "tool calls, usage information and finish reasons". The transport abstraction
  is real, and its lower rungs are lossy in exactly the places a trace and a cost
  surface care about.
  (`https://ai-sdk.dev/docs/ai-sdk-ui/transport`, retrieved 2026-10-07;
  `https://ai-sdk.dev/docs/ai-sdk-ui/chatbot`, retrieved 2026-10-07.)
- **Its status vocabulary is about the request, not the run.** The four statuses
  are `submitted`, `streaming`, `ready` and `error`, which describe the hook's
  connection. A paused-for-approval turn is not a status; it is a part state, so
  a reader looking for "where is this run" has to read the parts.
  (`https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat`, retrieved 2026-10-07.)
- **It documents having changed its mind on abort.** The current page and the
  archived 5.x page disagree about whether a refresh breaks resumption, which is
  recorded in section 1.

### Cloudflare Agents

- **Resumption is inseparable from Durable Objects and SQLite.** The feature is
  described as automatic because the Agent is a Durable Object whose chunks land
  in embedded SQLite. That is a strong answer inside Cloudflare and no answer at
  all outside it; the same page separates this "client reconnect recovery" from
  "Durable Object eviction recovery", so there are two recovery stories and only
  one is on by default for a plain Agent.
- **A client cleanup does not stop the server turn.** As the platform's own
  release note puts it, "generic client stream abort/cleanup is local-only by
  default, so browser navigation or React cleanup does not stop the server turn.
  An explicit `stop()` still cancels the server turn." This is the correct
  distinction and a surprising default: a component unmount is not a stop, and a
  reader who navigates away leaves work running.
  (`https://developers.cloudflare.com/agents/api-reference/agents-api`, retrieved
  2026-10-07; `https://developers.cloudflare.com/agents/examples/chat-agent/`,
  retrieved 2026-10-07.)
- **The approval UI is a part state the consumer draws.** The guide renders
  `approval-requested` with an approve and a reject button, and the tool's
  `needsApproval` function decides when approval is required. The platform
  supplies the state and the response method, and the interface is the
  consumer's, exactly as in the other systems.
- **The client is a permanent runtime.** `useAgent` and `useAgentChat` are React
  hooks that hold the connection, the messages, the streaming state and the
  recovery. There is no version of the Cloudflare answer that is a pure render
  surface; the hook is the product.

### LangGraph

- **Resuming re-runs the node from the top, so side effects before an interrupt
  must be idempotent.** "When execution resumes... the runtime restarts the
  entire node from the beginning; it does not resume from the exact line where
  `interrupt` was called. This means any code that ran before the `interrupt` will
  execute again." The rules then forbid non-idempotent writes before an
  interrupt and duplicated record creation. This is a genuinely sharp edge: the
  pause and the code that precedes it share a lifetime.
- **A validation loop inside one node is an explosion, and the docs say so.** "A
  loop that calls `interrupt()` multiple times causes each resume to replay all
  previous iterations: the first resume replays 1 iteration, the second replays
  2, and so on." The recommended fix is a conditional edge, which is a different
  graph shape.
- **Interrupts are matched by index, so their order is load-bearing.** Within a
  node, resume values are paired to interrupts by position; the rules forbid
  conditionally skipping an interrupt or looping in a way that changes how many
  fire, because "the order of interrupt calls within the node is important." A
  reader who reorders a node's interrupts breaks every paused run beneath it.
- **A paused run is only as durable as its checkpointer.** The docs say to use
  "a durable checkpointer in production", which means the approval queue and the
  conversation it belongs to share the consumer's database. The approval store
  and the message store are the same store.
  (`https://docs.langchain.com/oss/python/langgraph/interrupts.md`, retrieved
  2026-10-07.)

### MCP

- **The tools spec asks for human approval and provides no mechanism for it.**
  The warning says a human "SHOULD always" be in the loop to deny invocations,
  and the guidance is to "present confirmation prompts", but the protocol has no
  approval message, no pending-approval object and no deny channel for a tool
  call. Each host invents the surface, which is why the survey finds approval
  modelled three ways in the systems that implement MCP.
  (`https://modelcontextprotocol.io/specification/2025-06-18/server/tools`,
  retrieved 2026-10-07.)
- **Elicitation schemas cannot express a nested approval.** The requested schema
  is "limited to flat objects with primitive properties only" and "complex nested
  structures, arrays of objects, and other advanced JSON Schema features are
  intentionally not supported to simplify client implementation." A review form
  that needs a per-row decision list cannot be expressed in one elicitation.
- **Elicitation and tools are separate flows with separate rules.** The tool
  call is model-controlled, and elicitation is server-initiated nested input;
  neither page says how a tool's execution approval and an elicitation for its
  arguments compose into one interaction. A client implementing both has to
  decide the ordering itself.
- **Tool annotations are untrusted.** The spec states clients "MUST consider tool
  annotations to be untrusted unless they come from trusted servers", so a
  read-only hint from an arbitrary server cannot be the basis for skipping
  approval. That is a real constraint and it is left to the client to enforce.
  (`https://modelcontextprotocol.io/specification/2025-06-18/server/tools`,
  retrieved 2026-10-07.)

### The pattern across all of them

- **Every system that resumes a stream owns the buffer somewhere, and no two
  owners agree.** Provider storage (OpenAI), platform storage (Cloudflare), app
  storage (the AI SDK), or no resumption at all (Anthropic). The render layer is
  never the owner in any of them.
- **Every system that models approval ships the state and none ships the
  surface.** Interruptions, RunState, part states and elicitation are all data;
  the queue, the prompt and the review screen are the consumer's in every case.
- **No system publishes per-turn cost or latency.** Tokens and model are the
  only per-turn provider facts, and in two systems even those arrive only at the
  end.
- **The tool call is not one shape.** Distinct item, content block, or message
  part, with MCP alone separating a protocol error from an execution error by
  name.
- **The pause is the least standardised part of the whole survey.** A paused run
  waits forever in every source, its state is durable in all but one, and the
  mechanisms for resuming it (a resume value, an approval decision, a stop
  endpoint, a new continuation request) share no vocabulary.

## 6. Open questions this research did not settle

No recommendations. These are the questions this survey did not answer, and each
one names what would answer it.

1. **Whether a render surface can reconstruct stream order without a buffer.**
   OpenAI's `sequence_number` and Anthropic's block `index` are transport keys,
   and no surveyed surface posed as pure rendering has to rebuild order after a
   reconnect. Whether "transport-agnostic and runtime-free" extends to
   resumption, or only to the live rendering of an intact connection, is not
   settled by any source read.
2. **What a paused approval does when it is never answered.** Every source says
   the run waits indefinitely and none defines a timeout, an expiry or a default
   decision. The state is durable and its retention is the application's. No
   source even names the question.
3. **Whether approval is a queue, a prompt or a state.** OpenAI's interruptions
   and LangGraph's multi-interrupt resume are queues; MCP elicitation and
   LangGraph's `response_schema` are typed prompts; `RunState` and a LangGraph
   checkpoint are states. The three are not reconciled, and a design that picks
   one is choosing among precedents rather than following one.
4. **How a per-turn cost and a per-turn latency could be owned at all.** No
   surveyed API publishes either. Cost needs a pricing table and latency needs a
   clock that the provider response does not carry, so both are derivations. What
   a provider could publish, and what a surface would need to accept from a
   consumer, is unexamined.
5. **How a tool call should be represented when one turn holds several.** The AI
   SDK's message-parts model puts many tool calls in one message, which forces a
   second key for a ledger row; OpenAI's item model gives each its own id. The
   trade between the two for a trace that orders by call is not settled by any
   source read.
6. **How a trace relates to a conversation.** The survey read a streaming
   surface and a tool ledger separately in every system; none documents a single
   view that is both, and none documents how a reader moves from a message to the
   calls it produced. The relation between the two is a design question this
   research does not answer.
7. **Whether branching and regeneration survive a resumable stream.** The AI SDK
   has `regenerate` and a replacement `messageId`, and resumption has an
   `activeStreamId`, but no source read describes how a branch and a persisted
   stream interact. Branching appears in the admin survey's conversation rows and
   in no source here.
8. **Google Gemini and Vertex AI are absent.** Their function calling and
   streaming references were not fetched, so no claim about them appears above,
   and their tool-call representation could contradict the three shapes in
   section 2.
9. **Temporal and durable workflow engines are absent.** Their signal and timer
   model is the other well-known answer to a paused approval, and it was not read
   here. A durable timer would be a direct answer to question 2, and this survey
   does not have it.
10. **A published approval or trace screen is absent.** Every source read is an
    API reference or a platform guide; none is a product surface specification.
    What a shipped approval queue or trace viewer looks like, as opposed to what
    its API carries, is not in this document.

---

**What a reader should do with this.** Treat it as prior art with an uneven
evidence base. Six systems and one protocol specification are documented from
primary sources fetched on 2026-10-07, and the sharpest findings are absences and
disagreements rather than convergences: the buffer under a resumable stream has
four different owners, the approval gate has three unreconciled shapes, a cost or
latency figure is published by nobody, and the one thing every source agrees on
is that a paused run waits forever. Where this document says a system does
something, the URL in the Sources table was fetched and read. Where it says a
system does not, that is the reading of what was fetched, and a system that has
not published the thing is not the same as a system that has decided against it.
