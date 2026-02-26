/*import { useState, useEffect } from "react";
import { Link } from "react-router";
import { PokeAPI } from "./api";
*/
import { PokemonList } from "./PokemonList";

interface Props {
  id: number;
  image: string;
  name: string;
  types: string[];
  stats?: {
    hp?: number;
    attack?: number;
    defense?: number;
  };
  moves?: Array<{ nameJa: string; power?: number | null }>;
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}

import { useRef, useState } from "react";

export const Card: React.FC<Props> = (props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [ty, setTy] = useState(0);
  const [shine, setShine] = useState(0);
  const [hover, setHover] = useState(false);

  function handleMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const xN = (x - 0.5) * 2;
    const yN = (y - 0.5) * 2;

    const newRy = xN * 10;
    const newRx = -yN * 8;
    const newTy = -Math.max(Math.abs(xN), Math.abs(yN)) * 6;

    setRx(newRx);
    setRy(newRy);
    setTy(newTy);
    setShine(x * 100);
  }

  function handleEnter() {
    setHover(true);
  }

  function handleLeave() {
    setHover(false);
    setRx(0);
    setRy(0);
    setTy(0);
    setShine(50);
  }

  const primaryType = (props.types || ["normal"])[0];
  const typeBar = getTypeBarColor(primaryType);
  const typeBorder = getTypeBorderColor(primaryType);
  const transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${ty}px) scale(${hover ? 1.03 : 1})`;
  const shadow = `${-ry * 1.5}px ${Math.abs(rx) * 1.5 + 8}px 20px rgba(0,0,0,0.16)`;
  const isFav = props.isFavorite ? "border-yellow-400 shadow-lg shadow-yellow-300" : "border-gray-300";

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ transform, boxShadow: shadow, transition: "transform 200ms ease, box-shadow 200ms ease" }}
      className={`relative w-56 rounded-xl overflow-hidden ${isFav}`}
    >
      {/* Carta Pokémon stile reale */}
      <div className={`bg-white rounded-xl border-4 ${typeBorder} shadow-xl`} style={{ aspectRatio: "2.5/3.5" }}>
        {/* Top color bar - Pieno larghezza */}
        <div className={`h-3 ${typeBar}`}></div>

        {/* Header Pokemon - Nome + HP + Stella */}
        <div className="px-3 pt-2 pb-3 border-b border-gray-300">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 capitalize">{props.name}</h3>
              <p className="text-xs text-gray-700">Pokémon</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800">HP</p>
              <p className="text-xl font-bold text-red-600">{props.stats?.hp ?? "--"}</p>
            </div>
          </div>
          <button
            onClick={() => props.onToggleFavorite?.(props.id)}
            className="absolute top-2 right-2 text-xl cursor-pointer transition-transform hover:scale-125"
          >
            {props.isFavorite ? "⭐" : "☆"}
          </button>
        </div>

        {/* Tipo Pokemon */}
        <div className="px-3 py-2 flex gap-1">
          {props.types.map((type) => (
            <span
              key={type}
              className={`text-white px-2 py-0.5 rounded-full text-xs font-bold ${getTypeColor(type)}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </div>

        {/* Immagine Pokemon */}
        <div className={`flex items-center justify-center h-32 ${getTypeBackgroundColor(primaryType)} border-b-2 border-gray-300`}>
          <img src={props.image} alt={props.name} className="h-28 w-28 object-contain" />
        </div>

        {/* Pokedex Number */}
        <div className="px-3 py-1 text-xs text-gray-700 bg-white border-b border-gray-300">
          <p className="font-semibold">No. #{String(props.id).padStart(3, "0")}</p>
        </div>

        {/* Attacchi */}
        <div className="px-3 py-2 border-b border-gray-300">
          <p className="text-xs font-bold text-gray-900 mb-1.5">ATTACKS</p>
          <div className="space-y-1.5">
            {(props.moves || []).slice(0, 2).map((m, i) => (
              <div key={i} className="border-2 border-gray-400 rounded px-2 py-1.5 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-gray-800">{m.nameJa || "—"}</span>
                  <span className="text-gray-800 font-bold text-xs bg-yellow-200 px-2 py-0.5 rounded">
                    {m.power ? `${m.power} dmg` : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-300 rounded-b-lg text-center">
          <p className="text-xs italic text-gray-600 mb-1">"A mysterious Pokémon awaits."</p>
          <p className="text-xs text-gray-700">© The Pokémon Company • Lv 50</p>
        </div>
      </div>

      {/* Shine effect */}
      <div
        style={{
          position: "absolute",
          left: `${shine - 30}%`,
          opacity: hover ? 0.7 : 0,
          transform: `rotate(18deg)`,
          transition: "left 120ms linear, opacity 200ms",
          top: 0,
          width: "8rem",
          height: "100%",
          background: "linear-gradient(to right, rgba(255,255,255,0.6), rgba(255,255,255,0.2), rgba(255,255,255,0))",
          filter: "blur(20px)",
          pointerEvents: "none",
          borderRadius: "0.75rem",
        }}
      />
    </div>
  );
};
export function Root() {
  return (
    <div className="min-h-screen py-10">
      <PokemonList />
    </div>
  );
}
function getTypeBackgroundColor(type: string): string {
  const bgColors: { [key: string]: string } = {
    fire: "bg-gradient-to-b from-red-100 to-red-50",
    water: "bg-gradient-to-b from-blue-100 to-blue-50",
    grass: "bg-gradient-to-b from-green-100 to-green-50",
    electric: "bg-gradient-to-b from-yellow-100 to-yellow-50",
    psychic: "bg-gradient-to-b from-pink-100 to-pink-50",
    ice: "bg-gradient-to-b from-cyan-100 to-cyan-50",
    dragon: "bg-gradient-to-b from-purple-100 to-purple-50",
    dark: "bg-gradient-to-b from-gray-200 to-gray-100",
    fairy: "bg-gradient-to-b from-pink-100 to-pink-50",
    normal: "bg-gradient-to-b from-gray-100 to-gray-50",
    fighting: "bg-gradient-to-b from-orange-100 to-orange-50",
    flying: "bg-gradient-to-b from-indigo-100 to-indigo-50",
    poison: "bg-gradient-to-b from-purple-100 to-purple-50",
    ground: "bg-gradient-to-b from-yellow-100 to-yellow-50",
    rock: "bg-gradient-to-b from-yellow-100 to-yellow-50",
    bug: "bg-gradient-to-b from-green-100 to-green-50",
    ghost: "bg-gradient-to-b from-indigo-100 to-indigo-50",
    steel: "bg-gradient-to-b from-gray-100 to-gray-50",
  };
  return bgColors[type] || "bg-gradient-to-b from-gray-100 to-gray-50";
}

function getTypeBarColor(type: string): string {
  const barColors: { [key: string]: string } = {
    fire: "bg-red-600",
    water: "bg-blue-600",
    grass: "bg-green-600",
    electric: "bg-yellow-500",
    psychic: "bg-pink-600",
    ice: "bg-cyan-500",
    dragon: "bg-purple-800",
    dark: "bg-gray-800",
    fairy: "bg-pink-400",
    normal: "bg-gray-500",
    fighting: "bg-red-800",
    flying: "bg-indigo-500",
    poison: "bg-purple-600",
    ground: "bg-yellow-700",
    rock: "bg-yellow-900",
    bug: "bg-green-800",
    ghost: "bg-indigo-800",
    steel: "bg-gray-600",
  };
  return barColors[type] || "bg-gray-500";
}

function getTypeBorderColor(type: string): string {
  const borderColors: { [key: string]: string } = {
    fire: "border-red-500",
    water: "border-blue-500",
    grass: "border-green-500",
    electric: "border-yellow-400",
    psychic: "border-pink-500",
    ice: "border-cyan-400",
    dragon: "border-purple-700",
    dark: "border-gray-700",
    fairy: "border-pink-300",
    normal: "border-gray-400",
    fighting: "border-red-700",
    flying: "border-indigo-400",
    poison: "border-purple-500",
    ground: "border-yellow-600",
    rock: "border-yellow-800",
    bug: "border-green-700",
    ghost: "border-indigo-700",
    steel: "border-gray-500",
  };
  return borderColors[type] || "border-gray-400";
}

function getTypeColor(type: string): string {
  return typeColors[type];
}

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

/*
interface PokemonCard {
  id: number;
  image: string;
  name: string;
  types: string[];
}

async function fetchData(offset: number): Promise<PokemonCard[]> {
  const list = await PokeAPI.listPokemons(offset, 20);
  const pokemons = await Promise.all(
    list.results.map(async (item: { name: string; url: string }) => {
      const pokemon = await PokeAPI.getPokemonByName(item.name);
      return pokemon;
    }),
  );

  return pokemons.map((item) => ({
    id: item.id,
    image: item.sprites.other?.["official-artwork"].front_default ?? "",
    name: item.name,
    types: item.types.map((type) => type.type.name),
  }));
}*///