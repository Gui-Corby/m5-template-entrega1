import { hash } from "bcrypt"
import { userMock } from "../../mocks/user.mocks"
import { describe, expect, it } from "vitest";
import { prisma } from "../../../database/prisma";
import { request } from "../../setupFiles"
import { userDefaultExpects } from "../../utils/userDefaultExpects";


const loginUserBeforeEach = async () => {
    const password = await hash(userMock.password, 10);
    const registerUser = await prisma.user.create({
        data: { ...userMock, password },
    });

    return { registerUser };
};

describe("login user", () => {
    it("should be able to login correctly", async () => {
        const { registerUser } = await loginUserBeforeEach();

        const credentials = {
            email: registerUser.email,
            password: "1234",
        };

        const data = await request
            .post("/users/login")
            .send(credentials)
            .expect(200)
            .then((response) => response.body);

        expect(data).toBeDefined();
        expect(data).toBeTypeOf("object")

        expect(data.accessToken).toBeDefined();
        expect(data).toBeTypeOf("object");

        expect(data.accessToken).toBeDefined();
        expect(data.accessToken).toBeTypeOf("string")

        userDefaultExpects(data.user);
    });

    it("should throw error when password is wrong", async () => {
        const { registerUser } = await loginUserBeforeEach();

        const credentials = {
            email: registerUser.email,
            password: "wrongpassword"
        }


        await request.post("/users/login").send(credentials).expect(401);
    });

    it("should throw error when user not found", async () => {
        const credentials = {
            email: "invalid@email.com",
            password: "wrongpassword",
        };

        await request.post("/users/login").send(credentials).expect(404);
    })

})