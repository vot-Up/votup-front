import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SwiperModule } from '../swiper/swiper.module';

@Component({
    selector: 'app-swiper-prototype',
    standalone: true,
    imports: [SwiperModule],
    templateUrl: './swiper-prototype.component.html',
    styleUrl: './swiper-prototype.component.less',
    changeDetection: ChangeDetectionStrategy.OnPush,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SwiperPrototypeComponent {
    readonly cards = [
        'Chapa Alpha',
        'Chapa Beta',
        'Chapa Gama',
    ];
}
