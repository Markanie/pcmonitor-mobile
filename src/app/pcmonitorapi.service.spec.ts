import { TestBed } from '@angular/core/testing';

import { PcmonitorapiService } from './pcmonitorapi.service';

describe('PcmonitorapiService', () => {
  let service: PcmonitorapiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PcmonitorapiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
