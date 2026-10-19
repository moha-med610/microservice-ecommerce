import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly salt = 12;

  async createHash(data: string | Buffer) {
    return await bcrypt.hash(data, this.salt);
  }

  async compareHash(data: string | Buffer, encrypted: string) {
    return await bcrypt.compare(data, encrypted);
  }
}
