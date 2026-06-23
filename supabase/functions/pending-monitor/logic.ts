// ============================================================
// pending-monitor/logic.ts — lógica pura y testeable (sin dependencias Deno).
//
// Aislada del runtime (sin `serve`/`Deno.*`) para poder cubrirla con vitest,
// igual que `aftership-webhook/logic.ts`. Solo usa APIs estándar disponibles
// tanto en Deno (Edge Functions) como en Node 20 (CI/tests).
// ============================================================

// Resultado de un check de "pendientes" (una fila por cosa monitoreada).
export interface CheckResult {
  key: string;          // identificador estable (whatsapp | payments | kyc)
  label: string;        // texto legible para el email
  count: number;        // cuántos elementos pendientes superan el umbral
  thresholdMin: number; // umbral de antigüedad en minutos
}

// Parsea un entero de variable de entorno con fallback seguro (>0).
export function envInt(v: string | undefined | null, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

// Marca de corte ISO: "ahora - maxMin minutos". Todo lo creado ANTES está vencido.
export function cutoffIso(nowMs: number, maxMin: number): string {
  return new Date(nowMs - maxMin * 60_000).toISOString();
}

// ¿Hay que alertar? (algún check con al menos 1 elemento vencido).
export function shouldAlert(results: CheckResult[]): boolean {
  return results.some((r) => r.count > 0);
}

// Suma total de pendientes vencidos.
export function totalPending(results: CheckResult[]): number {
  return results.reduce((acc, r) => acc + (r.count > 0 ? r.count : 0), 0);
}

// Construye el correo (asunto + html + texto) a partir de los checks vencidos.
export function buildAlert(
  results: CheckResult[],
  nowIso: string,
  envName: string
): { subject: string; html: string; text: string } {
  const breached = results.filter((r) => r.count > 0);
  const total = totalPending(results);
  const subject = `⚠️ Boxifly [${envName}] — ${total} pendiente(s) requieren atención`;

  const rows = breached
    .map(
      (r) =>
        `<tr>` +
        `<td style="padding:10px 14px;border-bottom:1px solid #eee">${r.label}</td>` +
        `<td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#b91c1c">${r.count}</td>` +
        `<td style="padding:10px 14px;border-bottom:1px solid #eee;color:#888;text-align:right">&gt; ${r.thresholdMin} min</td>` +
        `</tr>`
    )
    .join('');

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
  <body style="margin:0;padding:0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f5f5f5">
    <table role="presentation" style="width:100%;border-collapse:collapse;background:#f5f5f5"><tr><td style="padding:32px 16px">
      <table role="presentation" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.08)">
        <tr><td style="padding:28px 32px;background:linear-gradient(135deg,#b91c1c 0%,#7f1d1d 100%)">
          <h1 style="margin:0;color:#fff;font-size:20px">Alerta de monitoreo — pendientes</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.9);font-size:13px">Entorno: <strong>${envName}</strong> · ${nowIso}</p>
        </td></tr>
        <tr><td style="padding:24px 32px">
          <p style="margin:0 0 16px;color:#333;font-size:14px">Se detectaron elementos atascados en estado <code>pending</code> por encima de su umbral:</p>
          <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
            <thead><tr>
              <th style="text-align:left;padding:8px 14px;color:#666;border-bottom:2px solid #eee">Check</th>
              <th style="text-align:right;padding:8px 14px;color:#666;border-bottom:2px solid #eee">Cantidad</th>
              <th style="text-align:right;padding:8px 14px;color:#666;border-bottom:2px solid #eee">Umbral</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="margin:20px 0 0;color:#888;font-size:12px">Generado por la Edge Function <code>pending-monitor</code> (cron cada 15 min). Si esto persiste, revisa el pipeline correspondiente (WhatsApp / pagos / KYC).</p>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`;

  const text =
    `Boxifly [${envName}] — alerta de pendientes (${nowIso})\n\n` +
    breached.map((r) => `- ${r.label}: ${r.count} (> ${r.thresholdMin} min)`).join('\n');

  return { subject, html, text };
}
