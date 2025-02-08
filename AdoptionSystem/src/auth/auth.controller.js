//Gestionar lógica de autenticación
import User from '../user/user.model.js'
import { encrypt, checkPassword } from '../../utils/encrypt.js'
import { generateJwt } from '../../utils/jwt.js'

export const test = (req, res)=>{
    console.log('Test is running')
    res.send({message: 'Test is running'})
}

//Registrar
export const register = async(req, res)=>{
    try {
        //Capturar los datos
        let data = req.body
        //Crear el objeto del modelo agregándole los datos capturados
        let user = new User(data)
        //Encriptar la password(2)
        user.password = await encrypt(user.password)
        //Asignar rol por defecto
        user.role = 'CLIENT'
        //Asignar profilePicture
        user.profilePicture = req.file.filename ?? null //Nullish si es verdadero lo de la izquierda pone ese valor, sino el de la izquierda
        //Guardar
        await user.save()
        //Responder al usuario
        return res.send({message: `Registered succesfully, can be logged with username: ${user.username}`})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'General error with user registration', err})
    }
}

//Login
export const login = async(req, res)=>{
    try {
        //Capturar los datos (body)
        let {userLoggin, password} = req.body
        //Validar que el usuario exista
            //Buscar el usuario.
        let user = await User.findOne(
            {
                $or: [ //Subfunción OR | se espera un [] de búsquedas
                    {email: userLoggin},
                    {username: userLoggin}
                ]
            }
        ) //{username} = {username}
        //Verificar que la contraseña coincida
        if(user && await checkPassword(user.password, password)){
            //MÁS ADELANTE : Generar el token (Clave de acceso)
            let loggedUser = {
                uid: user._id,
                username: user.username,
                name: user.name,
                role: user.role
            }
            let token = await generateJwt(loggedUser)
            return res.send(
                {
                    message: `Welcome ${user.name}`,
                    loggedUser, 
                    token
                })
        } 
        //Responder al usuario
        return res.status(400).send({message: 'Invalid credentials'})
    } catch (err) {
        console.error(err)
        return res.status(500).send({message: 'General error with login function', err})
    }
}