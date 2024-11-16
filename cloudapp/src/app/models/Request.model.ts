import { BoxLabel } from "./BoxLabel.model";

export class Request {
    id: number;
    internalId: string;
    externalIdPrefix: string;
    externalId: string;
    timestamp: Date;
    destinationLibrary: string;
    destinationDirectoriesCode: string;
    destinationDirectoriesName: string;
    barcode: string;
    type: string;
    box_id: string;
    state: string;
    message: string;
    isNotRs: boolean;
    isOutdated: boolean;
    isMultipleFulfilled: boolean;
    retry: number;

    boxLabel: BoxLabel;

    multi_fulfilled_requests: Array<Request>;

    isDeleting: boolean;
    isSelected: boolean;

    constructor(init?: Partial<Request>) {
        Object.assign(this, init);
        if (this.boxLabel) {
            this.boxLabel = new BoxLabel(this.boxLabel);
        }
        if (this.multi_fulfilled_requests) {
            this.multi_fulfilled_requests = this.multi_fulfilled_requests.map(request => new Request(request));
        }
    }

    public getId(): number {
        return this.id;
    }

    public getInternalIdWithRetry(): string {
        return this.internalId + (this.retry > 0 ? `R${this.retry}` : '');
    }

    public getExternalIdWithPrefix(): string {
        return (this.externalIdPrefix ?? '') + this.externalId ;
    }

    public getMultipleFulfilledRequests(): Array<Request> {
        return this.multi_fulfilled_requests;
    }

    public isFailedUnread(): boolean {
        return this.state === 'FAILED_UNREAD';
    }

    public isRetried() {
        return this.retry > 0;
    }

    public checkForSearch(search: string): boolean {
        // Convert the search term to lowercase
        const lowerSearch = search.toLowerCase();

        // Array of fields to be checked
        const fieldsToSearch = [
            this.internalId,
            this.externalId,
            this.destinationLibrary,
            this.destinationDirectoriesCode,
            this.destinationDirectoriesName,
            this.barcode,
            this.type,
            this.box_id,
            this.state,
            this.message
        ];

        // Check if any of the fields include the search term (case-insensitive)
        return fieldsToSearch.some(field => field?.toLowerCase().includes(lowerSearch));
    }


}