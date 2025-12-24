const Joi = require('joi');

const eventSchema = Joi.object({
  external_id: Joi.string().required(),
  source: Joi.string().required(),
  title: Joi.string().required().max(500),
  description: Joi.string().allow(null, ''),
  start_date: Joi.date().required(),
  end_date: Joi.date().allow(null),
  location: Joi.object({
    name: Joi.string().allow(null, ''),
    address: Joi.string().allow(null, ''),
    city: Joi.string().allow(null, ''),
    lat: Joi.number().allow(null),
    lng: Joi.number().allow(null),
  }),
  category: Joi.string().allow(null, ''),
  url: Joi.string().uri().allow(null, ''),
  image_url: Joi.string().uri().allow(null, ''),
  is_free: Joi.boolean(),
  price: Joi.number().allow(null),
  organizer: Joi.string().allow(null, ''),
  raw_data: Joi.object(),
});

function validateEvent(data) {
  return eventSchema.validate(data, { abortEarly: false });
}

module.exports = { validateEvent };
