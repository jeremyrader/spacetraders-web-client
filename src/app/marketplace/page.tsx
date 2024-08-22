'use client';

import React, { Suspense } from 'react';
import MarketUI from '@/components/MarketUI';

const Marketplace = () => {
  return (
    <Suspense>
      <MarketUI />
    </Suspense>
  );
};

export default Marketplace;
