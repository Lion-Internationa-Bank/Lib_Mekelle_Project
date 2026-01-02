import { Router } from 'express';
import { createOwner,onlyCreateOwner ,updateOwner, deleteOwner,getOwnersWithParcels , searchOwnersLite} from '../controllers/ownerController.ts';

const router = Router({ mergeParams: true });

router.post('/', createOwner);

router.post('/only', onlyCreateOwner);
router.put('/:owner_id', updateOwner);
router.delete('/:owner_id', deleteOwner);
router.get('/with-parcels', getOwnersWithParcels);
router.get('/search-lite', searchOwnersLite)

export default router;