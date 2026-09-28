import { describe, expect, it } from "vitest";
import { leaders, playOff, standings, type Round } from "./contest";
import type { DieValue } from "./faces";

const round = (values: Record<string, DieValue>): Round =>
  Object.entries(values).map(([name, value]) => ({ name, value }));

/** A roll function that plays back scripted rounds and records who rolled. */
function scripted(...script: Record<string, DieValue>[]) {
  const calls: (readonly string[])[] = [];
  const roll = async (players: readonly string[]) => {
    calls.push(players);
    const values = script[calls.length - 1];
    return players.map((name) => ({ name, value: values[name] }));
  };
  return { roll, calls };
}

describe("leaders", () => {
  it("finds the single highest roll", () => {
    expect(leaders(round({ a: 2, b: 6, c: 5 }))).toEqual(["b"]);
  });

  it("returns everyone tied at the top", () => {
    expect(leaders(round({ a: 4, b: 1, c: 4 }))).toEqual(["a", "c"]);
  });
});

describe("playOff", () => {
  it("stops after one round when someone is highest", async () => {
    const { roll, calls } = scripted({ a: 3, b: 5, c: 1 });
    const rounds = await playOff(["a", "b", "c"], roll, () => {});
    expect(calls).toEqual([["a", "b", "c"]]);
    expect(rounds).toHaveLength(1);
    expect(leaders(rounds[0])).toEqual(["b"]);
  });

  it("re-rolls only the tied players until one is highest", async () => {
    const { roll, calls } = scripted({ a: 6, b: 2, c: 6, d: 6 }, { a: 4, c: 4, d: 1 }, { a: 2, c: 5 });
    const seen: number[] = [];
    const rounds = await playOff(["a", "b", "c", "d"], roll, (so) => {
      seen.push(so.length);
    });
    expect(calls).toEqual([["a", "b", "c", "d"], ["a", "c", "d"], ["a", "c"]]);
    expect(seen).toEqual([1, 2, 3]);
    expect(leaders(rounds[2])).toEqual(["c"]);
  });

  it("waits for onRound before rolling again", async () => {
    const { roll } = scripted({ a: 6, b: 6 }, { a: 1, b: 2 });
    const order: string[] = [];
    await playOff(
      ["a", "b"],
      async (players) => {
        order.push(`roll ${players.length}`);
        return roll(players);
      },
      async (rounds) => {
        await Promise.resolve();
        order.push(`after ${rounds.length}`);
      },
    );
    expect(order).toEqual(["roll 2", "after 1", "roll 2", "after 2"]);
  });
});

describe("standings", () => {
  it("orders by roll and groups ties under one place", () => {
    expect(standings([round({ a: 2, b: 5, c: 2, d: 3, e: 1 })])).toEqual([
      { place: 1, names: ["b"], rolls: [5] },
      { place: 2, names: ["d"], rolls: [3] },
      { place: 3, names: ["a", "c"], rolls: [2] },
      { place: 5, names: ["e"], rolls: [1] },
    ]);
  });

  it("lets tie-break rolls settle the tied players", () => {
    const rounds = [round({ a: 6, b: 3, c: 6, d: 6 }), round({ a: 4, c: 4, d: 1 }), round({ a: 2, c: 5 })];
    expect(standings(rounds)).toEqual([
      { place: 1, names: ["c"], rolls: [6, 4, 5] },
      { place: 2, names: ["a"], rolls: [6, 4, 2] },
      { place: 3, names: ["d"], rolls: [6, 1] },
      { place: 4, names: ["b"], rolls: [3] },
    ]);
  });
});
