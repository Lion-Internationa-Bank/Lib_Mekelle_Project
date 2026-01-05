// src/routes/parcelRoutes.ts
import { Router } from 'express';

import { createParcel,
          getParcels, 
         getParcelByUpin,
         transferOwnership,
         updateParcel, 
         deleteParcel,
         updateParcelOwnerShare,
         createEncumbrance,
         updateEncumbrance,
         getEncumbrancesByParcel, 
         deleteEncumbrance 
} from '../controllers/parcelController.ts';

const router = Router({ mergeParams: true });

router.post('/', createParcel);
router.get('/', getParcels);
router.get('/:upin', getParcelByUpin);
router.post('/:upin/transfer', transferOwnership);
router.put('/:upin', updateParcel);
router.delete('/:upin', deleteParcel);
router.put('/owners/:parcel_owner_id/share', updateParcelOwnerShare);

// EN CUMBRANCES
router.post('/encumbrances', createEncumbrance);
router.put('/encumbrances/:encumbrance_id', updateEncumbrance);
router.delete('/encumbrances/:encumbrance_id', deleteEncumbrance);
router.get('/encumbrances/:upin', getEncumbrancesByParcel);



export default router;





