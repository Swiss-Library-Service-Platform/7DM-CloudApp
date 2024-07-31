import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, Entity, AlertService, CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { RequestInfo } from '../models/RequestInfo.model';
import { BoxLabel } from '../models/BoxLabel.model';

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
  private initData: Object;
  private baseUrl: string =  'http://localhost:4201/api/v1'; // 'https://7dmproxy.swisscovery.network/api/v1'; //
  httpOptions: {};

  public todaysRequests: Array<RequestInfo> = [];
  private readonly _todaysRequestsObject = new BehaviorSubject<Array<RequestInfo>>(new Array<RequestInfo>());

  constructor(
    private http: HttpClient,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
  ) { }

  getTodaysRequestsObject(): Observable<Array<RequestInfo>> {
    return this._todaysRequestsObject.asObservable();
  }


  private _setObservableTodaysRequestsObject(todaysRequests: Array<RequestInfo>): void {
    this._todaysRequestsObject.next(todaysRequests);
  }

  /**
   * Initializes service
   * Gets the Alma Auth Token and defined HTTPOptions
   *
   * @return {*}  {Promise<void>}
   * @memberof LibraryManagementService
   */
  async init(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    this.initData = await this.eventsService.getInitData().toPromise();
    /* FIXME: We don't need the isProdEnvironment check currently, do we?
    let regExp = new RegExp('^https(.*)psb(.*)com/?$|.*localhost.*'), // contains "PSB" (Premium Sandbox) or "localhost"
        currentUrl = this.initData["urls"]["alma"];
    this.isProdEnvironment = !regExp.test(currentUrl);
    */
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
  async sendRequestTo7DM(requestId: string, boxId: string): Promise<RequestInfo> {
    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedRequestId = encodeURIComponent(requestId);
    let escapedLibraryCode = encodeURIComponent(libraryCode);
    let escapedBoxId = encodeURIComponent(boxId);

    return new Promise((resolve, reject) => {
      this.http.post<RequestInfo>(`${this.baseUrl}/requests/${escapedLibraryCode}`, { 
        request_id: escapedRequestId,
        box_id: escapedBoxId
      }, this.httpOptions).subscribe(
        response => {
          this.todaysRequests.push(response);
          resolve(response);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Retrieve the active box label of this library
   * @returns either the active box label or null
  */
  async retrieveActiveBoxLabel(): Promise<BoxLabel> {
    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedLibraryCode = encodeURIComponent(libraryCode);

    return new Promise((resolve, reject) => {
      this.http.get<BoxLabel>(`${this.baseUrl}/boxlabels/${escapedLibraryCode}`, this.httpOptions).subscribe(
        response => {
          resolve(response);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Generate a new Box Label
  */
  async generateBoxLabel(): Promise<BoxLabel> {
    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedLibraryCode = encodeURIComponent(libraryCode);

    return new Promise((resolve, reject) => {
      this.http.post<BoxLabel>(`${this.baseUrl}/boxlabels/${escapedLibraryCode}`, null, this.httpOptions).subscribe(
        response => {
          resolve(response);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  /**
   * Get all requests for the current library
   * 
   * @returns {Promise<RequestInfo[]>}
  */
  async getRequests(searchString: string = null): Promise<boolean> {
    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedLibraryCode = encodeURIComponent(libraryCode);

    let params = new HttpParams();
    if (searchString) {
      params = params.set('search', searchString);
    }

    return new Promise((resolve, reject) => {
      this.http.get<RequestInfo[]>(`${this.baseUrl}/requests/${escapedLibraryCode}`,  { params, ...this.httpOptions }).subscribe(
        response => {
          this.todaysRequests = response;
          this._setObservableTodaysRequestsObject(response);
          resolve(true);
        },
        error => {
          console.error(error);
          reject(false);
        }
      );
    });
  }

  /**
   * Cancel a request
   * 
   * @param {string} internalId
   * @returns {Promise<boolean>}
   */
  async cancelRequest(internalId: string): Promise<boolean> {
    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedLibraryCode = encodeURIComponent(libraryCode);
    let escapedRequestId = encodeURIComponent(internalId);

    return new Promise((resolve, reject) => {
      this.http.delete(`${this.baseUrl}/requests/${escapedLibraryCode}/${escapedRequestId}`, this.httpOptions).subscribe(
        response => {
          this.todaysRequests = this.todaysRequests.filter(request => request.internal_id !== internalId);
          this._setObservableTodaysRequestsObject(this.todaysRequests);
          resolve(true);
        },
        error => {
          console.error(error);
          reject(false);
        }
      );
    });
  }
}
