import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppVietnamService {
  constructor(
    @Inject('APP_NAME')
    private readonly name: string,

    @Inject('MESSAGE')
    private readonly dummy: string,
  ) {}

  getHello(): string {
    return 'Xin Chao! - ' + this.name + ' - ' + this.dummy;
  }
}
