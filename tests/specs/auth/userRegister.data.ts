import { faker } from "@faker-js/faker";

export const userWithMissedFields = [
  {
    description: "missing name",
    payload: { user: { email: faker.internet.email(), password: faker.internet.password({ length: 10 }) + "A1" } },
  },
  {
    description: "missing email",
    payload: { user: { name: faker.person.fullName(), password: faker.internet.password({ length: 10 }) + "A1" } },
  },
  {
    description: "missing password",
    payload: { user: { name: faker.person.fullName(), email: faker.internet.email() } },
  },
  {
    description: "empty user object",
    payload: { user: {} },
  },
  {
    description: "missing user object completely",
    payload: {},
  },
];

export const invalidUserName = [
  {
    description: "name is too short",
    payload: {
      user: { name: "a", email: faker.internet.email(), password: faker.internet.password({ length: 10 }) + "A1" },
    },
  },
  {
    description: "name is an empty string",
    payload: {
      user: { name: "", email: faker.internet.email(), password: faker.internet.password({ length: 10 }) + "A1" },
    },
  },
  {
    description: "name is invalid type (boolean)",
    payload: {
      user: { name: true, email: faker.internet.email(), password: faker.internet.password({ length: 10 }) + "A1" },
    },
  },
  {
    description: "name is invalid type (number)",
    payload: {
      user: { name: 123456, email: faker.internet.email(), password: faker.internet.password({ length: 10 }) + "A1" },
    },
  },
  {
    description: "name is invalid type (array)",
    payload: {
      user: {
        name: ["u", "s", "e", "r"],
        email: faker.internet.email(),
        password: faker.internet.password({ length: 10 }) + "A1",
      },
    },
  },
];

export const invalidUserEmail = [
  {
    description: "email is a plain text (e.g. 'invalidEmail')",
    payload: {
      user: {
        name: faker.person.fullName(),
        email: "invalidEmail",
        password: faker.internet.password({ length: 10 }) + "A1",
      },
    },
  },
  {
    description: "email is without @ (e.g. 'email.example.com')",
    payload: {
      user: {
        name: faker.person.fullName(),
        email: "email.example.com",
        password: faker.internet.password({ length: 10 }) + "A1",
      },
    },
  },
  {
    description: "email is without userName (e.g. '@example.com')",
    payload: {
      user: {
        name: faker.person.fullName(),
        email: "@example.com",
        password: faker.internet.password({ length: 10 }) + "A1",
      },
    },
  },
  {
    description: "email is an empty string",
    payload: {
      user: { name: faker.person.fullName(), email: "", password: faker.internet.password({ length: 10 }) + "A1" },
    },
  },
];

export const invalidPasswordComplexity = [
  {
    description: "password is too short (fewer than 8 characters)",
    payload: {
      user: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "7digits",
      },
    },
  },
  {
    description: "password is missing an uppercase letter",
    payload: {
      user: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "password123",
      },
    },
  },
  {
    description: "password is missing a digit",
    payload: {
      user: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "Password",
      },
    },
  },
  {
    description: "password is an empty string",
    payload: {
      user: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: "Password",
      },
    },
  },
];
