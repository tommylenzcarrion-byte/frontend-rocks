import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PokeAPI } from "./api";

interface SimplePokemon {
  name: string;
  id: number;
  sprite: string;
  types: string[];
}

interface SimplePokemonExtended extends SimplePokemon {
  stats?: { hp?: number; attack?: number; defense?: number };
  moves?: Array<{ nameJa: string; power?: number | null }>;
}

import { Card } from "./Root";

export const PokemonList = () => {
  const navigate = useNavigate();
  const [pokemons, setPokemons] = useState<SimplePokemonExtended[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleFavorite = (id: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const myPokemons = pokemons.filter((p) => favorites.has(p.id));
  const [randomPokemon, setRandomPokemon] = useState<SimplePokemonExtended | null>(null);

  useEffect(() => {
    // carica i primi pokémon
    fetchPokemons(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPokemons(start: number) {
    setLoading(true);
    try {
      const list = await PokeAPI.listPokemons(start, 10);
      const simples: SimplePokemonExtended[] = [];
      for (const item of list.results) {
        const parts = item.url.split("/").filter(Boolean);
        const id = parseInt(parts[parts.length - 1], 10);
        const p = await PokeAPI.getPokemonById(id);

        // estraiamo statistiche base
        const statMap: { [key: string]: number } = {};
        for (const s of p.stats) {
          statMap[s.stat.name] = s.base_stat;
        }

        // prendi fino a 2 mosse (nomi in inglese)
        const movesRes: Array<{ nameJa: string; power?: number | null }> = [];
        const movesToFetch = (p.moves || []).slice(0, 2);
        for (const mv of movesToFetch) {
          movesRes.push({ nameJa: mv.move.name, power: null });
        }

        simples.push({
          name: item.name,
          id,
          sprite:
            p.sprites.other?.["official-artwork"].front_default ||
            p.sprites.front_default ||
            "",
          types: p.types.map((t) => t.type.name),
          stats: { hp: statMap["hp"], attack: statMap["attack"], defense: statMap["defense"] },
          moves: movesRes,
        });
      }
      setPokemons((prev) => [...prev, ...simples]);
    } catch (e) {
      console.error("failed to load pokemons", e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRandomPokemon() {
    try {
      const randomId = Math.floor(Math.random() * 1025) + 1;
      const p = await PokeAPI.getPokemonById(randomId);

      const statMap: { [key: string]: number } = {};
      for (const s of p.stats) {
        statMap[s.stat.name] = s.base_stat;
      }

      const movesRes: Array<{ nameJa: string; power?: number | null }> = [];
      const movesToFetch = (p.moves || []).slice(0, 2);
      for (const mv of movesToFetch) {
        movesRes.push({ nameJa: mv.move.name, power: null });
      }

      setRandomPokemon({
        name: p.name,
        id: p.id,
        sprite:
          p.sprites.other?.["official-artwork"].front_default ||
          p.sprites.front_default ||
          "",
        types: p.types.map((t) => t.type.name),
        stats: { hp: statMap["hp"], attack: statMap["attack"], defense: statMap["defense"] },
        moves: movesRes,
      });
    } catch (e) {
      console.error("failed to load random pokemon", e);
    }
  }

  return (
    <div className="w-full min-h-screen">
      <div className="w-full max-w-6xl mx-auto mt-10 px-4">
        {/* Titolo Pokédex animato */}
        <style>{`
          @keyframes titleFloat {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes colorShift {
            0% { color: #ef4444; }
            25% { color: #f97316; }
            50% { color: #eab308; }
            75% { color: #3b82f6; }
            100% { color: #ef4444; }
          }
          .pokedex-title {
            animation: titleFloat 3s ease-in-out infinite, colorShift 6s ease-in-out infinite;
            font-size: 3.5rem;
            font-weight: 900;
            text-align: center;
            margin-bottom: 2rem;
            text-shadow: 3px 3px 0px rgba(0,0,0,0.1);
            letter-spacing: 2px;
          }
          .my-pokemon-title {
            animation: titleFloat 3s ease-in-out infinite;
          }
        `}</style>
        <h1 className="pokedex-title">POKÉDEX</h1>

        {/* Sezione Scopri Pokémon Casuale */}
        <div className="mb-12 text-center">
          <button
            onClick={fetchRandomPokemon}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 shadow-lg"
          >
            🎲 Scopri un Pokémon Casuale
          </button>
          {randomPokemon && (
            <div className="mt-8 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Pokémon del Giorno</h3>
              <div className="flex flex-col items-center">
                <Card
                  id={randomPokemon.id}
                  image={randomPokemon.sprite}
                  name={randomPokemon.name}
                  types={randomPokemon.types}
                  stats={randomPokemon.stats}
                  moves={randomPokemon.moves}
                  isFavorite={favorites.has(randomPokemon.id)}
                  onToggleFavorite={toggleFavorite}
                />
                <button
                  className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors font-semibold"
                  onClick={() => navigate(`/frontend-rocks/dettaglio/${randomPokemon.id}`)}
                >
                  Vedi Dettagli
                </button>
              </div>
            </div>
          )}
        </div>

        <hr className="my-8 border-gray-300" />
        {myPokemons.length > 0 && (
          <div className="mb-12">
            <h2 className="my-pokemon-title text-3xl font-bold text-yellow-600 mb-6">⭐ I miei Pokemon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {myPokemons.map((p) => (
                <div key={p.id} className="flex flex-col items-center">
                  <Card
                    id={p.id}
                    image={p.sprite}
                    name={p.name}
                    types={p.types}
                    stats={p.stats}
                    moves={p.moves}
                    isFavorite={true}
                    onToggleFavorite={toggleFavorite}
                  />
                  <button
                    className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition-colors"
                    onClick={() => navigate(`/frontend-rocks/dettaglio/${p.id}`)}
                  >
                    Info
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sezione Pokédex */}
        <h3 className="text-xl font-bold text-gray-800 mb-6">Scopri i Pokémon</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {pokemons.map((p) => (
            <div key={p.id} className="flex flex-col items-center">
              <Card
                id={p.id}
                image={p.sprite}
                name={p.name}
                types={p.types}
                stats={p.stats}
                moves={p.moves}
                isFavorite={favorites.has(p.id)}
                onToggleFavorite={toggleFavorite}
              />
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-md hover:bg-blue-600 transition-colors"
                onClick={() => navigate(`/frontend-rocks/dettaglio/${p.id}`)}
              >
                Info
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <button
            className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            onClick={() => {
              const next = offset + 10;
              setOffset(next);
              fetchPokemons(next);
            }}
            disabled={loading}
          >
            {loading ? "Caricamento..." : "Carica altri Pokémon"}
          </button>
        </div>
      </div>
    </div>
  );
};
