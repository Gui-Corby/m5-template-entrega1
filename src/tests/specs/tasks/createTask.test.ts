import { describe, it, expect } from "vitest";
import { request } from "../../setupFiles";
import { generateAuthentication, generateInvalidToken } from "../../utils/generateAuthentication";
import { invalidDataTask, task } from "../../mocks/tasks.mocks";
import { taskDefaultExpects } from "../../utils/taskDefaultExpects";

// describe("create task", () => {
//   it("should be able to create a task without category successfully", async () => {
//     const task = {
//       title: "Lorem ipsum",
//       content: "Lorem ipsum",
//     };

//     const response = await request.post("/tasks").send(task);

//     const expectedBody = {
//       id: expect.any(Number),
//       title: task.title,
//       content: task.content,
//       finished: false,
//       categoryId: null,
//     };

//     expect(response.body).toEqual(expectedBody);
//     expect(response.statusCode).toBe(201);
//   });

//   it("should return an error when creating a task in a non existing category id", async () => {
//     const taskWithInvalidCategory = {
//       title: "Lorem ipsum",
//       content: "Lorem ipsum",
//       categoryId: 1,
//     };

//     const response = await request.post("/tasks").send(taskWithInvalidCategory);

//     const expectedBody = {
//       message: "Category not found",
//     };

//     expect(response.body).toEqual(expectedBody);
//     expect(response.statusCode).toBe(404);
//   });

//   it("should return an error when creating a task with empty body", async () => {
//     const response = await request.post("/tasks").send({});

//     const expectedBody = {
//       errors: [
//         {
//           code: "invalid_type",
//           expected: "string",
//           received: "undefined",
//           path: ["title"],
//           message: "Required",
//         },
//         {
//           code: "invalid_type",
//           expected: "string",
//           received: "undefined",
//           path: ["content"],
//           message: "Required",
//         },
//       ],
//     };

//     expect(response.body).toEqual(expectedBody);
//     expect(response.statusCode).toBe(400);
//   });

//   it("should return an error when creating a task with invalid data types", async () => {
//     const invalidDataTask = {
//       title: 123,
//       content: 123,
//     };

//     const response = await request
//       .post("/tasks")
//       .send(invalidDataTask)
//       .expect(400);

//     const expectedBody = {
//       errors: [
//         {
//           code: "invalid_type",
//           expected: "string",
//           received: "number",
//           path: ["title"],
//           message: "Expected string, received number",
//         },
//         {
//           code: "invalid_type",
//           expected: "string",
//           received: "number",
//           path: ["content"],
//           message: "Expected string, received number",
//         },
//       ],
//     };

//     expect(response.body).toEqual(expectedBody);
//     expect(response.statusCode).toBe(400);
//   });
// });

describe("create task", () => {
  it("should be able to create task sucessfully", async () => {
    const {user, token} = await generateAuthentication();

    const data = await request
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(task)
      .expect(201)
      .then((response) => response.body);

    taskDefaultExpects(data, user.id);
  });

  it("should throw error when trying to create a task in a invalid category", async () => {
    const { token } = await generateAuthentication();

    await request
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);
  });

  it("should throw error when trying to create a task with invalid data types", async () => {
    const { token } = await generateAuthentication();

    await request
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send(invalidDataTask)
      .expect(400);
  });

  it("should throw error when there is no token", async () => {
    await request.post("/tasks").expect(401);
  });

  it("should throw error when the token is invalid", async () => {
    const token = generateInvalidToken();

    await request
      .post("/tasks")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
  })
})