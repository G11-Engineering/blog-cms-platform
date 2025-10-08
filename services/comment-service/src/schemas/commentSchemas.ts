import Joi from 'joi';

export const createCommentSchema = Joi.object({
  postId: Joi.string().uuid().required(),
  content: Joi.string().min(1).max(2000).required(),
  parentId: Joi.string().uuid().allow(null),
  authorName: Joi.string().max(100).allow(''),
  authorEmail: Joi.string().email().allow(''),
  authorWebsite: Joi.string().uri().allow('')
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required()
});

export const moderateCommentSchema = Joi.object({
  action: Joi.string().valid('approve', 'reject', 'spam', 'delete').required(),
  reason: Joi.string().max(500).allow('')
});
