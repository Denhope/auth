import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HelperHashService {
  private readonly salt: number = 10;

  async createHash(password: string): Promise<string> {
    return bcrypt.hash(password, this.salt);
  }

  async match(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
