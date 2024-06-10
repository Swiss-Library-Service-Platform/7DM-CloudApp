import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CloudAppEventsService } from '@exlibris/exl-cloudapp-angular-lib';

@Component({
    selector: 'app-partners',
    templateUrl: './partners.component.html',
    styleUrls: ['./partners.component.scss']
})
export class PartnersComponent implements OnInit {
    originalResponse: any;
    response: any;
    loading = false;
    searchValue = '';
    authToken: string;

    constructor(private http: HttpClient, private eventsService: CloudAppEventsService) { }

    ngOnInit() {
        this.eventsService.getAuthToken().subscribe(authToken => {
            this.authToken = authToken
            this.loadPartners();
        });
    }

    loadPartners() {
        if (this.originalResponse) {
            return;
        }

        this.loading = true;
        const headers = { 'Authorization': `Bearer ${this.authToken}` };
        this.http.get('http://localhost:4200/api/v1/partners', { headers }).subscribe(
            response => {
                this.originalResponse = response;
                this.response = [...this.originalResponse];
                this.loading = false;
            },
            error => {
                console.log(JSON.stringify(error))
                this.loading = false;
            }
        );
    }

    search() {
        if (!this.searchValue) {
            this.response = [...this.originalResponse];
        } else {
            this.response = this.originalResponse.filter((item: any) => item.name.toLowerCase().includes(this.searchValue.toLowerCase()));
        }
    }
}
