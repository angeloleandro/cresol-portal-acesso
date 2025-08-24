'use client';

// Collection Form Component - SIMPLIFIED VERSION
import React from 'react';

import { CollectionFormProps } from '@/lib/types/collections';

const CollectionForm: React.FC<CollectionFormProps> = ({
  onCancel,
  className
}) => {
  return (
    <div className={className}>
      <p>CollectionForm - Em desenvolvimento</p>
      <button onClick={() => onCancel?.()}>Cancelar</button>
    </div>
  );
};

export default CollectionForm;