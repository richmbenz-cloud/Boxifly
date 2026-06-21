import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("combina nombres de clases", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("resuelve conflictos de Tailwind (gana la última clase)", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("ignora valores falsy", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});
