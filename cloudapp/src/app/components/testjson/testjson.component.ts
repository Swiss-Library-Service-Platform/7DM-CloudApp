import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../services/backend.service';

@Component({
  selector: 'app-testjson',
  templateUrl: './testjson.component.html',
  styleUrls: ['./testjson.component.scss']
})
export class TestjsonComponent implements OnInit {

  inputBoxId: string = '';
  responseJson: string = '';
  responseError: string = '';
  response7DM: string = '';

  constructor(
    private backendService: BackendService
  ) { }

  ngOnInit(): void {
    this.backendService.retrieveActiveBoxLabel().then(response => {
      this.inputBoxId = response?.box_id;
  });
  }

  onClickGenerateJson(): void {
    this.clearResponse();
    this.backendService.generateJson(this.inputBoxId).then(response => {
      this.responseJson = response;
      this.responseError = '';
    }).catch(error => {
      this.responseJson = '';
      this.responseError = error.error?.message;
    });
  }

  clearResponse(): void {
    this.responseJson = '';
    this.responseError = '';
    this.response7DM = '';
  }

  onClickSend(): void {
    this.backendService.sendJsonTo7DM(this.responseJson).then(response => {
      this.response7DM = response;
    }).catch(error => {
      this.response7DM = error.error?.message;
    });
  }

}
