const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

// Get all categories
router.get(`/`, async (req, res) => {
  try {
    const categoryList = await Category.find();
    res.status(200).send(categoryList);
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(500).json({ message: 'The category with the given ID was not found.' });
    }
    res.status(200).send(category);
  } catch (error) {
    res.status(500).json({ message: 'The category with the given ID was not found.' });
  }
});

// Update category
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
      res.status(404).send('The category cannot be updated!');
    }
    res.send(category);
  } catch (error) {
    res.status(500).json({ message: 'The category with the given ID was not found.' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    let category = new Category({
      name: req.body.name,
      icon: req.body.icon,
      color: req.body.color,
    });
    category = await category.save();

    if (!category) {
      res.status(404).send('The category cannot be created!');
    }
    res.send(category);
  } catch (error) {
    res.status(500).json({ message: 'The category with the given ID was not found.' });
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findByIdAndRemove(req.params.id);
    if (category) {
      res.status(200).json({ success: true, message: 'The category is deleted!' });
    } else {
      res.status(404).json({ success: false, message: 'Category not found!' });
    }
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
});

module.exports = router;
