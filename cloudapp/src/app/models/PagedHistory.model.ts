export class PagedHistory {
    currentPage: number;
    totalPages: number;

    from: number;
    to: number;
    totalResults: number;
    results: RequestInfo[];
}