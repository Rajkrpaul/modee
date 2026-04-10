const Joi = require('joi');

const authSchemas = {
  register: {
    body: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          'string.pattern.base':
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        }),
    }),
  },

  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },

  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string().required(),
      password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required(),
    }),
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          'string.pattern.base':
            'Password must contain at least one uppercase letter, one lowercase letter, and one number',
        }),
    }),
  },

  deleteAccount: {
    body: Joi.object({
      password: Joi.string().required(),
    }),
  },
};

const userSchemas = {
  updateProfile: {
    body: Joi.object({
      name: Joi.string().min(2).max(50),
      skills: Joi.array().items(Joi.string()),
    }).min(1),
  },
};

const xpSchemas = {
  addXP: {
    body: Joi.object({
      userId: Joi.string().uuid().required(),
      amount: Joi.number().integer().min(1).max(1000).required(),
      reason: Joi.string().max(100).default('manual'),
    }),
  },
};

const agentSchemas = {
  analyzeResume: {
    body: Joi.object({
      resumeText: Joi.string().min(50).max(10000).required(),
    }),
  },

  recommend: {
    body: Joi.object({
      limit: Joi.number().integer().min(1).max(20).default(5),
    }),
  },
};

const taskSchemas = {
  createTask: {
    body: Joi.object({
      title: Joi.string().min(3).max(200).required(),
      description: Joi.string().max(1000).required(),
      category: Joi.string().required(),
      difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD').default('MEDIUM'),
      xpReward: Joi.number().integer().min(1).max(500).default(10),
      skills: Joi.array().items(Joi.string()),
    }),
  },

  completeTask: {
    params: Joi.object({
      taskId: Joi.string().uuid().required(),
    }),
    body: Joi.object({
      score: Joi.number().min(0).max(100),
    }),
  },
};

module.exports = { authSchemas, userSchemas, xpSchemas, agentSchemas, taskSchemas };
