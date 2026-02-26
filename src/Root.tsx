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
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1
    const xN = (x - 0.5) * 2; // -1..1
    const yN = (y - 0.5) * 2; // -1..1

    const newRy = xN * 10; // rotateY
    const newRx = -yN * 8; // rotateX
    const newTy = -Math.max(Math.abs(xN), Math.abs(yN)) * 6; // move up a bit

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

  const transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(${ty}px) scale(${hover ? 1.03 : 1})`;
  const shadow = `${-ry * 1.5}px ${Math.abs(rx) * 1.5 + 8}px 20px rgba(0,0,0,0.16)`;

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{ transform, boxShadow: shadow, transition: "transform 200ms ease, box-shadow 200ms ease" }}
      className="relative w-56 h-72 rounded-xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 overflow-hidden"
    >
      {/* watermark Pokéball */}
      <svg className="absolute -right-6 -top-6 w-40 h-40 opacity-10" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <circle cx="50" cy="50" r="45" stroke="black" strokeWidth="4" fill="none" />
        <path d="M5 50 H95" stroke="black" strokeWidth="4" />
        <circle cx="50" cy="50" r="12" stroke="black" strokeWidth="3" fill="none" />
      </svg>

      {/* shine */}
      <div
        style={{
          left: `${shine - 30}%`,
          opacity: hover ? 0.7 : 0,
          transform: `rotate(18deg)`,
          transition: "left 120ms linear, opacity 200ms",
        }}
        className="pointer-events-none absolute top-0 w-32 h-full bg-gradient-to-r from-white/60 via-white/20 to-white/0 blur-xl"
      />

      <div className="relative z-10 h-full flex flex-col p-4">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-lg text-gray-900 font-semibold capitalize">{props.name}</h4>
            <p className="text-xs text-gray-500">#{String(props.id).padStart(3, "0")}</p>
          </div>
          <div className="text-sm text-gray-600">HP •</div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <img src={props.image} alt={props.name} className="w-36 h-36 object-contain" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {props.types.map((type) => (
              <span key={type} className={`text-white px-3 py-1 rounded-full text-xs ${getTypeColor(type)}`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-500">Lvl •</div>
        </div>
      </div>
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