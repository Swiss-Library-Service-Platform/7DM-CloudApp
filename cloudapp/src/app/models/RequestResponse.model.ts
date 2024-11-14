
import { Request } from './Request.model';

export class RequestResponse {
    request: Request;
    multi_fulfilled_requests: Array<Request>;

    constructor(init?: Partial<RequestResponse>) {
        Object.assign(this, init);
        if (this.request) {
            this.request = new Request(this.request);
        }
        if (this.multi_fulfilled_requests) {
            this.multi_fulfilled_requests = this.multi_fulfilled_requests.map(request => new Request(request));
        }
    }

    public getRequest(): Request {
        return this.request;
    }

    public getMultipleFulfilledRequests(): Array<Request> {
        return this.multi_fulfilled_requests;
    }
}