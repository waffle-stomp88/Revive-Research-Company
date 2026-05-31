import './_group.css';

export function SaveChip() {
  const total = 540;
  const savings = 140;
  const perVial = 67.5;
  const qty = 8;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '24px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px 24px', width: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase' }}>TOTAL</span>
          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{qty} vials · ${perVial.toFixed(2)}/vial</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', marginBottom: '12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '34px', fontWeight: 900, color: 'var(--chartreuse)', lineHeight: 1 }}>
            ${total}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--green)', background: 'rgba(34,197,94,0.12)', borderRadius: '5px', padding: '2px 8px', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.5 }}>
              SAVE ${savings}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cyan)', background: 'rgba(33,216,255,0.1)', borderRadius: '5px', padding: '2px 7px', lineHeight: 1.4, textAlign: 'center' }}>
              ↓20.6%
            </span>
          </div>
        </div>
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#374151', fontStyle: 'italic' }}>← D — save chip (factual dollar savings)</div>
      </div>
    </div>
  );
}
