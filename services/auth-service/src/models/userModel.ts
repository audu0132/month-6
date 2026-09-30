import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'manager' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  refreshTokens: string[];
  createdAt: string;
  updatedAt: string;
}

// In-Memory Enterprise Store with persistent seed users
class UserRepository {
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedUsers();
  }

  private async seedUsers() {
    const defaultPassword = 'Password123!';
    const hash = await bcrypt.hash(defaultPassword, 10);

    const initialUsers: User[] = [
      {
        id: 'usr_admin_001',
        name: 'Enterprise Admin',
        email: 'admin@enterprise.io',
        passwordHash: hash,
        role: 'admin',
        isActive: true,
        refreshTokens: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr_mgr_002',
        name: 'Product Manager',
        email: 'manager@enterprise.io',
        passwordHash: hash,
        role: 'manager',
        isActive: true,
        refreshTokens: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'usr_cust_003',
        name: 'Jane Customer',
        email: 'jane@enterprise.io',
        passwordHash: hash,
        role: 'customer',
        isActive: true,
        refreshTokens: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    initialUsers.forEach((u) => this.users.set(u.id, u));
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const normalized = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'refreshTokens'>): Promise<User> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newUser: User = {
      ...user,
      id,
      refreshTokens: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async save(user: User): Promise<User> {
    user.updatedAt = new Date().toISOString();
    this.users.set(user.id, user);
    return user;
  }

  async getAll(): Promise<Omit<User, 'passwordHash' | 'refreshTokens'>[]> {
    return Array.from(this.users.values()).map(({ passwordHash, refreshTokens, ...safe }) => safe);
  }
}

export const userRepository = new UserRepository();
