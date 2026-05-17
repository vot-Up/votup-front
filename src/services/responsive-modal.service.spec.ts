import { TestBed } from '@angular/core/testing';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { ResponsiveModalService } from './responsive-modal.service';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';

describe('ResponsiveModalService', () => {
  let service: ResponsiveModalService;
  let modalService: jasmine.SpyObj<NzModalService>;
  let breakpointObserver: jasmine.SpyObj<BreakpointObserver>;
  let isMobileValue = false;

  const mockRef = { afterClose: of(null) } as unknown as NzModalRef;

  beforeEach(() => {
    isMobileValue = false;

    const modalSpy = jasmine.createSpyObj('NzModalService', ['create', 'confirm']);
    modalSpy.create.and.returnValue(mockRef);
    modalSpy.confirm.and.returnValue(mockRef);

    const bpSpy = jasmine.createSpyObj('BreakpointObserver', ['observe', 'isMatched']);
    bpSpy.isMatched.and.callFake(() => isMobileValue);
    bpSpy.observe.and.returnValue(of({ matches: isMobileValue, breakpoints: {} }));

    TestBed.configureTestingModule({
      providers: [
        ResponsiveModalService,
        { provide: NzModalService, useValue: modalSpy },
        { provide: BreakpointObserver, useValue: bpSpy },
      ],
    });

    service = TestBed.inject(ResponsiveModalService);
    modalService = modalSpy;
    breakpointObserver = bpSpy;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create()', () => {
    it('should pass nzData identically to NzModalService.create()', () => {
      const testData = { pk: 1, voter: { name: 'Test', id: 1 }, isUpdate: true };
      service.create({
        nzTitle: 'Edit',
        nzContent: class MockComponent {},
        nzData: testData,
      });

      expect(modalService.create).toHaveBeenCalled();
      const callArgs = modalService.create.calls.argsFor(0)[0];
      expect(callArgs.nzData).toEqual(testData);
    });

    it('should apply full-screen styles on mobile when mobileFullScreen is true (default)', () => {
      isMobileValue = true;
      breakpointObserver.isMatched.and.returnValue(true);

      service.create({
        nzTitle: 'Create',
        nzContent: class MockComponent {},
      });

      expect(modalService.create).toHaveBeenCalled();
      const callArgs = modalService.create.calls.argsFor(0)[0];
      expect(callArgs.nzWidth).toBe('100%');
      expect(callArgs.nzCentered).toBe(false);
      expect((callArgs.nzStyle as Record<string, any>).top).toBe('0');
      expect((callArgs.nzStyle as Record<string, any>).borderRadius).toBe('0');
    });

    it('should apply centered modal on desktop', () => {
      isMobileValue = false;
      breakpointObserver.isMatched.and.returnValue(false);

      service.create({
        nzTitle: 'Create',
        nzContent: class MockComponent {},
      });

      expect(modalService.create).toHaveBeenCalled();
      const callArgs = modalService.create.calls.argsFor(0)[0];
      expect(callArgs.nzWidth).toBe('80%');
      expect(callArgs.nzCentered).toBe(true);
    });

    it('should NOT apply full-screen on mobile when mobileFullScreen is false', () => {
      breakpointObserver.isMatched.and.returnValue(true);

      service.create({
        nzTitle: 'Create',
        nzContent: class MockComponent {},
        mobileFullScreen: false,
      });

      expect(modalService.create).toHaveBeenCalled();
      const callArgs = modalService.create.calls.argsFor(0)[0];
      expect(callArgs.nzWidth).toBe('80%');
      expect(callArgs.nzCentered).toBe(true);
    });

    it('should default mobileFullScreen to true', () => {
      breakpointObserver.isMatched.and.returnValue(true);

      service.create({
        nzTitle: 'Test',
        nzContent: class MockComponent {},
      });

      const callArgs = modalService.create.calls.argsFor(0)[0];
      expect(callArgs.nzWidth).toBe('100%');
    });

    it('should allow custom nzWidth override on desktop', () => {
      breakpointObserver.isMatched.and.returnValue(false);

      service.create({
        nzTitle: 'Test',
        nzContent: class MockComponent {},
        nzWidth: '40%',
      });

      const callArgs = modalService.create.calls.argsFor(0)[0];
      expect(callArgs.nzWidth).toBe('40%');
    });
  });

  describe('createConfirm()', () => {
    it('should render centered confirm dialog', () => {
      service.createConfirm({
        nzTitle: 'Delete?',
        nzOnOk: () => {},
      });

      expect(modalService.confirm).toHaveBeenCalled();
      const callArgs = modalService.confirm.calls.argsFor(0)[0];
      expect(callArgs.nzCentered).toBe(true);
    });

    it('should never be full-screen even on mobile', () => {
      breakpointObserver.isMatched.and.returnValue(true);

      service.createConfirm({
        nzTitle: 'Delete?',
        nzOnOk: () => {},
      });

      expect(modalService.confirm).toHaveBeenCalled();
      const callArgs = modalService.confirm.calls.argsFor(0)[0];
      expect(callArgs.nzWidth).not.toBe('100%');
    });

    it('should default nzOkDanger to true', () => {
      service.createConfirm({
        nzTitle: 'Delete?',
        nzOnOk: () => {},
      });

      const callArgs = modalService.confirm.calls.argsFor(0)[0];
      expect(callArgs.nzOkDanger).toBe(true);
    });

    it('should allow overriding default confirm options', () => {
      service.createConfirm({
        nzTitle: 'Custom',
        nzOkText: 'Confirmar',
        nzOkDanger: false,
        nzOnOk: () => {},
      });

      const callArgs = modalService.confirm.calls.argsFor(0)[0];
      expect(callArgs.nzOkText).toBe('Confirmar');
      expect(callArgs.nzOkDanger).toBe(false);
    });
  });

  describe('isMobile()', () => {
    it('should return true when viewport matches mobile breakpoint', () => {
      breakpointObserver.isMatched.and.returnValue(true);
      expect(service.isMobile()).toBe(true);
    });

    it('should return false when viewport does not match mobile breakpoint', () => {
      breakpointObserver.isMatched.and.returnValue(false);
      expect(service.isMobile()).toBe(false);
    });
  });
});
