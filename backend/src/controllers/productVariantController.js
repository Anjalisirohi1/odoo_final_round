const productVariantService = require('../services/productvariantService');

const getVariantsByProductId = async (req, res) => {
  try {
    const { productId } = req.params;

    const variants =
      await productVariantService.getVariantsByProductId(productId);

    res.status(200).json({
      success: true,
      count: variants.length,
      data: variants
    });
  } catch (error) {
    console.error('Get product variants error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch product variants'
    });
  }
};

module.exports = {
  getVariantsByProductId
};