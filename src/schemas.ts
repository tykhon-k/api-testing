/** Contract checks for the Bookstore API responses. */

export type Book = {
  id: number;
  title: string;
  author: string;
  price: number;
};

/** Returns the reasons a value fails the Book contract (empty = valid). */
export function bookViolations(value: unknown): string[] {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null) return ["not an object"];
  const b = value as Record<string, unknown>;
  if (typeof b.id !== "number") errors.push("id must be a number");
  if (typeof b.title !== "string" || b.title.trim() === "")
    errors.push("title must be a non-empty string");
  if (typeof b.author !== "string" || b.author.trim() === "")
    errors.push("author must be a non-empty string");
  if (typeof b.price !== "number" || b.price < 0)
    errors.push("price must be a number >= 0");
  return errors;
}

export function isBook(value: unknown): value is Book {
  return bookViolations(value).length === 0;
}
