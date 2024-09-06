export class RequestInfo {
    internal_id: string;
    external_id: string;
    timestamp: Date;
    sending_library: string;
    sending_library_alma_code: string;
    sending_library_name: string;
    destination_library: string;
    destination_library_alma_code: string;
    destination_library_name: string;
	barcode: string;
    type: string;
    box_id: string;
    status: string;
    message: string;

    isDeleting: boolean;

    constructor(init?: Partial<RequestInfo>) {
        Object.assign(this, init);
    }

    public checkForSearch(search: string): boolean {
        // Convert the search term to lowercase
        const lowerSearch = search.toLowerCase();
    
        // Array of fields to be checked
        const fieldsToSearch = [
            this.internal_id,
            this.external_id,
            this.sending_library,
            this.sending_library_alma_code,
            this.sending_library_name,
            this.destination_library,
            this.destination_library_alma_code,
            this.destination_library_name,
            this.barcode,
            this.type,
            this.box_id,
            this.status,
            this.message
        ];
    
        // Check if any of the fields include the search term (case-insensitive)
        return fieldsToSearch.some(field => field?.toLowerCase().includes(lowerSearch));
    }
}