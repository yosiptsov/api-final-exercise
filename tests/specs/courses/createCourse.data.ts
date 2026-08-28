import { faker } from "@faker-js/faker";

export const courseWithIncorrectTitle = [
  {
    description: "if the title is missing",
    payload: {},
  },
  {
    description: "if the title is less than 3 characters",
    payload: { title: "Ab" },
  },
  {
    description: "if the title is <3 chars after trim",
    payload: { title: " a " },
  },
  {
    description: "if the title is only whitespace",
    payload: { title: "   " },
  },
  {
    description: "if the title is not a string",
    payload: { title: true },
  },
];
