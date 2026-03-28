// src/_middleware/validateRequest.ts
import type { Request, NextFunction } from 'express';
import Joi from 'joi';

export function validateRequest(
    req: Request,
    next: NextFunction,
    schema: Joi.ObjectSchema
): void {
    const options = {
        abortEarly: false,
        allowUnkown: true,
        stripUnknown: true,
    };

    const { error, value } = schema.validate(req.body, options);

    if (error) {
        next(`validation  error: ${error.details.map((d) => d.message).join(', ')}`);
    } else {
        req.body = value;
        next();
    }
}