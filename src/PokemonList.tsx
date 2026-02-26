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



  return (
    <div className="w-full max-w-6xl mx-auto mt-10 px-4">
      {/* Sezione I miei Pokemon */}
      {myPokemons.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-yellow-600 mb-6">⭐ I miei Pokemon</h2>
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
                  className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-md"
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
      <h1 className="text-2xl font-bold text-center mb-6">Pokédex</h1>
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
              className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-md"
              onClick={() => navigate(`/frontend-rocks/dettaglio/${p.id}`)}
            >
              Info
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
          onClick={() => {
            const next = offset + 10;
            setOffset(next);
            fetchPokemons(next);
          }}
          disabled={loading}
        >
          {loading ? "Caricamento..." : "More Pokemon"}
        </button>
      </div>
    </div>
  );
};
