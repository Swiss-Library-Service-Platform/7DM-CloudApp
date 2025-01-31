import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CloudAppEventsService, InitData } from '@exlibris/exl-cloudapp-angular-lib';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BoxLabel } from '../models/BoxLabel.model';
import { PagedHistory } from '../models/PagedHistory.model';
import { Request } from '../models/Request.model';

@Injectable({
  providedIn: 'root'
})
export class BackendService {

  private isDevelopmentEnviroment: boolean = false;
  private isServiceInitialized = false;
  private initData: InitData;
  private baseUrlProd: string = 'https://7dmproxy.swisscovery.network/api/v1';
  private baseUrlLocal: string = 'http://localhost:4201/api/v1';
  private httpOptions: {};

  private readonly _todaysRequestsObject = new BehaviorSubject<Array<Request>>(new Array<Request>());
  private readonly _pagedHistoryObject = new BehaviorSubject<PagedHistory>(null);
  private readonly _unreadErrorHistoryRequests = new BehaviorSubject<Array<Request>>(new Array<Request>());

  constructor(
    private http: HttpClient,
    private eventsService: CloudAppEventsService,
  ) { }

  getTodaysRequestsObject(): Observable<Request[]> {
    return this._todaysRequestsObject.asObservable();
  }

  getPagedHistoryObject(): Observable<PagedHistory> {
    return this._pagedHistoryObject.asObservable();
  }

  getUnreadErrorHistoryRequestsObject(): Observable<Request[]> {
    return this._unreadErrorHistoryRequests.asObservable();
  }

  private _setObservableTodaysRequestsObject(todaysRequests: Array<Request>): void {
    this._todaysRequestsObject.next(todaysRequests);
  }

  private _setObservablePagedHistoryObject(historyRequests: PagedHistory): void {
    this._pagedHistoryObject.next(historyRequests);
  }

  private _setObservableUnreadErrorRequestsObject(unreadErrorRequests: Array<Request>): void {
    this._unreadErrorHistoryRequests.next(unreadErrorRequests);
  }

  private get baseUrl(): string {
    return this.isDevelopmentEnviroment ? this.baseUrlLocal : this.baseUrlProd;
  }

  public getLibraryCode(): string {
    return this.initData.instCode === '41SLSP_NETWORK' ? 'ALL' : this.initData.user.currentlyAtLibCode;
  }

  async init(initData: InitData): Promise<void> {
    if (this.isServiceInitialized) {
      return;
    }
    this.initData = initData;
    let regExp = new RegExp('^.*localhost.*'), // contains "localhost"
      currentUrl = this.initData.urls.alma;
    this.isDevelopmentEnviroment = regExp.test(currentUrl);
    let authToken = await this.eventsService.getAuthToken().toPromise();
    this.httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json'
      }),
      withCredentials: true,
    };
  }

  async checkIfLibaryAllowed(): Promise<boolean> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());

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

  async sendRequestTo7DM(requestId: string, boxId: string): Promise<Request> {
    let escapedRequestId = encodeURIComponent(requestId);
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());
    let escapedBoxId = encodeURIComponent(boxId);

    return new Promise((resolve, reject) => {
      this.http.post<Request>(`${this.baseUrl}/requests/${escapedLibraryCode}`, {
        request_id: escapedRequestId,
        box_id: escapedBoxId
      }, this.httpOptions).subscribe(
        response => {
          this.getRequests();
          resolve(response);
        },
        error => {
          reject(error);
        }
      );
    });
  }

  async retrieveActiveBoxLabel(): Promise<BoxLabel> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());

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

  async generateBoxLabel(): Promise<BoxLabel> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());

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

  async getRequests(searchString: string = null): Promise<boolean> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());

    let params = new HttpParams();
    if (searchString) {
      params = params.set('search', searchString);
    }

    return new Promise((resolve, reject) => {
      this.http.get<Request[]>(`${this.baseUrl}/requests/${escapedLibraryCode}`, { params, ...this.httpOptions }).subscribe(
        response => {
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

  async cancelRequest(requestId: number): Promise<boolean> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());
    let escapedRequestId = encodeURIComponent(requestId);

    return new Promise((resolve, reject) => {
      this.http.delete(`${this.baseUrl}/requests/${escapedLibraryCode}/${escapedRequestId}`, this.httpOptions).subscribe(
        response => {
          this.getRequests();
          resolve(true);
        },
        error => {
          console.error(error);
          reject(false);
        }
      );
    });
  }

  async getBoxLabelPdfUrl(boxId: string): Promise<string> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());
    let escapedBoxId = encodeURIComponent(boxId);

    return `${this.baseUrl}/boxlabels/${escapedLibraryCode}/${escapedBoxId}/generatepdf`;
  }

  async getRequestSlipPdfUrl(requestId: number): Promise<string> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());
    let escapedRequestId = encodeURIComponent(requestId);

    return `${this.baseUrl}/requests/${escapedLibraryCode}/${escapedRequestId}/generatepdf`;
  }

  async getMultiRequestSlipPdfUrl(requestIds: number[]): Promise<string> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());
    let escapedRequestIds = requestIds.map(requestId => encodeURIComponent(requestId)).join(',');

    return `${this.baseUrl}/requests/${escapedLibraryCode}/multi/generatepdf?requestIds=${escapedRequestIds}`;
  }

  async getHistory(filterObject = null, inputCurrentAsDestination = false): Promise<boolean> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());
    let endpointUrl = inputCurrentAsDestination ? `${this.baseUrl}/history/${escapedLibraryCode}/as-destination` : `${this.baseUrl}/history/${escapedLibraryCode}`;

    return new Promise((resolve, reject) => {
      this.http.get<PagedHistory>(endpointUrl, { params: filterObject, ...this.httpOptions }).subscribe(
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

  async getUnreadErrorHistoryRequests(): Promise<boolean> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());

    return new Promise((resolve, reject) => {
      this.http.get<Request[]>(`${this.baseUrl}/history/${escapedLibraryCode}/errors`, this.httpOptions).subscribe(
        response => {
          this._setObservableUnreadErrorRequestsObject(response);
          resolve(true);
        },
        error => {
          console.error(error);
          reject(false);
        }
      );
    });
  }

  async markErrorRequestsAsRead(): Promise<boolean> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());

    return new Promise((resolve, reject) => {
      this.http.post(`${this.baseUrl}/history/${escapedLibraryCode}/errors/read`, null, this.httpOptions).subscribe(
        response => {
          this._setObservableUnreadErrorRequestsObject([]);
          resolve(true);
        },
        error => {
          console.error(error);
          reject(false);
        }
      );
    });
  }

  async downloadHistory(filterObject = null, inputCurrentAsDestination = false): Promise<any> {
    let escapedLibraryCode = encodeURIComponent(this.getLibraryCode());
    let endpointUrl = inputCurrentAsDestination ? `${this.baseUrl}/history/${escapedLibraryCode}/download/as-destination` : `${this.baseUrl}/history/${escapedLibraryCode}/download`;

    let localHttpOptions = {
      ...this.httpOptions,
      headers: this.httpOptions['headers'].set('Accept', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      responseType: 'blob'
    };

    return new Promise((resolve, reject) => {
      this.http.get<Blob>(endpointUrl, { params: filterObject, ...localHttpOptions, responseType: 'blob' as 'json' }).subscribe(
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