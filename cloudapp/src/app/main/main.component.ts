import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';


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

    constructor(private http: HttpClient, private eventsService: CloudAppEventsService) { }

    async ngOnInit() {
        this.data = await this.eventsService.getInitData().toPromise();
        let regExp = new RegExp('^https(.*)psb(.*)com/?$|.*localhost.*'), // contains "PSB" (Premium Sandbox) or "localhost"
            currentUrl = this.data["urls"]["alma"];
        this.isProdEnvironment = !regExp.test(currentUrl);

        this.eventsService.getAuthToken().subscribe(authToken => {
            this.authToken = authToken
            this.checkAllowed();
        });
    }

    checkAllowed(): void {
        if (!this.loading) {
            return;
        }

        let escapedLibraryCode = encodeURIComponent(this.data.user.currentlyAtLibCode);

        const headers = { 'Authorization': `Bearer ${this.authToken}` };
        this.http.get(`http://localhost:4200/api/v1/allowed/${escapedLibraryCode}`, { headers }).subscribe(
            _ => {
                this.loading = false;
                this.allowed = true;
            },
            error => {
                this.loading = false;
                this.allowed = false;
            }
        );
    }
}
