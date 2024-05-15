import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  originalResponse: any;
  response: any;
  isLoading = false;
  searchValue = '';

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadPartners();
  }

  loadPartners() {
    this.isLoading = true;
    if (this.originalResponse) {
      console.log("Partners already loaded");
      return;
    }
    this.http.get('http://localhost:4200/api/v1/partners').subscribe(
      response => {
        this.originalResponse = response;
        this.response = [...this.originalResponse];
        this.isLoading = false;
        console.log("Partners retrieved successfully!, at: " + new Date().toLocaleTimeString() + " on " + new Date().toLocaleDateString());
      },
      error => {
        console.error('Error: ' + error);
        this.isLoading = false;
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
