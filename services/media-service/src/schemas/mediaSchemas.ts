import Joi from 'joi';

export const updateMediaSchema = Joi.object({
  altText: Joi.string().max(500).allow(''),
  caption: Joi.string().max(1000).allow(''),
  isPublic: Joi.boolean()
});
