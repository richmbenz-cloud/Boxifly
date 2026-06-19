# Memory: features/personal-shopper/service-type-differentiation
Updated: now

The Personal Shopper service clearly differentiates between two service types that share the same database foundation but have distinct logic:

## PS Asistido (Request-based)
- Traditional async service where clients submit product requests
- Shoppers provide quotes that clients review and approve/reject
- Full quote lifecycle with expiration
- Icon: UserCheck
- Color: Primary blue

## PS Live (Streaming) - FULLY IMPLEMENTED
- Real-time streaming service from physical stores
- **Requires pre-approved PS Live Order (Orden PS Live Base)** with:
  - Budget limits (presupuesto_maximo)
  - Allowed categories
  - Session duration limits
  - Silence rules (timeout actions)
  - Approval type (automatic/manual per item)
- Session states: programada, esperando_ps, en_vivo, pausada, finalizada, cancelada, expirada
- Product proposals tracked in `ps_live_proposals` with real-time budget enforcement
- Complete audit trail in `ps_live_events`
- Icon: Video
- Color: Red

## Database Tables for PS Live
- `ps_live_orders` - Base orders with rules and limits
- `ps_live_sessions` - Session management (extended with live_order_id)
- `ps_live_proposals` - Real-time product proposals
- `ps_live_events` - Complete audit trail
- `ps_live_incidents` - Live-specific incidents

## Visual Implementation
- `PSServiceTypeBadge` component displays appropriate icon and color
- Badge appears in dashboards, quote cards, and order details

## Enforcement Rules
- No PS Live session can start without approved `ps_live_orders` entry
- Budget is enforced at database level with triggers
- All proposals, approvals, and rejections are logged as events
