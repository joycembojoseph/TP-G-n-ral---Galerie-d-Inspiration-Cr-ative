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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto p-6 md:p-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1>Galerie d&apos;Inspiration Créative</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Recherchez, explorez et sauvegardez vos images d&apos;inspiration.
            </p>
          </div>

          <form className="flex gap-2 w-full md:w-auto" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Chercher (ex: architecture, ux design, nature...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 md:w-96 px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-60"
            >
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Résultats</h2>
              {photos.length > 0 && (
                <span className="badge">{photos.length} images</span>
              )}
            </div>

            {loading && (
              <div className="flex items-center gap-3 text-sm">
                <div className="animate-spin h-6 w-6 border-4 border-indigo-300 border-t-indigo-600 rounded-full" />
                <p>Chargement des images...</p>
              </div>
            )}

            {error && !loading && <p className="text-rose-600">{error}</p>}

            {!loading && !error && photos.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {photos.map((photo) => (
                  <article key={photo.id} className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                    <button
                      className="block w-full"
                      type="button"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo.urls.small}
                        alt={photo.alt_description || 'Image Unsplash'}
                        loading="lazy"
                        className="w-full h-48 object-cover"
                      />
                    </button>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{photo.user.name}</span>
                        <a
                          href={photo.links.html}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-600"
                        >
                          Voir sur Unsplash
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          className={`text-sm px-3 py-1 rounded ${
                            isFavorite(photo)
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
                          }`}
                          onClick={() => toggleFavorite(photo)}
                        >
                          {isFavorite(photo) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Favoris</h2>
              {favorites.length > 0 && (
                <span className="badge">{favorites.length}</span>
              )}
            </div>
            {favorites.length === 0 ? (
              <p className="muted">
                Aucune image en favori pour l&apos;instant. Ajoute-en depuis les résultats.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {favorites.map((photo) => (
                  <article key={photo.id} className="relative">
                    <button
                      type="button"
                      className="block w-full"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo.urls.thumb}
                        alt={photo.alt_description || 'Favori Unsplash'}
                        loading="lazy"
                        className="w-full h-20 object-cover rounded"
                      />
                    </button>
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-white/80 dark:bg-slate-700/80 rounded-full p-1 text-xs"
                      onClick={() => toggleFavorite(photo)}
                    >
                      ✕
                    </button>
                  </article>
                ))}
              </div>
            )}
          </aside>
        </main>

        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-lg max-w-3xl w-full mx-4 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-slate-700/80 rounded-full"
                onClick={() => setSelectedPhoto(null)}
              >
                ✕
              </button>
              <img
                src={selectedPhoto.urls.regular}
                alt={selectedPhoto.alt_description || 'Image agrandie'}
                className="w-full h-[60vh] object-contain bg-black/5 dark:bg-white/5"
              />
              <div className="p-4 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  Photo de <strong>{selectedPhoto.user.name}</strong> sur{' '}
                  <a
                    href={selectedPhoto.links.html}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Unsplash
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-slate-500">
          <small>
            TP &laquo; Galerie d&apos;Inspiration Cr&eacute;ative &raquo; – UDBL – M2 CNM
          </small>
        </footer>
      </div>
    </div>
  );
}

export default App;