import './Pricing.css';

export default function Pricing() {
    return (
        <div className="page-wrapper">
            <h1 className="page-title">Pricing</h1>
            <p className="pricing-description">
                Alege planul potrivit pentru tine.
            </p>
            <div className="pricing-plans">
                <div className="pricing-plan">
                    <h2>Free</h2>
                    <p className="plan-description">Încearcă platforma cu un număr limitat de generări.</p>
                </div>
                <div className="pricing-plan">
                    <h2>Pro</h2>
                    <p className="plan-description">Mai multe generări și funcționalități avansate.</p>
                </div>
            </div>
        </div>
    );
}
