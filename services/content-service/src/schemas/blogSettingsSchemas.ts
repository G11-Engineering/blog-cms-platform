import Joi from 'joi';

export const updateBlogSettingsSchema = Joi.object({
  blogTitle: Joi.string().min(1).max(200).required(),
  blogDescription: Joi.string().max(1000).allow('').optional()
});

