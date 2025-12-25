import { describe, it, expect } from "vitest";
import { Civilization } from "./civilization";

describe("Civilization", () => {
  describe("enum values", () => {
    it("should have all expected civilization values", () => {
      expect(Civilization.Light).toBe("light");
      expect(Civilization.Water).toBe("water");
      expect(Civilization.Darkness).toBe("darkness");
      expect(Civilization.Fire).toBe("fire");
      expect(Civilization.Nature).toBe("nature");
    });

    it("should have exactly 5 civilizations", () => {
      const values = Object.values(Civilization);
      expect(values).toHaveLength(5);
    });

    it("should have unique values", () => {
      const values = Object.values(Civilization);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(values.length);
    });

    it("should have all values as strings", () => {
      const values = Object.values(Civilization);
      values.forEach((value) => {
        expect(typeof value).toBe("string");
      });
    });
  });

  describe("enum keys", () => {
    it("should have correct key names", () => {
      expect(Civilization.Light).toBeDefined();
      expect(Civilization.Water).toBeDefined();
      expect(Civilization.Darkness).toBeDefined();
      expect(Civilization.Fire).toBeDefined();
      expect(Civilization.Nature).toBeDefined();
    });

    it("should have all keys as expected", () => {
      const keys = Object.keys(Civilization);
      const expectedKeys = ["Light", "Water", "Darkness", "Fire", "Nature"];
      expect(keys.sort()).toEqual(expectedKeys.sort());
    });
  });

  describe("enum usage", () => {
    it("should be usable in comparisons", () => {
      expect(Civilization.Light === "light").toBe(true);
      expect(Civilization.Water === "water").toBe(true);
      expect(Civilization.Darkness === "darkness").toBe(true);
      expect(Civilization.Fire === "fire").toBe(true);
      expect(Civilization.Nature === "nature").toBe(true);
    });

    it("should be iterable", () => {
      const values = Object.values(Civilization);
      expect(values).toContain("light");
      expect(values).toContain("water");
      expect(values).toContain("darkness");
      expect(values).toContain("fire");
      expect(values).toContain("nature");
    });

    it("should be usable in switch statements", () => {
      const getCivilizationType = (civilization: Civilization): string => {
        switch (civilization) {
          case Civilization.Light:
            return "defensive";
          case Civilization.Water:
            return "control";
          case Civilization.Darkness:
            return "aggressive";
          case Civilization.Fire:
            return "rush";
          case Civilization.Nature:
            return "ramp";
          default:
            return "unknown";
        }
      };

      expect(getCivilizationType(Civilization.Light)).toBe("defensive");
      expect(getCivilizationType(Civilization.Water)).toBe("control");
      expect(getCivilizationType(Civilization.Darkness)).toBe("aggressive");
      expect(getCivilizationType(Civilization.Fire)).toBe("rush");
      expect(getCivilizationType(Civilization.Nature)).toBe("ramp");
    });
  });

  describe("specific civilization values", () => {
    it("should have Light civilization with correct value", () => {
      expect(Civilization.Light).toBe("light");
    });

    it("should have Water civilization with correct value", () => {
      expect(Civilization.Water).toBe("water");
    });

    it("should have Darkness civilization with correct value", () => {
      expect(Civilization.Darkness).toBe("darkness");
    });

    it("should have Fire civilization with correct value", () => {
      expect(Civilization.Fire).toBe("fire");
    });

    it("should have Nature civilization with correct value", () => {
      expect(Civilization.Nature).toBe("nature");
    });
  });
});
