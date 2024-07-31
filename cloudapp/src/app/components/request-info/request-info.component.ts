import { Component, Input, OnInit } from '@angular/core';
import { RequestInfo } from '../../models/RequestInfo.model';

@Component({
  selector: 'app-request-info',
  templateUrl: './request-info.component.html',
  styleUrls: ['./request-info.component.scss']
})
export class RequestInfoComponent implements OnInit {

  @Input()
  requestInfo: RequestInfo
  
  constructor() { }

  ngOnInit(): void {
  }

}
