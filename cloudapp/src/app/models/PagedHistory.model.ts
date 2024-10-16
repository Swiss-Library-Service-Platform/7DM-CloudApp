import { Request } from "./Request.model";

export class PagedHistory {
    currentPage: number;
    totalPages: number;

    from: number;
    to: number;
    totalResults: number;
    results: Request[];

    constructor(init?: Partial<PagedHistory>) {
        Object.assign(this, init);
        // Ensure each result is an instance of Request
        if (this.results) {
            this.results = this.results.map(result => new Request(result));
        }
    }
}