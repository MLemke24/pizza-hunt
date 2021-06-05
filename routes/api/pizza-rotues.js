const router = require('express').Router();

const {
    getAllPizza,
    getPizzaById,
    createPizza,
    updatePizza,
    deletePizza
} = require('../../controllers/pizza-controller')

// Set up Get all and Post routes api/pizzas
router
.route('/')
.get(getAllPizza)
.post(createPizza);

router
.route('/:id')
.get(getPizzaById)
.put(updatePizza)
.delete(deletePizza);

module.exports = router;