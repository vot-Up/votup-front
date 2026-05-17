import { Injectable, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { ResponsiveModalConfig } from './responsive-modal-config';

@Injectable({ providedIn: 'root' })
export class ResponsiveModalService {
    private readonly modal = inject(NzModalService);
    private readonly breakpointObserver = inject(BreakpointObserver);

    create(config: ResponsiveModalConfig): NzModalRef {
        const { mobileFullScreen = true, ...modalConfig } = config;
        const shouldFullscreen = mobileFullScreen && this.breakpointObserver.isMatched('(max-width: 767px)');

        return this.modal.create({
            ...modalConfig,
            nzCentered: shouldFullscreen ? false : (modalConfig.nzCentered ?? true),
            nzWidth: shouldFullscreen ? '100%' : (modalConfig.nzWidth ?? '80%'),
            nzStyle: {
                ...(modalConfig.nzStyle || {}),
                ...(shouldFullscreen ? { top: '0', padding: '0', maxHeight: '100vh', borderRadius: '0' } : {}),
            },
            nzBodyStyle: {
                ...(modalConfig.nzBodyStyle || {}),
                ...(shouldFullscreen ? { padding: '16px', overflowY: 'auto', maxHeight: 'calc(100vh - 55px)' } : {}),
            },
            nzClosable: modalConfig.nzClosable ?? true,
        });
    }

    createConfirm(config: ResponsiveModalConfig): NzModalRef {
        return this.modal.confirm({
            nzOkText: 'Sim',
            nzCancelText: 'Não',
            nzOkType: 'primary',
            nzOkDanger: true,
            ...config,
            nzCentered: true,
            nzWidth: config.nzWidth ?? '520px',
        });
    }

    confirm(config: ResponsiveModalConfig): NzModalRef {
        return this.createConfirm(config);
    }
}
