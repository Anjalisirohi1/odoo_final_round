const quotationService = require('../services/quotationService');

const createQuotation = async (req, res) => {
  try {
    const result = await quotationService.createQuotation(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Quotation created successfully',
      data: result
    });

  } catch (error) {
    console.error('Create quotation error:', error);

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getQuotations = async (req, res) => {
  try {
    const quotations = await quotationService.getAllQuotations();
    res.status(200).json({
      success: true,
      count: quotations.length,
      data: quotations
    });
  } catch (error) {
    console.error('Get quotations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quotations'
    });
  }
};

const evaluateQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const evaluation = await quotationService.evaluateQuotation(id);
    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('Evaluate quotation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const submitQuotation = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await quotationService.submitQuotation(id, userId);
    res.status(200).json({
      success: true,
      message: 'Quotation submitted successfully',
      data: result
    });
  } catch (error) {
    console.error('Submit quotation error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createQuotation,
  getQuotations,
  evaluateQuotation,
  submitQuotation
};
