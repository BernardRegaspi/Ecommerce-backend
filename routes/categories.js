const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) => {
  try {
    const categoryList = await Category.find();
    res.status(200).send(categoryList);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res
        .status(500)
        .json({ message: 'The category with the given ID was not found.' });
    }
    res.status(200).send(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'The category with the given ID was not found.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
      },
      { new: true }
    );

    if (!category) {
      res.status(404).send('the category cannot be created!');
    }
    res.send(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'The category with the given ID was not found.' });
  }
});

router.post('/', async (req, res) => {
  try {
    let category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    category = await category.save();

    if (!category) {
      res.status(404).send('the category cannot be created!');
    }
    res.send(category);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'The category with the given ID was not found.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndRemove(req.params.id);
    if (category) {
      res
        .status(200)
        .json({ success: true, message: 'the category is deleted!' });
    } else {
      res.status(404).json({ success: false, message: 'category not found!' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
});

module.exports = router;
