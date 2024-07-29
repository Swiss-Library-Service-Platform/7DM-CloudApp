import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, Entity, AlertService, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { RequestInfo } from '../models/RequestInfo.model';

/**
 * Service which is responsible for all outgoing API calls in this cloud app
 *
 * @export
 * @class BackendService
 */
@Injectable({
  providedIn: 'root'
})
export class BackendService {
  
  private isInitialized = false;
  private initData: Object
  private baseUrl: string = 'http://localhost:4201/api/v1'; // FIXME: 'https://7dmproxy.swisscovery.network/api/v1';
  httpOptions: {};

  constructor(
    private http: HttpClient,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private translate: TranslateService,
    private restService: CloudAppRestService,
  ) { }

  /**
   * Initializes service
   * Gets the Alma Auth Token and defined HTTPOptions
   *
   * @return {*}  {Promise<void>}
   * @memberof LibraryManagementService
   */
  async init(initData: Object): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    this.initData = initData;
    console.log('initData', this.initData);
    let authToken = await this.eventsService.getAuthToken().toPromise();
    this.httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${authToken}`,
        //'Content-Type': 'application/json'
      }),
      withCredentials: true
    };
  }

  /**
   * Checks if the library is allowed to use the cloud app
   * 
   * @returns {Promise<boolean>}
   */
  async checkIfLibaryAllowed(): Promise<boolean> {
    let escapedLibraryCode = encodeURIComponent(this.initData['user']['currentlyAtLibCode']);

    return new Promise(resolve => {
      this.http.get(`${this.baseUrl}/allowed/${escapedLibraryCode}`, this.httpOptions).subscribe(
        (data: any) => {
          resolve(true);
        },
        error => {
          console.log(error);
          resolve(false);
        },
      );
    });
  }

  /** 
   * Looks up a request in the API
   * 
   */
  async lookUpRequest(requestId: string): Promise<RequestInfo> {
    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedRequestId = encodeURIComponent(requestId);
    let escapedLibraryCode = encodeURIComponent(libraryCode);

    return new Promise((resolve, reject) => {
      this.http.get<RequestInfo>(`${this.baseUrl}/requests/${escapedRequestId}/libraries/${escapedLibraryCode}`, this.httpOptions).subscribe(
        response => {
          resolve(response);
        },
        error => {
          reject(error);
        }
      );
    });
  }
}
