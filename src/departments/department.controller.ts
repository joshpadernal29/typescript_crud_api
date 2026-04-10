import type { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import Joi from 'joi';
import { validateRequest } from '../_middleware/validateRequest';
import { departmentService } from './department.service';

const router = Router();

// --- ROUTES ---
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', createSchema, create);
router.put('/:id', updateSchema, update);
router.delete('/:id', _delete);

export default router;

// --- HANDLERS ---

function getAll(req: Request, res: Response, next: NextFunction): void {
    departmentService.getAll()
        .then((departments) => res.json(departments))
        .catch(next);
}

function getById(req: Request, res: Response, next: NextFunction): void {
    departmentService.getById(Number(req.params.id))
        .then((dept) => (dept ? res.json(dept) : res.sendStatus(404)))
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction): void {
    console.log("Attempting to create department:", req.body); // Log 1
    departmentService.create(req.body)
        .then((result) => {
            console.log("Service created record:", result); // Log 2
            return res.json({ message: 'Department created' });
        })
        .catch((err) => {
            console.error("Service Error:", err); // Log 3
            next(err);
        });
}

function update(req: Request, res: Response, next: NextFunction): void {
    departmentService.update(Number(req.params.id), req.body)
        .then(() => res.json({ message: 'Department updated' }))
        .catch(next);
}

function _delete(req: Request, res: Response, next: NextFunction): void {
    departmentService.delete(Number(req.params.id))
        .then(() => res.json({ message: 'Department deleted' }))
        .catch(next);
}

// --- VALIDATION ---

function createSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        name: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function updateSchema(req: Request, res: Response, next: NextFunction): void {
    const schema = Joi.object({
        name: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}