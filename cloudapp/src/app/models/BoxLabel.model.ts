
export class BoxLabel {
	box_id: string;
    creation_time: Date;
    request_date: Date;
    library: any;
    is_active_box: boolean;
    directories_name: string;
    directories_code: string;

    constructor(init?: Partial<BoxLabel>) {
        Object.assign(this, init);
    }
}