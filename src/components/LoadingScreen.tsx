import "./LoadingScreen.css";

const LoadingScreen = () => {
  return (
    <div className="loading-screen-container">
      {/* Cubo 3D (Estilo young-dragon-29) */}
      <div className="spinner-cube">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      {/* Carrusel de Palabras (Estilo fresh-lizard-20, adaptado a Light Theme) */}
      <div className="words-container">
        <span>Cargando</span>
        <div className="words-wrapper">
          <div className="words-list">
            <span className="word-item">sesión...</span>
            <span className="word-item">seguridad...</span>
            <span className="word-item">catálogo...</span>
            <span className="word-item">preferencias...</span>
            <span className="word-item">sesión...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
