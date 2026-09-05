const discountRuleModel = require('../models/discountRuleModel');

const getAllDiscountRules = async () => {
  return await discountRuleModel.getAllDiscountRules();
};

const getDiscountRule = async (tierId, categoryId) => {
  return await discountRuleModel.getDiscountRule(tierId, categoryId);
};

module.exports = {
  getAllDiscountRules,
  getDiscountRule
};
