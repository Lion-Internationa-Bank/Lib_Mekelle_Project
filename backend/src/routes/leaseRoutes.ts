// src/routes/leaseRoutes.ts



import { Router } from 'express';
import { createLease ,updateLease, deleteLease} from '../controllers/leaseController.ts';

const router = Router({ mergeParams: true });

router.post('/', createLease);
router.put('/:lease_id', updateLease);
router.delete('/:lease_id', deleteLease);

export default router;




