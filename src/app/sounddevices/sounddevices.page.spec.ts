import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SounddevicesPage } from './sounddevices.page';

describe('SounddevicesPage', () => {
  let component: SounddevicesPage;
  let fixture: ComponentFixture<SounddevicesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SounddevicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
