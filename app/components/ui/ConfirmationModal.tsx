'use client';

import React from 'react';
import { ConfirmationModal as ChakraConfirmationModal } from '../ui/base/Modal';

// Re-export the Chakra ConfirmationModal with same interface
export default ChakraConfirmationModal;

// For backwards compatibility, also export as named export
export { ChakraConfirmationModal as ConfirmationModal };