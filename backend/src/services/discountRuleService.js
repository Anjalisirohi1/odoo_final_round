const discountRuleModel = require('../models/discountRuleModel');

const getAllDiscountRules = async () => {
  return await discountRuleModel.getAllDiscountRules();
};

const getDiscountRule = async (tierId, categoryId) => {
  return await discountRuleModel.getDiscountRule(tierId, categoryId);
};

const getGovernanceMatrix = async () => {
  return await discountRuleModel.getGovernanceMatrix();
};

const saveGovernanceMatrix = async (matrixData) => {
  return await discountRuleModel.saveGovernanceMatrix(matrixData);
};

module.exports = {
  getAllDiscountRules,
  getDiscountRule,
  getGovernanceMatrix,
  saveGovernanceMatrix
};
