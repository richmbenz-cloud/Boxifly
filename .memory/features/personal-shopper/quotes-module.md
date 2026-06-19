# Memory: features/personal-shopper/quotes-module
Updated: now

The Personal Shopper formal quotes module implements a complete lifecycle for quote management:

## Database Schema
- `ps_quotes.estado`: Enum with states `pendiente`, `aceptada`, `rechazada`, `expirada`, `modificada`
- `ps_quotes.respondida_at`: Timestamp when client responded
- `ps_quotes.razon_rechazo`: Reason for rejection if applicable

## Database Functions
- `approve_ps_quote(quote_id, cliente_id, ip, user_agent)`: Atomic function that accepts a quote, creates/updates order, registers approval in `ps_client_approvals`, and logs decision
- `reject_ps_quote(quote_id, cliente_id, razon, ip, user_agent)`: Marks quote as rejected with reason and logs decision
- `expire_ps_quotes()`: Utility function to mark expired quotes (for scheduled jobs)

## State Blocking System
- `can_advance_ps_order_status(order_id, new_status)`: Security Definer function that validates if an order can advance
- `trg_block_ps_order_advance`: Trigger on ps_orders that prevents state changes when `requires_client_approval=true` without valid approval in `ps_client_approvals`

## UI Components
- `usePSQuotes`: Hook for quote management with approve/reject mutations, expiration checks, and status info
- `useCreatePSQuote`: Hook for creating, updating, and selecting quotes from PS Dashboard
- `PSQuoteCard`: Interactive card component with expiration warnings, confirmation dialogs, and legal disclaimers (client view)
- `PSCreateQuoteForm`: Form for PS to create/edit quotes with price breakdown, expiration selection, and budget validation
- `PSQuotesManager`: Full quotes management panel for PS with history, edit, and select active functionality
- `PSServiceTypeBadge`: Visual differentiation between 'asistido' and 'live' service types

## Quote Creation Workflow (PS Dashboard)
1. PS creates quote via `PSCreateQuoteForm` with: product name, description, URL, pricing breakdown, expiration days, notes
2. On creation: quote saved with `estado='pendiente'`, other quotes marked `es_seleccionada=false`
3. Request status automatically updated to `cotizada`
4. Automatic system message sent to client via `ps_messages` with quote details
5. PS can modify existing quotes (creates new version, old marked as `modificada`)
6. PS can mark any pending quote as active (`es_seleccionada=true`)

## Critical Rules
1. No critical order state can advance if `requires_client_approval=true`
2. State only unblocks via valid record in `ps_client_approvals`
3. All approvals are recorded with timestamp, IP, and user agent for traceability
4. Expired quotes cannot be approved (UI blocks action)
5. When quote is created, request status changes to 'cotizada' and system message is sent
