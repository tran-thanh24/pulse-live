import { storageService } from './storage';

/**
 * Auth Service for PULSE//LIVE 2026
 */
export const authService = {
  provider: 'local-guest',

  generateTicketId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PL26-${code}`;
  },

  getOrCreateSession() {
    const saved = storageService.loadUserProfile();
    if (saved && saved.ticket && saved.ticket.ticketId) {
      // Ensure branding is updated to PULSE//LIVE 2026
      if (saved.ticket.event !== 'PULSE//LIVE 2026') {
        saved.ticket.event = 'PULSE//LIVE 2026';
        saved.ticket.ticketId = this.generateTicketId();
      }
      return saved;
    }
    const newTicket = {
      ticketId: this.generateTicketId(),
      event: 'PULSE//LIVE 2026',
      tier: 'GENERAL ADMISSION',
      gate: 'SECTOR A',
      zone: 'GA STANDING',
      seat: 'ARENA FLOOR',
      date: '03.11.2026',
      gateOpen: '19:00',
      showTime: '20:00',
      checkedIn: false,
      checkedInAt: null
    };
    const initialProfile = {
      userId: `pulse_${Math.random().toString(36).slice(2, 10)}`,
      displayName: 'PULSE // FAN',
      ticket: newTicket,
      avatar: {
        skinTone: '#F5CBA7',
        hairStyle: 'cyber-crop',
        hairColor: '#22D3EE',
        outfit: 'techwear-jacket',
        outfitColor: '#06B6D4',
        accessory: 'visor',
        lightstickColor: '#22D3EE'
      },
      lightstickColor: '#22D3EE',
      concertVisited: false,
      achievements: [],
      favoriteMerch: [],
      photos: []
    };
    storageService.saveUserProfile(initialProfile);
    return initialProfile;
  }
};
