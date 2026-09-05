const priceListService = require('../services/priceListService');

const getPriceLists = async (req, res) => {
  try {
    const priceLists = await priceListService.getAllPriceLists();

    res.status(200).json({
      success: true,
      count: priceLists.length,
      data: priceLists
    });
  } catch (error) {
    console.error('Get price lists error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch price lists'
    });
  }
};

const getPriceListItems = async (req, res) => {
  try {
    const { priceListId } = req.params;

    const items = await priceListService.getPriceListItems(priceListId);

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('Get price list items error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch price list items'
    });
  }
};

module.exports = {
  getPriceLists,
  getPriceListItems
};