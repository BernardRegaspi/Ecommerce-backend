const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

router.get(`/`, async (req, res) => {
  try {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
      res.status(500).json({ success: false });
    }
    res.send(userList);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    res.status(500).json({ success: false, error: error.message });
  }
});

function createUser(req) {
  return new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    street: req.body.street,
    apartment: req.body.apartment,
    zip: req.body.zip,
    city: req.body.city,
    country: req.body.country,
  });
}

router.post('/', async (req, res) => {
  let user = await createUser(req).save();

  if (!user) return res.status(400).send('the user cannot be created!');

  res.send(user);
});

router.put('/:id', async (req, res) => {
  const userExist = await User.findById(req.params.id);
  let newPassword;
  if (req.body.password) {
    newPassword = bcrypt.hashSync(req.body.password, 10);
  } else {
    newPassword = userExist.passwordHash;
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      email: req.body.email,
      passwordHash: newPassword,
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    },
    { new: true }
  );

  if (!user) return res.status(400).send('the user cannot be created!');

  res.send(user);
});

router.post('/login', async (req, res) => {
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
});

router.post('/register', async (req, res) => {
  let user = await createUser(req).save();

  if (!user) return res.status(400).send('the user cannot be created!');

  res.send(user);
});

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments();

  if (!userCount) {
    res.status(500).json({ success: false });
  }
  res.send({ userCount: userCount });
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

module.exports = router;

module.exports = router;
