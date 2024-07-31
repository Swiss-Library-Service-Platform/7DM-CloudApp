
export interface RequestInfo {
    internal_id: string;
    external_id: string;
    timestamp: Date;
    sending_library: string;
    destination_library: string;
	barcode: string;
    type: string;
    box_id: string;
    status: string;
    message: string;
}