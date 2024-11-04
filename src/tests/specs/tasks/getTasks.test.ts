import { beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../../database/prisma";
import { request } from "../../setupFiles";
import { Prisma, Category, Task } from "@prisma/client";
import { generateAuthentication, generateInvalidToken } from "../../utils/generateAuthentication";
import { category } from "../../mocks/category.mocks";
import { getTaskList, task } from "../../mocks/tasks.mocks";
import { secondUserMock } from "../../mocks/user.mocks";
import { taskDefaultExpects } from "../../utils/taskDefaultExpects";
import { categoryDefaultExpects } from "../../utils/categoryDefaultExpects";

// describe("get tasks", () => {
//   let taskDataList: Prisma.TaskCreateManyInput[];
//   let createdCategory: Category;
//   let createdTasks: Task[];

//   beforeEach(async () => {
//     createdCategory = await prisma.category.create({
//       data: { name: "Example" },
//     });

//     taskDataList = [
//       {
//         title: "Lorem ipsum",
//         content: "Lorem ipsum",
//       },
//       {
//         title: "Lorem ipsum",
//         content: "Lorem ipsum",
//         categoryId: createdCategory?.id,
//       },
//     ];

//     await prisma.task.createMany({ data: taskDataList });
//     createdTasks = await prisma.task.findMany();
//   });

//   it("should be able to list all tasks successfully", async () => {
//     const response = await request.get("/tasks");

//     const expectedBody = [
//       {
//         id: createdTasks[0].id,
//         title: taskDataList[0].title,
//         content: taskDataList[0].content,
//         finished: false,
//         category: null,
//       },
//       {
//         id: createdTasks[1].id,
//         title: taskDataList[1].title,
//         content: taskDataList[1].content,
//         finished: false,
//         category: { id: createdCategory?.id, name: createdCategory?.name },
//       },
//     ];

//     expect(response.body).toEqual(expectedBody);
//     expect(response.statusCode).toBe(200);
//   });

//   it("should be able to get tasks from specific category name query param", async () => {
//     const response = await request.get(
//       `/tasks?category=${createdCategory?.name}`
//     );

//     const expectedBody = [
//       {
//         id: createdTasks[1].id,
//         title: taskDataList[1].title,
//         content: taskDataList[1].content,
//         finished: false,
//         category: { id: createdCategory?.id, name: createdCategory?.name },
//       },
//     ];

//     expect(response.body).toEqual(expectedBody);
//     expect(response.statusCode).toBe(200);
//   });

//   it("should be able to get a single task by id", async () => {
//     const response = await request.get(`/tasks/${createdTasks[1].id}`);

//     const expectedBody = {
//       id: createdTasks[1].id,
//       title: taskDataList[1].title,
//       content: taskDataList[1].content,
//       finished: false,
//       category: { id: createdCategory?.id, name: createdCategory?.name },
//     };

//     expect(response.body).toEqual(expectedBody);
//     expect(response.statusCode).toBe(200);
//   });

//   it("should return an error getting a task with non existing id", async () => {
//     const response = await request.get("/tasks/99999");

//     const expectedBody = {
//       message: "Task not found",
//     };

//     expect(response.body).toEqual(expectedBody);
//     expect(response.statusCode).toBe(404);
//   });
// });


const getTasksBeforeEach = async () => {
    const { user: user1, token: token1 } = await generateAuthentication();

    await prisma.category.create({ data: category(user1.id) })

    const taskList = await getTaskList(user1.id);

    await prisma.task.createMany({ data: taskList });

    const { user: user2, token: token2 } = await generateAuthentication(secondUserMock);

    await prisma.task.create({ data: { ...task, userId: user2.id } });

    return { user: user1, token: token1, secondUser: user2, secondToken: user2 };
};

describe("get tasks", () => {
    it("should be able to get tasks successfully", async () => {
        const { user, token } = await getTasksBeforeEach();

        const data = await request
            .get("/tasks")
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .then((response) => response.body);

        expect(data).toHaveLength(2);

        taskDefaultExpects(data[0], user.id);

        categoryDefaultExpects(data[1].category);
    });

    it("should be able to get tasks from specific category", async () => {
        const { user, token } = await getTasksBeforeEach();

        const getCategory = await prisma.category.findFirst();

        const data = await request
            .get(`/tasks?category=${getCategory?.name}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .then((response) => response.body);

        expect(data).toHaveLength(1);

        taskDefaultExpects(data[0], user.id);

        categoryDefaultExpects(data[0].category);
    });

    it("should throw error when trying to get tasks from a category of a different user", async () => {
        const { secondToken } = await getTasksBeforeEach();

        const getCategory = await prisma.category.findFirst();

        await request
            .get(`/tasks?category=${getCategory?.id}`)
            .set("Authorization", `Bearer ${secondToken}`)
            .expect(401)
            .then((response) => response.body);
    });

    it("should throw error when there is no token", async () => {
        await request.get("/tasks").expect(401);
    });

    it("should be able to get a single task by id correctly", async ()  => {
        const { user, token } = await getTasksBeforeEach();

        const tasks = await prisma.task.findMany();

        const data = await request
            .get(`/tasks/${tasks[1].id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(200)
            .then((response) => response.body)

        taskDefaultExpects(data, user.id);

        categoryDefaultExpects(data.category);
    });

    it("should throw error when trying to get a task with an invalid id", async () => {
        const { token } = await getTasksBeforeEach();

        const tasks = await prisma.task.findMany();

        const id = tasks[2].id + 1

        await request
            .get(`/tasks/${id}`)
            .set("Authorization", `Bearer ${token}`)
            .expect(404);
    });

    it("should not be able to get a task from a different user", async () => {
        const { secondToken } = await getTasksBeforeEach();

        const tasks = await prisma.task.findMany();

        await request
            .get(`/tasks/${tasks[0].id}`)
            .set("Authorization", `Bearer ${secondToken}`)
            .expect(401);
    })

    it("should throw error when there is no token", async () => {
        await request.get("/tasks/1").expect(401);
        
    });

    it("should throw error when the token is invalid", async () => {
        const token = generateInvalidToken();

        await request
            .get("/tasks/1")
            .set("Authorization", `Bearer ${token}`)
            .expect(401)
    })
})