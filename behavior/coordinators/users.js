import { post } from '../api/rest'
import { toggleFlashNotification } from '../../store/ui/action'

export const CreateUser = (dispatch) => async ({ firstName, lastName, email, password }) => {
    try {
        await post("/users", { firstName, lastName, email, password })
    }
    catch( error ) {
        console.log('err', error.response.data?.message)
        dispatch(toggleFlashNotification({
            on: true,
            alertType: 'fail',
            message: error.response.data?.message || '',
        }))
    }
    return true
}

export const SignIn = async ({ email, password }) => {
    return await post("/users/sign_in", { email, password })
}