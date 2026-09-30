export interface UserProfile {
  id: string;
  authId: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'customer';
  phone?: string;
  avatarUrl?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  department?: string;
  preferences: {
    newsletter: boolean;
    orderUpdates: boolean;
    darkMode: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

class UserProfileRepository {
  private profiles: Map<string, UserProfile> = new Map();

  constructor() {
    this.seedProfiles();
  }

  private seedProfiles() {
    const initialProfiles: UserProfile[] = [
      {
        id: 'prof_admin_001',
        authId: 'usr_admin_001',
        email: 'admin@enterprise.io',
        name: 'Enterprise Admin',
        role: 'admin',
        phone: '+1-555-0100',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        address: {
          street: '100 Silicon Way',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94107',
          country: 'USA',
        },
        department: 'Infrastructure & Security',
        preferences: { newsletter: true, orderUpdates: true, darkMode: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prof_mgr_002',
        authId: 'usr_mgr_002',
        email: 'manager@enterprise.io',
        name: 'Product Manager',
        role: 'manager',
        phone: '+1-555-0102',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        department: 'E-Commerce Operations',
        preferences: { newsletter: true, orderUpdates: true, darkMode: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'prof_cust_003',
        authId: 'usr_cust_003',
        email: 'jane@enterprise.io',
        name: 'Jane Customer',
        role: 'customer',
        phone: '+1-555-0199',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        address: {
          street: '456 Market St',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA',
        },
        preferences: { newsletter: false, orderUpdates: true, darkMode: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    initialProfiles.forEach((p) => this.profiles.set(p.authId, p));
  }

  async findByAuthId(authId: string): Promise<UserProfile | undefined> {
    return this.profiles.get(authId);
  }

  async findByEmail(email: string): Promise<UserProfile | undefined> {
    const target = email.toLowerCase().trim();
    for (const p of this.profiles.values()) {
      if (p.email.toLowerCase() === target) return p;
    }
    return undefined;
  }

  async createOrUpdate(profile: Partial<UserProfile> & { authId: string; email: string; name: string }): Promise<UserProfile> {
    const existing = this.profiles.get(profile.authId);
    if (existing) {
      const updated: UserProfile = {
        ...existing,
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      this.profiles.set(profile.authId, updated);
      return updated;
    } else {
      const newProfile: UserProfile = {
        id: `prof_${Date.now()}`,
        authId: profile.authId,
        email: profile.email,
        name: profile.name,
        role: profile.role || 'customer',
        phone: profile.phone || '',
        avatarUrl: profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        address: profile.address,
        preferences: profile.preferences || { newsletter: true, orderUpdates: true, darkMode: true },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.profiles.set(newProfile.authId, newProfile);
      return newProfile;
    }
  }

  async getAll(): Promise<UserProfile[]> {
    return Array.from(this.profiles.values());
  }
}

export const userProfileRepository = new UserProfileRepository();
