'use client';

import React, { Suspense } from 'react';
import ShipyardUI from '@/components/ShipyardUI';

const Shipyard = () => {
  return (
    <Suspense>
      <ShipyardUI />
    </Suspense>
  );
};

export default Shipyard;
