import { useEffect, useState } from 'react';
import { UNSPLASH_ACCESS_KEY } from './config';

const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

const LOCAL_STORAGE_KEY = 'galerie-inspiration-favorites';

function App() {
  const [query, setQuery] = useState('design');
  const [photos, setPhotos] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Charger les favoris depuis LocalStorage au démarrage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Erreur LocalStorage', e);
    }
  }, []);

  // Sauvegarder les favoris à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.error('Erreur LocalStorage', e);
    }
  }, [favorites]);

  async function handleSearch(e) {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const url = `${UNSPLASH_API_URL}?query=${encodeURIComponent(
        query.trim(),
      )}&per_page=24&client_id=${UNSPLASH_ACCESS_KEY}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erreur API Unsplash');
      }

      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        setPhotos([]);
        setError('Aucun résultat trouvé pour cette recherche.');
        return;
      }

      setPhotos(data.results);
    } catch (err) {
      console.error(err);
      setError("Une erreur s'est produite lors de la recherche. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  function isFavorite(photo) {
    return favorites.some((fav) => fav.id === photo.id);
  }

  function toggleFavorite(photo) {
    if (isFavorite(photo)) {
      setFavorites((prev) => prev.filter((fav) => fav.id !== photo.id));
    } else {
      setFavorites((prev) => [...prev, photo]);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Galerie d&apos;Inspiration Créative</h1>
          <p className="subtitle">
            Recherchez, explorez et sauvegardez vos images d&apos;inspiration.
          </p>
        </div>

        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Chercher (ex: architecture, ux design, nature...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Recherche...' : 'Rechercher'}
          </button>
        </form>
      </header>

      <main className="app-main">
        <section className="results-section">
          <div className="section-header">
            <h2>Résultats</h2>
            {photos.length > 0 && (
              <span className="badge">{photos.length} images</span>
            )}
          </div>

          {loading && (
            <div className="loader-container">
              <div className="loader" />
              <p>Chargement des images...</p>
            </div>
          )}

          {error && !loading && <p className="error-message">{error}</p>}

          {!loading && !error && photos.length > 0 && (
            <div className="grid">
              {photos.map((photo) => (
                <article key={photo.id} className="card">
                  <button
                    className="card-image-wrapper"
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.urls.small}
                      alt={photo.alt_description || 'Image Unsplash'}
                      loading="lazy"
                    />
                  </button>
                  <div className="card-body">
                    <div className="card-info">
                      <span className="photographer">
                        {photo.user.name}
                      </span>
                      <a
                        href={photo.links.html}
                        target="_blank"
                        rel="noreferrer"
                        className="source-link"
                      >
                        Voir sur Unsplash
                      </a>
                    </div>
                    <button
                      type="button"
                      className={`fav-button ${
                        isFavorite(photo) ? 'fav-active' : ''
                      }`}
                      onClick={() => toggleFavorite(photo)}
                    >
                      {isFavorite(photo) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="favorites-section">
          <div className="section-header">
            <h2>Favoris</h2>
            {favorites.length > 0 && (
              <span className="badge">{favorites.length}</span>
            )}
          </div>
          {favorites.length === 0 ? (
            <p className="muted">
              Aucune image en favori pour l&apos;instant. Ajoute-en depuis les résultats.
            </p>
          ) : (
            <div className="favorites-grid">
              {favorites.map((photo) => (
                <article key={photo.id} className="fav-card">
                  <button
                    type="button"
                    className="fav-thumb"
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo.urls.thumb}
                      alt={photo.alt_description || 'Favori Unsplash'}
                      loading="lazy"
                    />
                  </button>
                  <div className="fav-meta">
                    <span className="photographer small">
                      {photo.user.name}
                    </span>
                    <button
                      type="button"
                      className="fav-remove"
                      onClick={() => toggleFavorite(photo)}
                    >
                      ✕
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </aside>
      </main>

      {selectedPhoto && (
        <div
          className="lightbox-backdrop"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>
            <img
              src={selectedPhoto.urls.regular}
              alt={selectedPhoto.alt_description || 'Image agrandie'}
            />
            <div className="lightbox-info">
              <p>
                Photo de <strong>{selectedPhoto.user.name}</strong> sur{' '}
                <a
                  href={selectedPhoto.links.html}
                  target="_blank"
                  rel="noreferrer"
                >
                  Unsplash
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <small>
          TP &laquo; Galerie d&apos;Inspiration Cr&eacute;ative &raquo; – UDBL – M2 CNM
        </small>
      </footer>
    </div>
  );
}

export default App;