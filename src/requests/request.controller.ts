//src/requests/request.controller.ts
import { Router, Request, Response, NextFunction } from 'express';
import { requestService } from './request.service';

const router = Router();

// Routes
router.get('/', getAll);
router.post('/', create);
router.put('/:id/status', updateStatus);

export default router;

function getAll(req: Request, res: Response, next: NextFunction) {
    requestService.getAll()
        .then(requests => res.json(requests))
        .catch(next);
}

function create(req: Request, res: Response, next: NextFunction) {
    requestService.create(req.body)
        .then(request => res.json(request))
        .catch(next);
}

function updateStatus(req: Request, res: Response, next: NextFunction) {
    requestService.updateStatus(Number(req.params.id), req.body.status)
        .then(() => res.json({ message: 'Request updated successfully' }))
        .catch(next);
}