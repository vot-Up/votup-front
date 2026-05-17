import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {CustomValidators} from "../../../utilities/validator/custom-validators";
import {take} from "rxjs/operators";
import {AuthService} from "../../../services/auth.service";

@Component({
  standalone: false,
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {

    public url: string;
    public message: string;
    public formGroup: FormGroup
    public hide: boolean = true;
    public test: boolean = false;

    constructor(
        public formBuilder: FormBuilder,
        public router: Router,
        public authService: AuthService,
        public route: ActivatedRoute,
    ) {
    }

    ngOnInit(): void {
        this.createFormGroup();
        this.message = "sign-in";
        this.url = this.route.snapshot.queryParams["u"] || "/";
    }

    public createFormGroup(): void {
        this.formGroup = this.formBuilder.group({
            email: [null, CustomValidators.required],
            password: [null, CustomValidators.required]
        })
    }

    public login(): void {
        this.message = "processing";
        const rawValue = this.formGroup.getRawValue();

        this.authService.login(rawValue.email, rawValue.password)
            .pipe(take(1))
            .subscribe(() => {
                    if (this.formGroup.valid) {
                        this.router.navigate(["core/users"]).then();
                        this.playSound();
                    }
                },
                () => {
                    this.message = "sign-in";
                    this.test = true;
                    this.formGroup.reset()
                }
            );
    }

    playSound() {
        const audioElement = document.getElementById('audioElement') as HTMLAudioElement;
        audioElement.play();
    }
}
