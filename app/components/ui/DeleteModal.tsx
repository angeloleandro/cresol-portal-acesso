'use client';

import React from 'react';
import { DeleteModal as ChakraDeleteModal } from '../ui/base/Modal';

// Re-export the Chakra DeleteModal with same interface
export default ChakraDeleteModal;

// For backwards compatibility, also export as named export
export { ChakraDeleteModal as DeleteModal };