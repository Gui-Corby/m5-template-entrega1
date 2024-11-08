import { beforeEach, describe, it, expect } from "vitest";
import { prisma } from "../../../database/prisma";
import { request } from "../../setupFiles";
import { task } from "../../mocks/tasks.mocks";
import { generateAuthentication, generateInvalidToken } from "../../utils/generateAuthentication";
import { secondUserMock } from "../../mocks/user.mocks";


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