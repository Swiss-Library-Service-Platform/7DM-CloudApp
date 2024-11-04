import { BoxLabel } from "./BoxLabel.model";

export class Request {
    internal_id: string;
    external_id: string;
    timestamp: Date;
    sending_library: string;
    destination_library: string;
    destination_directories_code: string;
    destination_directories_name: string;
    barcode: string;
    type: string;
    box_id: string;
    state: string;
    message: string;
    is_not_rs: boolean;
    is_outdated: boolean;
    is_already_sent: boolean;

    box_label: BoxLabel;

    isDeleting: boolean;
    isSelected: boolean;

    constructor(init?: Partial<Request>) {
        Object.assign(this, init);
        if (this.box_label) {
            this.box_label = new BoxLabel(this.box_label);
        }
    }

    public isReady(): boolean {
        return this.state === 'READY';
    }

    public isNotResourceSharing(): boolean {
        return this.is_not_rs;
    }

    public isOutdated(): boolean {
        return this.is_outdated;
    }

    public isAlreadySent(): boolean {
        return this.is_already_sent;
    }

    public isFailedUnread(): boolean {
        return this.state === 'FAILED_UNREAD';
    }

    public checkForSearch(search: string): boolean {
        // Convert the search term to lowercase
        const lowerSearch = search.toLowerCase();

        // Array of fields to be checked
        const fieldsToSearch = [
            this.internal_id,
            this.external_id,
            this.sending_library,
            this.destination_library,
            this.destination_directories_code,
            this.destination_directories_name,
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