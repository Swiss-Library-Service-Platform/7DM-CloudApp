import { RequestInfo } from "./RequestInfo.model";

export class PagedHistory {
    currentPage: number;
    totalPages: number;

    from: number;
    to: number;
    totalResults: number;
    results: RequestInfo[];

    constructor(init?: Partial<PagedHistory>) {
        Object.assign(this, init);
        // Ensure each result is an instance of RequestInfo
        if (this.results) {
            this.results = this.results.map(result => new RequestInfo(result));
        }
    }
}