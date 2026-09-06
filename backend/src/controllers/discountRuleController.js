const discountRuleService = require('../services/discountRuleService');

const getDiscountRules = async (req, res) => {
  try {
    const rules = await discountRuleService.getAllDiscountRules();

    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules
    });
  } catch (error) {
    console.error('Get discount rules error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch discount rules'
    });
  }
};

const checkDiscountRule = async (req, res) => {
  try {
    const { tierId, categoryId } = req.query;

    if (!tierId || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'tierId and categoryId are required'
      });
    }

    const rule = await discountRuleService.getDiscountRule(
      tierId,
      categoryId
    );

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'No discount rule found for this tier and category'
      });
    }

    res.status(200).json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Check discount rule error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to check discount rule'
    });
  }
};

const getGovernanceMatrix = async (req, res) => {
  try {
    const data = await discountRuleService.getGovernanceMatrix();
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Get governance matrix error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch governance matrix'
    });
  }
};

const saveGovernanceMatrix = async (req, res) => {
  try {
    const updated = await discountRuleService.saveGovernanceMatrix(req.body);
    res.status(200).json({
      success: true,
      message: 'Discount Tiers & Approval Chain governance matrix saved successfully!',
      data: updated
    });
  } catch (error) {
    console.error('Save governance matrix error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save governance matrix'
    });
  }
};

module.exports = {
  getDiscountRules,
  checkDiscountRule,
  getGovernanceMatrix,
  saveGovernanceMatrix
};
