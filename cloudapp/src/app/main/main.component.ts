import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
    authToken: string;
    loading: boolean = true;
    allowed: boolean = false;
    isProdEnvironment: boolean = false;

    constructor(private http: HttpClient, private eventsService: CloudAppEventsService) { }

    async ngOnInit() {
        let initData = await this.eventsService.getInitData().toPromise();
        let regExp = new RegExp('^https(.*)psb(.*)com/?$|.*localhost.*'), // contains "PSB" (Premium Sandbox) or "localhost"
            currentUrl = initData["urls"]["alma"];
        console.log(currentUrl);
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

        const headers = { 'Authorization': `Bearer ${this.authToken}` };
        this.http.get('http://localhost:4200/api/v1/allowed', { headers }).subscribe(
            _ => {
                this.loading = false;
                this.allowed = true;
            },
            error => {
                console.log(JSON.stringify(error))
                this.loading = false;
                this.allowed = false;
            }
        );
    }
}
