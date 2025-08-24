'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Icon } from './icons';
import OptimizedImage from './OptimizedImage';

import type { SubsectorTeamMember } from '@/types/team';

interface SubsectorTeamProps {
  subsectorId: string;
  subsectorName: string;
  showFullPage?: boolean;
  maxMembers?: number;
}

export default function SubsectorTeam({ 
  subsectorId, 
  subsectorName, 
  showFullPage = true, 
  maxMembers = 6 
}: SubsectorTeamProps) {
  const [teamMembers, setTeamMembers] = useState<SubsectorTeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch(`/api/admin/subsector-team?subsector_id=${subsectorId}`);
        const data = await response.json();
        
        if (response.ok) {
          setTeamMembers(data.teamMembers || []);
        } else {
          console.error('Erro ao buscar equipe:', data.error);
        }
      } catch (error) {
        console.error('Erro ao buscar equipe:', error);
      } finally {
        setLoading(false);
      }
    };

    if (subsectorId) {
      fetchTeamMembers();
    }
  }, [subsectorId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-cresol-gray-light p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-cresol-gray-light rounded-sm w-1/3 mb-3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-cresol-gray-light rounded-sm w-1/2"></div>
            <div className="h-3 bg-cresol-gray-light rounded-sm w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  const displayMembers = teamMembers.slice(0, maxMembers);
  const remainingCount = teamMembers.length - maxMembers;

  return (
    <div className="bg-white rounded-lg border border-cresol-gray-light p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Icon name="user-group" className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-semibold text-cresol-gray-dark">
            Equipe
          </h3>
        </div>
        {showFullPage && teamMembers.length > 0 && (
          <Link
            href={`/subsetores/${subsectorId}/equipe`}
            className="text-primary hover:text-primary-dark text-sm flex items-center gap-1"
          >
            Ver completa
            <Icon name="external-link" className="h-3 w-3" />
          </Link>
        )}
      </div>

      {teamMembers.length === 0 ? (
        <p className="text-sm text-cresol-gray">
          Nenhum membro cadastrado
        </p>
      ) : (
        <div className="space-y-3">
          {displayMembers.map(member => (
            <div key={member.id} className="flex items-center">
              <div className="relative h-8 w-8 rounded-full overflow-hidden bg-cresol-gray-light mr-3 flex-shrink-0">
                {member.profiles.avatar_url ? (
                  <OptimizedImage
                    src={member.profiles.avatar_url}
                    alt={member.profiles.full_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                    <Icon name="user-group" className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-cresol-gray-dark truncate">
                  {member.profiles.full_name}
                </p>
                <p className="text-xs text-cresol-gray truncate">
                  {member.position || member.profiles.position || 'Membro da equipe'}
                </p>
                {(member.profiles.phone || member.profiles.bio) && (
                  <div className="mt-0.5 space-y-0.5">
                    {member.profiles.phone && (
                      <p className="text-xs text-cresol-gray truncate flex items-center gap-1">
                        <Icon name="phone" className="h-3 w-3" />
                        {member.profiles.phone}
                      </p>
                    )}
                    {member.profiles.bio && (
                      <p className="text-xs text-cresol-gray truncate" title={member.profiles.bio}>
                        {member.profiles.bio.substring(0, 30)}{member.profiles.bio.length > 30 ? '...' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {remainingCount > 0 && (
            <div className="text-xs text-cresol-gray text-center py-2 border-t border-cresol-gray-light">
              +{remainingCount} {remainingCount === 1 ? 'membro' : 'membros'}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 