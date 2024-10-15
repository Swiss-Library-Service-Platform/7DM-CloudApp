import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RequestInfo } from '../models/RequestInfo.model';
import { BoxLabel } from '../models/BoxLabel.model';
import { PagedHistory } from '../models/PagedHistory.model';

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

  private isDevelopmentEnviroment: boolean = false;
  private isServiceInitialized = false;
  private initData: Object;
  private baseUrlProd: string = 'https://7dmproxy.swisscovery.network/api/v1';
  private baseUrlLocal: string = 'http://localhost:4201/api/v1';
  private httpOptions: {};

  public todaysRequests: Array<RequestInfo> = [];
  private readonly _todaysRequestsObject = new BehaviorSubject<Array<RequestInfo>>(new Array<RequestInfo>());

  private readonly _pagedHistoryObject = new BehaviorSubject<PagedHistory>(null);

  constructor(
    private http: HttpClient,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
  ) { }

  getTodaysRequestsObject(): Observable<RequestInfo[]> {
    return this._todaysRequestsObject.asObservable();
  }

  getPagedHistoryObject(): Observable<PagedHistory> {
    return this._pagedHistoryObject.asObservable();
  }

  private _setObservableTodaysRequestsObject(todaysRequests: Array<RequestInfo>): void {
    this._todaysRequestsObject.next(todaysRequests);
  }

  private _setObservablePagedHistoryObject(historyRequests: PagedHistory): void {
    this._pagedHistoryObject.next(historyRequests);
  }

  private get baseUrl(): string {
    return this.isDevelopmentEnviroment ? this.baseUrlLocal : this.baseUrlProd;
  }

  /**
   * Initializes service
   * Gets the Alma Auth Token and defined HTTPOptions
   *
   * @return {*}  {Promise<void>}
   * @memberof LibraryManagementService
   */
  async init(): Promise<void> {
    if (this.isServiceInitialized) {
      return;
    }
    this.initData = await this.eventsService.getInitData().toPromise();
    let regExp = new RegExp('^.*localhost.*'), // contains "localhost"
      currentUrl = this.initData["urls"]["alma"];
    this.isDevelopmentEnviroment = regExp.test(currentUrl);
    let authToken = await this.eventsService.getAuthToken().toPromise();
    this.httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${authToken}`,
        //'Content-Type': 'application/json'
        'Accept': 'application/json'
      }),
      withCredentials: true,
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
         // this.todaysRequests.push(response);
         // this._setObservableTodaysRequestsObject(this.todaysRequests);
         this.getRequests();
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
      this.http.get<RequestInfo[]>(`${this.baseUrl}/requests/${escapedLibraryCode}`, { params, ...this.httpOptions }).subscribe(
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
          // Change request to deleted immediately
          let request = this.todaysRequests.find(request => request.internal_id === internalId);
          request.isDeleting = true;
          this._setObservableTodaysRequestsObject(this.todaysRequests);

          // Wait 3 seconds before removing the request from the list
          setTimeout(() => {
            this.todaysRequests = this.todaysRequests.filter(request => request.internal_id !== internalId);
            this._setObservableTodaysRequestsObject(this.todaysRequests);
          }, 3000);
          resolve(true);
        },
        error => {
          console.error(error);
          reject(false);
        }
      );
    });
  }

  /*
    * Get url of pdf
    * @param {string} boxId
    * @returns {Promise<string>}
  */
  async getBoxLabelPdfUrl(boxId: string): Promise<string> {

    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedLibraryCode = encodeURIComponent(libraryCode);
    let escapedBoxId = encodeURIComponent(boxId);

    return `${this.baseUrl}/boxlabels/${escapedLibraryCode}/${escapedBoxId}/generatepdf`;
  }

  /*
  * Get url of pdf
  * @param {string} requestId
  * @returns {Promise<string>}
  */
  async getRequestSlipPdfUrl(requestId: string): Promise<string> {

    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedLibraryCode = encodeURIComponent(libraryCode);
    let escapedRequestId = encodeURIComponent(requestId);

    return `${this.baseUrl}/requests/${escapedLibraryCode}/${escapedRequestId}/generatepdf`;
  }

  /**
   * Get history requests
   *
   * @param {any} filterObject
   * @returns {Promise<boolean>}
  */
  async getHistory(filterObject = null): Promise<boolean> {
    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedLibraryCode = encodeURIComponent(libraryCode);

    return new Promise((resolve, reject) => {
      this.http.get<PagedHistory>(`${this.baseUrl}/history/${escapedLibraryCode}`, { params: filterObject, ...this.httpOptions }).subscribe(
        response => {
          this._setObservablePagedHistoryObject(response);
          resolve(true);
        },
        error => {
          console.error(error);
          reject(false);
        }
      );
    });
  }

  /*
  * Download history
  *
  * @param {any} filterObject
  * @returns {Promise<any>}
  */
  async downloadHistory(filterObject = null): Promise<Blob> {
    let libraryCode = this.initData['user']['currentlyAtLibCode'];
    let escapedLibraryCode = encodeURIComponent(libraryCode);

    // Clone the httpOptions object
    let localHttpOptions = {
      ...this.httpOptions,
      headers: this.httpOptions['headers'].set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      responseType: 'blob'
    };

    return new Promise((resolve, reject) => {
      this.http.get<Blob>(`${this.baseUrl}/history/${escapedLibraryCode}/download`, { params: filterObject, ...localHttpOptions, responseType: 'blob' as 'json' }).subscribe(
        response => {
          resolve(response);
        },
        error => {
          console.error(error);
          reject(error);
        }
      );
    });
  }
}


