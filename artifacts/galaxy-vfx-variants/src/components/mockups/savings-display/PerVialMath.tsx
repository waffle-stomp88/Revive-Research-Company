import './_group.css';

export function PerVialMath() {
  const total = 540;
  const perVial = 67.5;
  const singleVial = 85;
  const qty = 8;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', width: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>TOTAL</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{qty} vials</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginBottom: '12px' }} />
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '34px', fontWeight: 900, color: 'var(--chartreuse)', lineHeight: 1 }}>
            ${total}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cyan)', background: 'rgba(33,216,255,0.1)', borderRadius: '6px', padding: '2px 7px', lineHeight: 1.4 }}>
            ↓20.6%
          </span>
        </div>
        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
            ${perVial.toFixed(2)}/vial
          </span>
          <span style={{ fontSize: '11px', color: '#374151' }}>·</span>
          <span style={{ fontSize: '12px', color: '#4b5563' }}>
            ${singleVial}/vial single-pack
          </span>
        </div>
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#374151', fontStyle: 'italic' }}>← C — per-vial math breakdown</div>
      </div>
    </div>
  );
}
