import './Explore.css';
import longCardIcon from '../../assets/longcardicon.png';

export default function Explore() {
    return (
        <div className="page-wrapper explore-wrapper">
            <p className="explore-description">
              Follow your dream creating Videos wit MovyAI
            </p>
            <div className="explore-cards-row">
                <div className="explore-card">
                    <div className="explore-card-thumb" />
                    <h2 className="explore-card-title">Video template 1</h2>
                    <p className="explore-card-text">Aici vei pune primul video demo.</p>
                </div>
                <div className="explore-card">
                    <div className="explore-card-thumb" />
                    <h2 className="explore-card-title">Video template 2</h2>
                    <p className="explore-card-text">Al doilea video demo pentru Explore.</p>
                </div>
                <div className="explore-card">
                    <div className="explore-card-thumb" />
                    <h2 className="explore-card-title">Video template 3</h2>
                    <p className="explore-card-text">Poți adăuga aici un alt exemplu.</p>
                </div>
                <div className="explore-card">
                    <div className="explore-card-thumb" />
                    <h2 className="explore-card-title">Video template 4</h2>
                    <p className="explore-card-text">Încă un card pentru un video viitor.</p>
                </div>
                <div className="explore-card">
                    <div className="explore-card-thumb" />
                    <h2 className="explore-card-title">Video template 5</h2>
                    <p className="explore-card-text">Un alt slot pregătit pentru un video nou.</p>
                </div>
                <div className="explore-card">
                    <div className="explore-card-thumb" />
                    <h2 className="explore-card-title">Video template 6</h2>
                    <p className="explore-card-text">Poți folosi acest card pentru un highlight.</p>
                </div>
                <div className="explore-card">
                    <div className="explore-card-thumb" />
                    <h2 className="explore-card-title">Video template 7</h2>
                    <p className="explore-card-text">Template suplimentar pentru un clip demo.</p>
                </div>
                <div className="explore-card">
                    <div className="explore-card-thumb" />
                    <h2 className="explore-card-title">Video template 8</h2>
                    <p className="explore-card-text">Ultimul card din lista curentă de exemple.</p>
                </div>
            </div>
            <div className="explore-full-card">
                <img src={longCardIcon} alt="icon" className="explore-full-icon" />
                <div className="explore-full-thumb">
                    <h2 className="explore-full-title">CLICK NOW FOR EXCLUSIVE USE THE DISCOUNT</h2>
                    <p className="explore-full-text">Fi primul care accesează posibilitățile noastre</p>
                </div>
            </div>
        </div>
    )
}
