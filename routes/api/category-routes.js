// The `/api/categories` endpoint

const router = require('express').Router();
const { Category, Product } = require('../../models');

// GET ALL CATEGORIES ROUTE
// This works!
router.get('/', async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      include: [{model:Product}]
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// FIND CATEGORY BY ID ROUTE
// This works!!
router.get('/:id', async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{model:Product}],
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with that id!'});
      return;
    }
    
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE CATEGORY ROUTE
// This works!!!
router.post('/', async (req, res) => {
  try {
    const categoryData = await Category.create(req.body);
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(400).json(err);
  }
});

// UPDATE CATEGORY ROUTE
router.put('/:id', async (req, res) => {

  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        Product.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {

          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);

          return Promise.all([
            Product.destroy({ where: { id: productTagsToRemove } }),
            Product.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);

    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// DELETE CATEGORY ROUTE
// This works!!!
router.delete('/:id', async (req, res) => {
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!categoryData) {
      res.status(404).json({ message: 'No category found with that id!'});
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
