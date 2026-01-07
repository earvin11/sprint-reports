import { ProviderResultEntity } from "./provider-result.entity";

export class ProviderResult implements ProviderResultEntity {
    public result: string;
    public id_roulette: string;
    public id_round: string;
    public date: string;
    public error: string;
    public rpm: string;
    public spin: string;
    public round: number;
    public title?: string;
    public info?: string;

    constructor(data: ProviderResultEntity) {
        this.result = data.result;
        this.id_roulette = data.id_roulette;
        this.id_round = data.id_round;
        this.date = data.date;
        this.error = data.error;
        this.rpm = data.rpm;
        this.spin = data.spin;
        this.round = data.round;
        this.title = data.title;
        this.info = data.info;
    }
}
