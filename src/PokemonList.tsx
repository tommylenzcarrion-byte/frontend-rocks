import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { PokeAPI } from "./api";

interface SimplePokemon {
  name: string;
  id: number;
  sprite: string;
  types: string[];
}

interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  base_experience: number;
}

import { Card } from "./Root";

export const PokemonList = () => {
  const navigate = useNavigate();
  const [pokemons, setPokemons] = useState<SimplePokemon[]>([]);
  const [details, setDetails] = useState<Record<number, PokemonDetail>>({});
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // carica i primi pokémon
    fetchPokemons(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchPokemons(start: number) {
    setLoading(true);
    try {
      const list = await PokeAPI.listPokemons(start, 10);
      const simples: SimplePokemon[] = [];
      for (const item of list.results) {
        const parts = item.url.split("/").filter(Boolean);
        const id = parseInt(parts[parts.length - 1], 10);
        const p = await PokeAPI.getPokemonById(id);
        simples.push({
          name: item.name,
          id,
          sprite:
            p.sprites.other?.["official-artwork"].front_default ||
            p.sprites.front_default ||
            "",
          types: p.types.map((t) => t.type.name),
        });
      }
      setPokemons((prev) => [...prev, ...simples]);
    } catch (e) {
      console.error("failed to load pokemons", e);
    } finally {
      setLoading(false);
    }
  }

  const handleShowDetails = async (id: number, name: string) => {
    if (details[id]) {
      // already have details, toggle off maybe
      const newDetails = { ...details };
      delete newDetails[id];
      setDetails(newDetails);
      return;
    }

    try {
      const p = await PokeAPI.getPokemonByName(name);
      const detail: PokemonDetail = {
        id: p.id,
        name: p.name,
        height: p.height,
        weight: p.weight,
        types: p.types.map((t) => t.type.name),
        base_experience: p.base_experience,
      };
      setDetails((d) => ({ ...d, [id]: detail }));
    } catch (e) {
      console.error("failed to load pokemon detail", e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-center mb-6">Pokédex</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {pokemons.map((p) => (
          <div key={p.id} className="flex flex-col items-center">
            <Card id={p.id} image={p.sprite} name={p.name} types={p.types} />
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
