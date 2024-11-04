import { beforeEach, describe, it, expect } from "vitest";
import { prisma } from "../../../database/prisma";
import { request } from "../../setupFiles";
import { task } from "../../mocks/tasks.mocks";
import { generateAuthentication, generateInvalidToken } from "../../utils/generateAuthentication";
import { secondUserMock } from "../../mocks/user.mocks";

// describe("delete task", () => {
//   beforeEach(async () => {
//     const task = {
//       title: "Lorem ipsum",
//       content: "Lorem ipsum",
//     };
//     await prisma.task.create({ data: task });
//   });

//   it("should be able to delete a task successfully", async () => {
//     const task = await prisma.task.findFirst();
//     await request.delete(`/tasks/${task?.id}`).expect(204);
//   });

//   it("should return an error when deleting a task with non existing id", async () => {
//     const response = await request.delete(`/tasks/99999`);

//     const expectedBody = {
//       message: "Task not found",
//     };

//     expect(response.body).toEqual(expectedBody);
//     expect(response.statusCode).toBe(404);
//   });
// });


const deleteTaskBeforeEach = async () => {
  const { user: user1, token: token1 } = await generateAuthentication();

  const deleteTask = await prisma.task.create({
    data: { ...task, userId: user1.id },
  });

  const { token: token2 } = await generateAuthentication(secondUserMock);

  return { token: token1, secondToken: token2, deleteTask };
};

describe("delete task", () => {
  it("should be able to delete task succesfully", async () => {
    const { token, deleteTask } = await deleteTaskBeforeEach();

    await request
      .delete(`/tasks/${deleteTask?.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
  });

  it("should throw error when trying to delete a invalid task", async () => {
    const { token, deleteTask } = await deleteTaskBeforeEach();

    const id = (deleteTask?.id as number) + 1;

    await request
      .delete(`/tasks/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(404);
  })

  it("should throw error when trying to delete a task from a different user", async () => {
    const { secondToken, deleteTask } = await deleteTaskBeforeEach();

    await request
      .delete(`/tasks/${deleteTask?.id}`)
      .set("Authorization", `Bearer ${secondToken}`)
      .expect(403);
  });

  it("should throw error when there is no token", async () => {
    await request.delete("/tasks/1").expect(401);
  })

  it("should throw error when the token is invalid", async () => {
    const token = generateInvalidToken();

    await request
      .delete("/tasks/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);
  })
})