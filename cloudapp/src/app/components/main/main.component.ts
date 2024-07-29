import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { BackendService } from '../../services/backend.service';


@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
    data: InitData;
    authToken: string;
    loading: boolean = true;
    allowed: boolean = false;
    isProdEnvironment: boolean = false;

    constructor(
        private http: HttpClient, 
        private eventsService: CloudAppEventsService,
        private backendService: BackendService
    ) { }

    async ngOnInit(): Promise<void> {
        this.data = await this.eventsService.getInitData().toPromise();
        let regExp = new RegExp('^https(.*)psb(.*)com/?$|.*localhost.*'), // contains "PSB" (Premium Sandbox) or "localhost"
            currentUrl = this.data["urls"]["alma"];
        this.isProdEnvironment = !regExp.test(currentUrl);

        // for testing FIXME
        // this.data.user.currentlyAtLibCode = 'E02';
        await this.backendService.init(this.data);

        this.eventsService.getAuthToken().subscribe(authToken => {
            this.authToken = authToken
            this.backendService.checkIfLibaryAllowed().then(allowed => {
                this.loading = false;
                this.allowed = allowed;
            }).catch(error => {
                console.log(error);
                this.loading = false;
            });
        });
    }
}
