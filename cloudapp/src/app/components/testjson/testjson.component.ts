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

  constructor(
    private backendService: BackendService
  ) { }

  ngOnInit(): void {
    this.backendService.retrieveActiveBoxLabel().then(response => {
      this.inputBoxId = response?.box_id;
  });
  }

  onClickGenerateJson(): void {
    this.backendService.generateJson(this.inputBoxId).then(response => {
      this.responseJson = response;
    });
  }

}
