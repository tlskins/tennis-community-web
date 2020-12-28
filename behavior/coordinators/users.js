import { post } from '../api/rest'

export const CreateUser = async ({ firstName, lastName, email, password }) => {
    return await post("/users", { firstName, lastName, email, password })
}

export const SignIn = async ({ email, password }) => {
    return await post("/users/sign_in", { email, password })
}