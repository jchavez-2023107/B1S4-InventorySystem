//Gestionar un perfil existente de usuario
import User from "../user/user.model.js";
import { hash, verify } from "argon2";
import { encrypt, checkPassword } from "../../utils/encrypt.js";
/** 
 * @desc Obtener todos los usuarios
 * @route GET /api/users
 */
/* export const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); // Excluye la contraseña por seguridad
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error });
    }
}; */
export const getUsers = async(req,res)=>{
    try{
        //Configuraciones de paginación.
        //5 personas por cada página.
        const {limit = 5, skip = 0} = req.query
        //Consultar
        const users=await User.find()
            .skip(skip)
            .limit(limit)

        if(users.length==0){
            return res.status(404).send(
                {
                    success: false,
                    message: 'Users not found'
                }
            )
        }
        return res.send(
            {
                success: true,
                message: 'Users found:', 
                users})
            
    }catch(err){
        console.error(err)
        return res.status(500).send({message: 'General error',err})
    }
}

/** 
 * @desc Obtener un usuario por ID
 * @route GET /api/users/:id
 */
/* export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user", error });
    }
}; */
export const getUserById = async(req, res)=>{
    try {
        //obtener el id del Producto a mostrar
        let id = req.params.id
        let user = await User.findById(id)

        if(!user) return res.status(404).send(
            {
                success: true,
                message: 'User not found'
            }
        )
        return res.send(
            {
                success: true,
                message: 'User found: ', 
                user
            }
        )
    } catch (err) {
        console.error('General error', err)
        return res.status(500).send({message: 'General error', err})
    }
}

/** 
 * @desc Crear un nuevo usuario
 * @route POST /api/users
 */
export const createUser = async (req, res) => {
    try {
        const { name, surname, username, email, password, phone, role } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        // Encriptar la contraseña antes de guardarla
        const hashedPassword = await hash(password, 10);

        // Crear el nuevo usuario
        const newUser = new User({
            name,
            surname,
            username,
            email,
            password: hashedPassword,
            phone,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error("❌ Error creating user:", error);
        res.status(500).json({ message: "Error creating user", error });
    }
};

/** 
 * @desc Actualizar un usuario
 * @route PUT /api/users/:id
 */
export const updateUser = async (req, res) => {
    try {
        // Si se proporciona una contraseña nueva, la encriptamos
        if (req.body.password) {
            req.body.password = await hash(req.body.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).select("-password");

        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
};

/**
 * @desc Actualizar la contraseña de un usuario
 * @route PUT /api/users/:id/password
 * @access Private (Requiere autenticación)
 */
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.params.id; // ID del usuario que cambia su contraseña

        // Validar que los campos estén presentes
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current and new password are required" });
        }

        // Buscar el usuario por ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verificar que la contraseña actual sea correcta
        const isMatch = await verify(user.password, currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Encriptar la nueva contraseña y actualizar al usuario
        const hashedPassword = await hash(newPassword);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Error updating password", error: err.message });
    }
};

/** 
 * @desc Eliminar un usuario
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
};
