import { describe, expect, it } from "vitest";
import { request } from "../../setupFiles";

console.log("Current Database URL:", process.env.DATABASE_URL);

describe("create category", async () => {
  it("should be able to create category successfully", async () => {
    const category = {
      name: "Example",
    };

    console.log("Sending POST request for creating category");
    
    const response = await request.post("/categories").send(category);

    console.log("Response body:", response.body);

    const expectedBody = {
      id: expect.any(Number),
      name: category.name,
    };

    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toBe(201);
  });

  it("should return an error when creating a category with empty body", async () => {
    const response = await request.post("/categories").send({});

    const expectedBody = {
      errors: [
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["name"],
          message: "Required",
        },
      ],
    };

    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toBe(400);
  });

  it("should return an error when creating a category with invalid name type", async () => {
    const invalidDataCategory = {
      name: 123,
    };
    const response = await request
      .post("/categories")
      .send(invalidDataCategory);

    const expectedBody = {
      errors: [
        {
          code: "invalid_type",
          expected: "string",
          received: "number",
          path: ["name"],
          message: "Expected string, received number",
        },
      ],
    };

    expect(response.body).toEqual(expectedBody);
    expect(response.statusCode).toBe(400);
  });
});
