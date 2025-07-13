import {flatten, sortBy, groupBy} from "./collection";
import {describe, it, expect} from "vitest";

describe("collection utilities", () => {
  describe("flatten", () => {
    it("flattens empty arrays", () => {
      expect(flatten([])).toEqual([]);
      expect(flatten([[], []])).toEqual([]);
    });

    it("flattens single level arrays", () => {
      expect(
        flatten([
          [1, 2],
          [3, 4],
        ]),
      ).toEqual([1, 2, 3, 4]);
      expect(flatten([["a", "b"], ["c"]])).toEqual(["a", "b", "c"]);
    });

    it("flattens arrays with mixed content", () => {
      expect(flatten([[1], [], [2, 3, 4], [5]])).toEqual([1, 2, 3, 4, 5]);
    });

    it("handles arrays with different lengths", () => {
      expect(flatten([[1, 2, 3, 4, 5], [6], [7, 8]])).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("works with complex objects", () => {
      const obj1 = {id: 1, name: "first"};
      const obj2 = {id: 2, name: "second"};
      const obj3 = {id: 3, name: "third"};

      expect(flatten([[obj1], [obj2, obj3]])).toEqual([obj1, obj2, obj3]);
    });
  });

  describe("sortBy", () => {
    it("sorts empty arrays", () => {
      expect(sortBy([], (x: number) => x)).toEqual([]);
    });

    it("sorts numbers by value", () => {
      expect(sortBy([3, 1, 4, 1, 5], (x) => x)).toEqual([1, 1, 3, 4, 5]);
    });

    it("sorts strings by length", () => {
      expect(sortBy(["hello", "hi", "world", "a"], (x) => x.length)).toEqual(["a", "hi", "hello", "world"]);
    });

    it("sorts strings alphabetically", () => {
      expect(sortBy(["zebra", "apple", "banana"], (x) => x)).toEqual(["apple", "banana", "zebra"]);
    });

    it("sorts objects by property", () => {
      const people = [
        {name: "Alice", age: 25},
        {name: "Bob", age: 20},
        {name: "Charlie", age: 30},
      ];

      expect(sortBy(people, (p) => p.age)).toEqual([
        {name: "Bob", age: 20},
        {name: "Alice", age: 25},
        {name: "Charlie", age: 30},
      ]);
    });

    it("maintains stable sort for equal values", () => {
      const items = [
        {value: 1, order: "first"},
        {value: 2, order: "second"},
        {value: 1, order: "third"},
      ];

      const sorted = sortBy(items, (item) => item.value);
      expect(sorted[0].order).toBe("first");
      expect(sorted[1].order).toBe("third");
      expect(sorted[2].order).toBe("second");
    });

    it("doesn't modify original array", () => {
      const original = [3, 1, 4, 1, 5];
      const sorted = sortBy(original, (x) => x);
      expect(original).toEqual([3, 1, 4, 1, 5]);
      expect(sorted).toEqual([1, 1, 3, 4, 5]);
    });
  });

  describe("groupBy", () => {
    it("groups empty arrays", () => {
      expect(groupBy([], (x: number) => x)).toEqual({});
    });

    it("groups numbers by value", () => {
      expect(groupBy([1, 2, 1, 3, 2], (x) => x)).toEqual({
        1: [1, 1],
        2: [2, 2],
        3: [3],
      });
    });

    it("groups strings by length", () => {
      expect(groupBy(["hello", "hi", "world", "a", "by"], (x) => x.length)).toEqual({
        1: ["a"],
        2: ["hi", "by"],
        5: ["hello", "world"],
      });
    });

    it("groups objects by property", () => {
      const people = [
        {name: "Alice", department: "Engineering"},
        {name: "Bob", department: "Sales"},
        {name: "Charlie", department: "Engineering"},
        {name: "Diana", department: "Marketing"},
      ];

      expect(groupBy(people, (p) => p.department)).toEqual({
        Engineering: [
          {name: "Alice", department: "Engineering"},
          {name: "Charlie", department: "Engineering"},
        ],
        Sales: [{name: "Bob", department: "Sales"}],
        Marketing: [{name: "Diana", department: "Marketing"}],
      });
    });

    it("handles numeric keys", () => {
      const scores = [
        {student: "Alice", grade: 85},
        {student: "Bob", grade: 92},
        {student: "Charlie", grade: 85},
        {student: "Diana", grade: 78},
      ];

      expect(groupBy(scores, (s) => s.grade)).toEqual({
        85: [
          {student: "Alice", grade: 85},
          {student: "Charlie", grade: 85},
        ],
        92: [{student: "Bob", grade: 92}],
        78: [{student: "Diana", grade: 78}],
      });
    });

    it("preserves original order within groups", () => {
      const items = [
        {type: "A", value: 1},
        {type: "B", value: 2},
        {type: "A", value: 3},
        {type: "B", value: 4},
        {type: "A", value: 5},
      ];

      const grouped = groupBy(items, (item) => item.type);
      expect(grouped.A).toEqual([
        {type: "A", value: 1},
        {type: "A", value: 3},
        {type: "A", value: 5},
      ]);
      expect(grouped.B).toEqual([
        {type: "B", value: 2},
        {type: "B", value: 4},
      ]);
    });

    it("doesn't modify original array", () => {
      const original = [1, 2, 1, 3, 2];
      const grouped = groupBy(original, (x) => x);
      expect(original).toEqual([1, 2, 1, 3, 2]);
      expect(grouped).toEqual({
        1: [1, 1],
        2: [2, 2],
        3: [3],
      });
    });
  });
});
