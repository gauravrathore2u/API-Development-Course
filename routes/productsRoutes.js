const expess = require('express');
const {getProducts, createProduct, singleProduct, updateProduct, deleteProduct} = require('../controller/productsController')

const router = expess.Router();

router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(singleProduct).patch(updateProduct).delete(deleteProduct);


module.exports = router;