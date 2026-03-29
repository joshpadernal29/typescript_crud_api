// src/_middleware/erroHandler.ts
import type { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: Error | string,
    req: Request,
    res: Response,
    next: NextFunction
): Response | void {
    if (typeof err === 'string') {
        // custom application error
        const is404 = err.toLowerCase().endsWith('not found');
        const statusCode = is404 ? 404 : 408;
        return res.status(statusCode).json({ message: err });
    }

    if (err instanceof Error) {
        // standard eror object
        return res.status(500).json({ message: err.message });
    }

    // fallback message
    return res.status(500).json({ message: 'Internal Server Error!' });
}