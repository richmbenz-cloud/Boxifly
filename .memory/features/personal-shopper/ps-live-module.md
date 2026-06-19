# Memory: features/personal-shopper/ps-live-module
Updated: now

## PS Live - Definition

PS Live is a **premium real-time shopping service** where a Personal Shopper streams from physical stores in the USA while the client watches and authorizes purchases in real-time, within predefined limits.

## Fundamental Rule (Non-negotiable)

❌ **No PS Live session can start without a pre-approved PS Live Order (Orden PS Live Base)**

This order:
- Does NOT define specific products
- DOES define rules, limits, and responsibilities

## PS Live Order (Orden PS Live Base) - Required Structure

| Field | Description |
|-------|-------------|
| `presupuesto_maximo` | Hard budget limit (cannot be exceeded) |
| `presupuesto_gastado` | Accumulated spending during session |
| `moneda` | Currency (default: USD) |
| `categorias_permitidas` | Allowed product categories |
| `tiendas_objetivo` | Target stores (optional) |
| `duracion_max_sesion` | Max session duration in minutes |
| `limite_items` | Max items per session |
| `regla_silencio_segundos` | Timeout in seconds for client response |
| `regla_silencio_accion` | Action on timeout: `rechazar_auto`, `aprobar_auto`, `pasar_siguiente` |
| `tipo_aprobacion` | `automatica` (under budget) or `manual_por_item` |
| `metodo_pago` | `wallet` or `preautorizacion` |
| `budget_exhausted` | Flag when budget is fully used |
| `budget_exhausted_at` | Timestamp when budget was exhausted |

## PS Live Order States (ps_live_order_status)

1. `borrador` - Draft, being configured
2. `pendiente_aprobacion` - Awaiting client approval
3. `aprobada` - Ready for session
4. `en_sesion` - Active live session
5. `completada` - Session finished successfully
6. `cancelada` - Cancelled by client or system
7. `expirada` - Expired without session

## PS Live Session States (ps_live_status)

1. `programada` - Scheduled for future
2. `esperando_ps` - Waiting for shopper to start
3. `en_vivo` - Live and active
4. `pausada` - Temporarily paused
5. `finalizada` - Completed
6. `cancelada` - Cancelled
7. `expirada` - Expired

## Session Lock Mechanism

Sessions include concurrency protection:
- `locked_at` - Timestamp when session was locked
- `locked_by` - User ID who holds the lock
- `lock_reason` - Reason: `session_active`, `session_paused`, `budget_exhausted`

This prevents:
- Double starts by concurrent requests
- Race conditions in state transitions
- Unauthorized session manipulation

## Proposal Flow During Live Session

1. Shopper proposes a product with: name, price, store, category
2. System validates price against available budget (RPC with lock)
3. If budget exceeded → proposal blocked by RPC
4. Client can: approve, reject, or not respond
5. On timeout → `regla_silencio_accion` is applied by backend RPC

## Proposal Response States (ps_live_proposal_response)

- `pendiente` - Awaiting client response
- `aprobada` - Client approved
- `rechazada` - Client rejected
- `timeout_auto_aprobada` - Auto-approved due to silence rule
- `timeout_auto_rechazada` - Auto-rejected due to silence rule

## Financial Rules (Critical)

1. PS cannot exceed budget (enforced by RPC with FOR UPDATE lock)
2. Each approval deducts from available budget atomically
3. Real-time budget calculation prevents overspending
4. All transactions are recorded for audit
5. Budget exhausted triggers automatic session pause

## Automatic Budget Exhausted Event

When `presupuesto_gastado >= presupuesto_maximo`:
- `budget_exhausted` flag set to `true`
- `budget_exhausted_at` timestamp recorded
- `budget_exhausted` event logged in `ps_live_events`
- Active session automatically paused with `lock_reason = 'budget_exhausted'`
- Session cannot be resumed until budget is increased (if allowed)

## Roles and Permissions

| Role | Capabilities |
|------|--------------|
| Cliente | View stream (read-only), approve/reject proposals via RPC, cannot modify rules during session |
| Personal Shopper | Start/pause/resume/end session via RPC, propose products via RPC, cannot control money or rules |
| Admin | Supervision only, cannot intervene in active sessions |

## Backend RPCs (SECURITY DEFINER)

All critical operations use atomic RPCs with:
- `SECURITY DEFINER` for elevated permissions
- `SET search_path = public` for security
- `auth.uid()` validation internally
- `FOR UPDATE` locks for concurrency control

### Session Control RPCs (Shopper Only)
- `start_ps_live_session(p_session_id)` - Atomic start with lock
- `pause_ps_live_session(p_session_id)` - Atomic pause
- `resume_ps_live_session(p_session_id)` - Atomic resume (blocked if budget exhausted)
- `end_ps_live_session(p_session_id)` - Atomic end with unlock

### Proposal RPCs
- `create_ps_live_proposal(...)` - Shopper creates with full validation
- `approve_live_proposal(p_proposal_id, p_cliente_id)` - Client approves with budget update
- `reject_live_proposal(p_proposal_id, p_cliente_id, p_motivo)` - Client rejects

### Silence Rule RPC
- `apply_silence_rule_to_proposal(p_proposal_id)` - Backend applies timeout rule

## Database Tables

- `ps_live_orders` - Base orders with rules, limits, and budget tracking
- `ps_live_sessions` - Session management with lock mechanism
- `ps_live_proposals` - Product proposals during session
- `ps_live_events` - Complete audit trail
- `ps_live_incidents` - Incident tracking (pre-existing)

## Triggers

- `check_budget_exhausted_after_approval` - Auto-pauses session when budget reaches max
- `block_proposal_over_budget` - Prevents proposals exceeding budget (backup validation)
- `notify_live_proposal_created` - Client notification on new proposal
- `update_ps_live_orders_updated_at` - Auto-timestamp updates

## Realtime Enabled

All PS Live tables have Supabase Realtime enabled for instant updates:
- `ps_live_orders`
- `ps_live_proposals`
- `ps_live_events`

## Client Read-Only Mode

During active sessions, clients are restricted to:
- Viewing session data (SELECT only)
- Approving/rejecting proposals via RPCs
- NO direct updates to sessions or orders
- NO ability to modify rules mid-session

This is enforced by:
- RLS policies restricting client UPDATE on sessions
- RPCs validating actor roles before execution
- Frontend hooks exposing only permitted actions

## Integration with PS Notifications

PS Live proposals trigger notifications via `ps_notifications` table with type `propuesta_live`.
