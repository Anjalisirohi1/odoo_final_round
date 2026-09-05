const priceListModel = require('../models/priceListModel');

const getAllPriceLists = async () => {
  return await priceListModel.getAllPriceLists();
};

const getPriceListItems = async (priceListId) => {
  return await priceListModel.getPriceListItems(priceListId);
};

module.exports = {
  getAllPriceLists,
  getPriceListItems
};