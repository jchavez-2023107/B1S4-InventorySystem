//Importar el modelo de animales
import Animal from "./animal.model.js";
import User from "../user/user.model.js";

/**
 * @desc Obtener todos los animales
 * @route GET /api/animals
 */
export const getAnimals = async (req, res) => {
  try {
    const animals = await Animal.find().populate(
      "keeper",
      "name username email"
    ); // Trae el usuario responsable
    res.status(200).json(animals);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving animals", error });
  }
};

/**
 * @desc Obtener un animal por ID
 * @route GET /api/animals/:id
 */
export const getAnimalById = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id).populate(
      "keeper",
      "name username email"
    );
    if (!animal) return res.status(404).json({ message: "Animal not found" });
    res.status(200).json(animal);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving animal", error });
  }
};

/**
 * @desc Crear un nuevo animal
 * @route POST /api/animals
 */
export const createAnimal = async (req, res) => {
  try {
    const { name, description, age, type, keeper } = req.body;

    // Validar que el keeper exista en la base de datos antes de crear el animal
    const existingKeeper = await User.findById(keeper);
    if (!existingKeeper) {
      return res.status(404).json({ message: "Keeper not found" });
    }

    const newAnimal = new Animal({ name, description, age, type, keeper });
    await newAnimal.save();
    res.status(201).json({ message: "Animal created succesfully", newAnimal });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating animal", error });
  }
};

/**
 * @desc Actualizar un animal
 * @route PUT /api/animals/:id
 */
export const updateAnimal = async (req, res) => {
  try {
    //Extraemos solo los campos permitidos y no tomamos en cuenta primary ni foreign.
    const { name, description, age, keeper } = req.body;
    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;
    if (age !== undefined) updateFields.age = age;

    // Verificar si el keeper (usuario) existe antes de agregar
    if (keeper !== undefined) {
      const existingKeeper = await User.findById(keeper);
      if (!existingKeeper) {
        return res.status(404).json({ message: "Keeper not found" });
      }
      updateFields.keeper = keeper;
    }

    //Si no hay campos validos para actualizar, entonces devolvemos un error
    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update :|" });
    }

    // Buscamos y actualizamos el documento con los campos permitidos
    const updatedAnimal = await Animal.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedAnimal)
      return res.status(404).json({ message: "Animal not found" });
    res.status(200).json(updatedAnimal);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating animal", error });
  }
};

/**
 * @desc Eliminar un animal
 * @route DELETE /api/animals/:id
 */
export const deleteAnimal = async (req, res) => {
  try {
    const deletedAnimal = await Animal.findByIdAndDelete(req.params.id);
    if (!deletedAnimal)
      return res.status(404).json({ message: "Animal not found" });
    res.status(200).json({ message: "Animal deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting animal", error });
  }
};
