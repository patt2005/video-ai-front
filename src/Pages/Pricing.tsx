export default function Pricing() {
    return (
        <div className="page-wrapper">
            <h1 className="page-title">Pricing</h1>
            <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
                Alege planul potrivit pentru tine.
            </p>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px', background: '#141414', borderRadius: '16px', padding: '20px', border: '1px solid #333' }}>
                    <h2>Free</h2>
                    <p style={{ color: '#9ca3af' }}>Încearcă platforma cu un număr limitat de generări.</p>
                </div>
                <div style={{ flex: 1, minWidth: '220px', background: '#141414', borderRadius: '16px', padding: '20px', border: '1px solid #333' }}>
                    <h2>Pro</h2>
                    <p style={{ color: '#9ca3af' }}>Mai multe generări și funcționalități avansate.</p>
                </div>
            </div>
        </div>
    );
}
