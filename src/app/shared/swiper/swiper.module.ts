import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { register } from 'swiper/element/bundle';

register();

@NgModule({
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SwiperModule {}
