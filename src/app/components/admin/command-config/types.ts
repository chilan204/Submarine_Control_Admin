export interface CommandCfg {
    id: string;
    keyword: string;
    action: string;
    direction: string;
    hasValue: boolean;
    active: boolean;
}

export interface CommandFormData {
    keyword: string;
    action: string;
    direction: string;
    hasValue: boolean;
    active: boolean;
}
