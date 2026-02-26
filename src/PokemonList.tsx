import { useEffect, useState } from "react";
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
  const [pokemons, setPokemons] = useState<SimplePokemon[]>([]);
  const [details, setDetails] = useState<Record<number, PokemonDetail>>({});

  useEffect(() => {
    async function load() {
      try {
        const list = await PokeAPI.listPokemons(0, 10);
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
        setPokemons(simples);
      } catch (e) {
        console.error("failed to load pokemons", e);
      }
    }

    load();
  }, []);

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
    <div className="w-full max-w-4xl mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pokemons.map((p) => (
        <div key={p.id} className="flex flex-col items-center space-y-2">
          <Card id={p.id} image={p.sprite} name={p.name} types={p.types} />
          <button
            className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => handleShowDetails(p.id, p.name)}
          >
            {details[p.id] ? "Chiudi" : "Dettagli"}
          </button>
          {details[p.id] && (
            <div className="mt-2 text-sm text-gray-700 text-left w-full p-2 bg-gray-100 rounded">
              <p>Height: {details[p.id].height}</p>
              <p>Weight: {details[p.id].weight}</p>
              <p>Base exp: {details[p.id].base_experience}</p>
              <p>Types: {details[p.id].types.join(", ")}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
