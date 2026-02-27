const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors
        });
      }

      req.body = value;
      next();
    } catch (err) {
      console.error('[Validate Error]', err.message);
      return res.status(500).json({
        success: false,
        message: 'Validation middleware error',
        error: err.message
      });
    }
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    full_name: Joi.string().min(2).required(),
    phone: Joi.string().optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // createProduct: Joi.object({
  //   name: Joi.string().required(),
  //   description: Joi.string().optional(),
  //   price: Joi.number().positive().required(),
  //   stock: Joi.number().integer().min(0).required(),
  //   category: Joi.string().optional()
  // }),

  // updateProduct: Joi.object({
  //   name: Joi.string().optional(),
  //   description: Joi.string().optional(),
  //   price: Joi.number().positive().optional(),
  //   stock: Joi.number().integer().min(0).optional(),
  //   category: Joi.string().optional()
  // }),

  // createOrder: Joi.object({
  //   items: Joi.array().items(
  //     Joi.object({
  //       productId: Joi.string().required(),
  //       quantity: Joi.number().integer().min(1).required(),
  //       price: Joi.number().positive().required()
  //     })
  //   ).min(1).required(),
  //   shippingAddress: Joi.string().required()
  // }),

  // createPayment: Joi.object({
  //   orderId: Joi.string().required(),
  //   amount: Joi.number().positive().required(),
  //   paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'bank_transfer').required()
  // })
};

module.exports = { validate, schemas };

