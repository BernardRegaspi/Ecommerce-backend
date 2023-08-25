const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

router.get('/', async (req, res) => {
  try {
    const userList = await User.find().select('-passwordHash');
    if (!userList) {
      res.status(500).json({ success: false });
    }
    res.send(userList);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      res
        .status(404)
        .json({ message: 'The user with the given ID was not found.' });
    }
    res.status(200).send(user);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await createUser(req.body);
    if (!user) return res.status(400).send('the user cannot be created!');
    res.send(user);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, password, phone, isAdmin, street, apartment, zip, city, country } = req.body;
    if (!name || !email || !phone || !street || !zip || !city || !country) {
      return res.status(400).send('Missing required fields');
    }
    const userExist = await User.findById(req.params.id);
    const newPassword = password ? bcrypt.hashSync(password, 10) : userExist.passwordHash;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        passwordHash: newPassword,
        phone,
        isAdmin,
        street,
        apartment,
        zip,
        city,
        country,
      },
      { new: true }
    );
    if (!user) return res.status(400).send('the user cannot be created!');
    res.send(user);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(400).send('The user not found');
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.status(200).send({ user: user.email, token: token });
    } else {
      res.status(400).send('The password is incorrect');
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const user = await createUser(req.body);
    if (!user) return res.status(400).send('the user cannot be created!');
    res.send(user);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

router.get('/get/count', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (!userCount) {
      res.status(500).json({ success: false });
    }
    res.send({ userCount: userCount });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while processing your request.' });
  }
});

router.delete('/:id', (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send('Invalid User ID');
  }
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: 'the user is deleted!' });
      } else {
        return res
          .status(404)
          .json({ success: false, message: 'user not found!' });
      }
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

const createUser = async (userData) => {
  let user = new User({
    name: userData.name,
    email: userData.email,
    passwordHash: bcrypt.hashSync(userData.password, 10),
    phone: userData.phone,
    isAdmin: userData.isAdmin,
    street: userData.street,
    apartment: userData.apartment,
    zip: userData.zip,
    city: userData.city,
    country: userData.country,
  });
  return await user.save();
};

module.exports = router;
