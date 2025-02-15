import sum from './sum';
test("test sum function", () => {
  expect(sum(1, 2)).toBe(3)
});

test("test sum function 2", () => {
    expect(sum (11, 10)).toBe(21)
});