'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/app/components/icons/Icon';

interface User {
  id: string;
  full_name: string;
  email: string;
  position?: string;
  work_location?: string;
  avatar_url?: string;
}

interface SelectedUsersPreviewProps {
  selectedUsers: User[];
  onRemoveUser: (userId: string) => void;
  maxDisplay?: number;
}

const SelectedUsersPreview: React.FC<SelectedUsersPreviewProps> = ({
  selectedUsers,
  onRemoveUser,
  maxDisplay = 8
}) => {
  const visibleUsers = selectedUsers.slice(0, maxDisplay);
  const remainingCount = selectedUsers.length - maxDisplay;

  if (selectedUsers.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Icon name="user" className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">Nenhum usuário selecionado</p>
        <p className="text-gray-400 text-xs mt-1">
          Use a aba &quot;Usuários&quot; para selecionar membros do grupo
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="user" className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">
            Usuários Selecionados
          </h3>
          <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
            {selectedUsers.length}
          </span>
        </div>
        {selectedUsers.length > 0 && (
          <button
            type="button"
            onClick={() => selectedUsers.forEach(user => onRemoveUser(user.id))}
            className="text-xs text-red-600 hover:text-red-800 transition-colors"
          >
            Remover todos
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        <AnimatePresence>
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{
                delay: index * 0.05
              }}
              className="group bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                {/* Avatar */}
                <div className="relative">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.full_name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.full_name || user.email}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                    {user.position && (
                      <>
                        <span className="text-gray-300">•</span>
                        <p className="text-xs text-gray-600 truncate">
                          {user.position}
                        </p>
                      </>
                    )}
                  </div>
                  {user.work_location && (
                    <div className="flex items-center mt-1">
                      <Icon name="map" className="w-3 h-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500 truncate">
                        {user.work_location}
                      </p>
                    </div>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => onRemoveUser(user.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Remover usuário"
                >
                  <Icon name="x" className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Show remaining count if there are more users */}
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/60 rounded-lg p-3 border-2 border-dashed border-gray-300 text-center"
          >
            <Icon name="grid" className="w-5 h-5 mx-auto text-gray-400 mb-1" />
            <p className="text-sm text-gray-600">
              +{remainingCount} usuário{remainingCount !== 1 ? 's' : ''} adicional{remainingCount !== 1 ? 'is' : ''}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Vá para a aba &quot;Usuários&quot; para ver todos os selecionados
            </p>
          </motion.div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Total selecionado: {selectedUsers.length} usuário{selectedUsers.length !== 1 ? 's' : ''}</span>
          <span>Exibindo: {Math.min(selectedUsers.length, maxDisplay)}</span>
        </div>
      </div>
    </div>
  );
};

export default SelectedUsersPreview;