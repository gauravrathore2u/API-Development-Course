const expess = require('express');
// const {getUser, createUser, singleUser, updateUser, deleteUser, checkId, checkBody} = require('../controller/userController');
const {getUser, createUser, singleUser, updateUser, deleteUser, userStats, userSignUp, userLogin} = require('../controller/userController');

const router = expess.Router();

// router.param("id", checkId);

// router.route('/').get(getUser).post(checkBody, createUser);

//signup route
router.route('/signup').post(userSignUp);
router.route('/login').post(userLogin);


//stats route
router.route('/userstats').get(userStats);


router.route('/').get(getUser).post(createUser);
router.route('/:id').get(singleUser).patch(updateUser).delete(deleteUser);




module.exports = router;
