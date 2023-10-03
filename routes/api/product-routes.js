// The `/api/products` endpoint

const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// GET ALL PRODUCTS ROUTE
// This works!!!
router.get('/', async (req, res) => {
  try {
    const productData = await Product.findAll({
      include: {
        all: true
      },
    });
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// FIND PRODUCT BY ID
// This works!!!
router.get('/:id', async (req, res) => {
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: {
        all: true
      },
    });

    if (!productData) {
      res.status(404).json({ message: 'No tag found with that id!'});
      return;
    }
    
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// NEW PRODUCT ROUTE
// Route works!! Tags aren't applying though
router.post('/', (req, res) => {

  /* req.body should look like this...
{
	"product_name": "Blue Basketball",
  "price": 200.99,
  "stock": 3,
  "category_id": 2,
	"tags": [3]
}
  */

  Product.create(req.body)
    .then((product) => {

      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      
      if (req.body.tagIds) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }

      // if no product tags, just respond

      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// UPDATE PRODUCT ROUTE
router.put('/:id', (req, res) => {

  // update product data

  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {

          // create filtered list of new tag_ids

          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove

          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);

                  // run both actions

          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
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


// PRODUCT DELETE ROUTE
// This works!!!
router.delete('/:id', async (req, res) => {
  try {
    const productData = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with that id!'});
      return;
    }
    res.status(200).json(productData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
