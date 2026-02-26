import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { PokeAPI } from "./api";

interface PokemonDetailData {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: string[];
  abilities: string[];
  sprite: string;
}

export const Detail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<PokemonDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPokemon() {
      try {
        if (!id) {
          setError("Nessun Pokemon selezionato");
          return;
        }
        const p = await PokeAPI.getPokemonById(parseInt(id, 10));
        setPokemon({
          id: p.id,
          name: p.name,
          height: p.height,
          weight: p.weight,
          base_experience: p.base_experience,
          types: p.types.map((t) => t.type.name),
          abilities: p.abilities.map((a) => a.ability.name),
          sprite:
            p.sprites.other?.["official-artwork"].front_default ||
            p.sprites.front_default ||
            "",
        });
      } catch (e) {
        setError("Errore nel caricamento del Pokemon");
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadPokemon();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-700 text-xl">Caricamento...</div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <div className="text-gray-700 text-xl">{error}</div>
        <button
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded-md"
          onClick={() => navigate("/frontend-rocks")}
        >
          Torna alla lista
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <button
        className="mb-4 bg-gray-100 text-gray-800 px-3 py-1 rounded-md"
        onClick={() => navigate("/frontend-rocks")}
      >
        ← Torna
      </button>

      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <div>
          <h1 className="text-2xl font-bold capitalize">{pokemon.name}</h1>
          <p className="text-sm text-gray-500">#{String(pokemon.id).padStart(3, "0")}</p>
        </div>

        <div className="mt-4 flex gap-6">
          <div className="w-40 flex items-center justify-center bg-gray-50 rounded p-4">
            <img src={pokemon.sprite} alt={pokemon.name} className="w-32 h-32 object-contain" />
          </div>

          <div className="flex-1">
            <div className="mb-3">
              <strong>Tipo:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {pokemon.types.map((t) => (
                  <span key={t} className={`text-white px-3 py-1 rounded-full text-xs ${getTypeColor(t)}`}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-700">
              <div>Altezza: {pokemon.height / 10} m</div>
              <div>Peso: {pokemon.weight / 10} kg</div>
              <div>Esperienza base: {pokemon.base_experience}</div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Abilità</h3>
          <ul className="list-disc list-inside mt-2 text-sm">
            {pokemon.abilities.map((a) => (
              <li key={a}>{a.replace("-", " ")}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

function getTypeColor(type: string): string {
  const typeColors: { [key: string]: string } = {
    fire: "bg-red-500",
    water: "bg-blue-500",
    grass: "bg-green-500",
    electric: "bg-yellow-400",
    psychic: "bg-pink-500",
    ice: "bg-cyan-400",
    dragon: "bg-purple-700",
    dark: "bg-gray-700",
    fairy: "bg-pink-300",
    normal: "bg-gray-400",
    fighting: "bg-red-700",
    flying: "bg-indigo-400",
    poison: "bg-purple-500",
    ground: "bg-yellow-600",
    rock: "bg-yellow-800",
    bug: "bg-green-700",
    ghost: "bg-indigo-700",
    steel: "bg-gray-500",
  };
  return typeColors[type] || "bg-gray-400";
}
