import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})

export class MainComponent implements OnInit {
    loading = true;
    authToken: string;
    allowed = false;

    constructor(private http: HttpClient, private eventsService: CloudAppEventsService) { }

    ngOnInit(): void {
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
